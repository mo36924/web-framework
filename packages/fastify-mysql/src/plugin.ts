import type { FastifyPluginCallback } from "fastify";
import { mysql } from "./mysql";
import type { MySQL, Options } from "./type";

declare module "fastify" {
  interface FastifyRequest {
    readonly mysql: MySQL;
  }
}

export const plugin: FastifyPluginCallback<Options> = (fastify, opts, next) => {
  fastify.decorateRequest("mysql", mysql(opts));

  fastify.addHook("onError", (request, _reply, _error, done) => {
    if (request.mysql.main.connection) {
      request.mysql.main.rollback().then(
        () => done(),
        () => done(),
      );
    } else {
      done();
    }
  });

  fastify.addHook("onSend", (request, reply, payload, done) => {
    if (request.mysql.main.connection) {
      request.mysql.main.commit().then(
        () => done(null, payload),
        () => {
          reply.code(500);
          done(null, "");
        },
      );
    } else {
      done(null, payload);
    }
  });

  next();
};
