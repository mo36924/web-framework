import type { MySQL } from "@mo36924/fastify-mysql";
import { graphqlHTTP, OptionsData } from "express-graphql";
import type { FastifyPluginAsync } from "fastify";
import { extensions } from "./extensions";
import { json } from "./json";

declare module "http" {
  interface IncomingMessage {
    mysql: MySQL;
  }
  interface ServerResponse {
    json: (data: any) => void;
  }
}

export const plugin: FastifyPluginAsync<OptionsData> = async (fastify, opts) => {
  const graphqlMiddleware = graphqlHTTP({ ...opts, extensions });

  fastify.addHook("onRequest", (request, reply, next) => {
    if (request.url === "/graphql" || request.url.startsWith("/graphql?")) {
      request.raw.mysql = request.mysql;
      reply.raw.json = json.bind(null, request, reply);

      // TODO next(err)
      graphqlMiddleware(request.raw, reply.raw).catch(() => next());
    } else {
      next();
    }
  });
};
