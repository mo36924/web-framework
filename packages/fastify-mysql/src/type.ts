import type { PoolConfig, PoolConnection } from "mysql";

export type Options = {
  main: PoolConfig;
  replicas: PoolConfig[];
};

export type Query = {
  (sql: string): Promise<Result>;
};

export type Result = any[] & {
  insertId?: number | string;
  affectedRows?: number | string;
  changedRows?: number | string;
};

export type TransactionQuery = Query & {
  connection: null | Promise<PoolConnection>;
  commit(): Promise<void>;
  rollback(): Promise<void>;
};

export type MySQL = {
  query: Query;
  main: TransactionQuery;
  replica: Query;
  escape: (value: any) => string;
  escapeId: (value: any) => string;
};
