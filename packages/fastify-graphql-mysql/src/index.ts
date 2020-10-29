import fp from "fastify-plugin";
import { plugin } from "./plugin";

export default fp(plugin, {
  fastify: "3.x",
  name: "fastify-graphql-mysql",
  decorators: { request: ["accepts", "mysql"] },
  dependencies: ["fastify-accepts", "fastify-mysql"],
});
