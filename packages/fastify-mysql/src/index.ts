import fp from "fastify-plugin";
import { plugin } from "./plugin";

export type { MySQL, Options, Query, TransactionQuery } from "./type";
export default fp(plugin, { fastify: "3.x", name: "fastify-mysql" });
