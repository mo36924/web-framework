import { MiddlewareFactory, Request } from "@mo36924/http-server";
import { createPoolCluster, Pool, PoolConfig, PoolConnection } from "mysql";

declare module "@mo36924/http-server" {
  interface Request {
    _mysql: null | MySQL;
    mysql: MySQL;
    mysqlCommit: () => Promise<void> | undefined;
    mysqlRollback: () => Promise<void> | undefined;
  }
}

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
  replica: Query;
  _main: null | TransactionQuery;
  main: TransactionQuery;
};

export default (options: Options): MiddlewareFactory => async (server) => {
  const poolCluster = createPoolCluster();
  poolCluster.add("main", options.main);
  let i = 1;

  for (const replica of options.replicas) {
    poolCluster.add(`replica${i++}`, replica);
  }

  const mainPool = poolCluster.of("main");
  const replicaPool = poolCluster.of("replica*");
  const query = createQuery(mainPool);
  const replica = createQuery(replicaPool);

  Object.defineProperties(Request.prototype, {
    _mysql: {
      value: null,
    },
    mysql: {
      get(this: Request) {
        if (this._mysql === null) {
          this._mysql = {
            query,
            replica,
            _main: null,
            get main() {
              if (this._main === null) {
                this._main = createTransactionQuery(mainPool);
              }

              return this._main;
            },
          };
        }

        return this._mysql;
      },
    },
    mysqlCommit: {
      value: function (this: Request) {
        return this._mysql?._main?.commit();
      },
    },
    mysqlRollback: {
      value: function (this: Request) {
        return this._mysql?._main?.rollback();
      },
    },
  });

  server.onError((request, _response) => request.mysqlRollback());
};

function createQuery(pool: Pool): Query {
  return (sql: string) =>
    new Promise((resolve, reject) => pool.query(sql, (err, results) => (err ? reject(err) : resolve(results))));
}

function createTransactionQuery(pool: Pool): TransactionQuery {
  const transactionQuery: TransactionQuery = async (sql: string) => {
    const connection = await (transactionQuery.connection ??= new Promise((resolve, reject) =>
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }

        connection.beginTransaction((err) => {
          if (err) {
            connection.release();
            reject(err);
            return;
          }

          resolve(connection);
        });
      }),
    ));

    return new Promise((resolve, reject) =>
      connection.query(sql, (err, results) => (err ? reject(err) : resolve(results))),
    );
  };

  transactionQuery.connection = null;

  transactionQuery.commit = async () => {
    if (!transactionQuery.connection) {
      return;
    }

    const connection = await transactionQuery.connection;
    await new Promise((resolve, reject) => connection.commit((err) => (err ? reject(err) : resolve())));
    connection.release();
    transactionQuery.connection = null;
  };

  transactionQuery.rollback = async () => {
    if (!transactionQuery.connection) {
      return;
    }

    const connection = await transactionQuery.connection;
    await new Promise((resolve, reject) => connection.rollback((err) => (err ? reject(err) : resolve())));
    connection.release();
    transactionQuery.connection = null;
  };

  return transactionQuery;
}
