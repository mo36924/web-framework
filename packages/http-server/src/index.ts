import { createServer, IncomingMessage, ServerResponse } from "http";
import { promisify } from "util";
import createError, { isHttpError } from "http-errors";

export class Request extends IncomingMessage {}
export class Response extends ServerResponse {}
type PromiseOrValue<T> = T | Promise<T>;

export type Plugin<T = any> = (options: T) => MiddlewareFactory;
export type MiddlewareFactory = (server: Server) => PromiseOrValue<void | Middleware>;
export type Middleware = (request: Request, response: Response) => PromiseOrValue<void | false>;

export class Server {
  server = createServer({ IncomingMessage: Request, ServerResponse: Response });
  middlewareFactories: MiddlewareFactory[] = [];
  middleware: Middleware[] = [];
  use = (middlewareFactory: MiddlewareFactory) => {
    this.middlewareFactories.push(middlewareFactory);
  };
  errors: Middleware[] = [];
  errorLength = 0;
  onError = (middleware: Middleware) => {
    this.errors.push(middleware);
  };
  requestListener = async (request: Request, response: Response) => {
    try {
      for (const middleware of this.middleware) {
        let result = middleware(request, response);

        if (result && typeof result.then === "function") {
          result = await result;
        }

        if (result === false || response.writableEnded) {
          return;
        }
      }
    } catch (err) {
      const httpError = isHttpError(err) ? err : createError();

      try {
        for (const error of this.errors) {
          let result = error(request, response);

          if (result && typeof result.then === "function") {
            result = await result;
          }

          if (result === false || response.writableEnded) {
            return;
          }
        }
      } catch {}

      if (!response.headersSent) {
        response.writeHead(httpError.statusCode, httpError.message, httpError.headers);
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
      response.end();
    }
  };
  listen = async (port?: number) => {
    port = port ?? (parseInt(process.env.PORT as any, 10) || 8080);
    const middleware = await Promise.all(this.middlewareFactories.map((middlewareFactory) => middlewareFactory(this)));
    this.middleware = middleware.filter((middleware): middleware is Middleware => !!middleware);
    this.server.on("request", this.requestListener);
    await promisify(this.server.listen).call(this.server, port);
  };
  close = async () => {
    return promisify(this.server.close).call(this.server);
  };
}
