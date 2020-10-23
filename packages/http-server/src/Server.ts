import { createServer, STATUS_CODES } from "http";
import { promisify } from "util";
import { Context } from "./Context";
import { HttpError } from "./HttpError";
import { Request } from "./Request";
import { Response } from "./Response";

const defaultPort = parseInt(process.env.PORT as any, 10) || 8080;

export interface Middleware {
  (context: Context): void | Promise<void>;
}
export type MiddlewareFactory = (server: Server) => Promise<void | Middleware>;
export class Server {
  server = createServer({ IncomingMessage: Request, ServerResponse: Response });
  middlewareFactory: MiddlewareFactory[] = [];
  middleware: Middleware[] = [];
  use = (middlewareFactory: MiddlewareFactory) => {
    this.middlewareFactory.push(middlewareFactory);
  };
  requestListener = async (request: Request, response: Response) => {
    const context = new Context(request, response);

    try {
      for (const middleware of this.middleware) {
        const result = middleware(context);

        if (result && typeof result.then === "function") {
          await result;
        }

        if (response.writableEnded) {
          return;
        }
      }
    } catch (err) {
      const httpError = err instanceof HttpError ? err : new HttpError();

      if (!response.headersSent) {
        response.writeHead(httpError.statusCode, httpError.statusMessage, httpError.headers);
      }

      if (!response.writableEnded) {
        response.end(httpError.body);
      }

      return;
    }

    if (!response.headersSent) {
      response.statusCode = 404;
    }

    if (!response.writableEnded) {
      response.end(`${response.statusCode} ${STATUS_CODES[response.statusCode] ?? ""}`);
    }
  };
  async listen(port = defaultPort) {
    this.middleware = (
      await Promise.all(this.middlewareFactory.map((middlewareFactory) => middlewareFactory(this)))
    ).filter((middleware): middleware is Middleware => !!middleware);

    this.server.on("request", this.requestListener);
    await promisify(this.server.listen).call(this.server, port);
  }
  async close() {
    const promise = promisify(this.server.close).bind(this.server)();
    this.server.emit("close");
    await promise;
  }
}
