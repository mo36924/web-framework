import type { Pool } from "mysql";
import { createPoolCluster, escape, escapeId } from "mysql";
import type { MySQL, Options, TransactionQuery } from "./type";

export function mysql(opts: Options): MySQL {
  const poolCluster = createPoolCluster();
  poolCluster.add("main", opts.main);
  let i = 1;

  for (const replica of opts.replicas) {
    poolCluster.add(`replica${i++}`, replica);
  }

  const mainPool = poolCluster.of("main");
  const replicaPool = poolCluster.of("replica*");

  return {
    query: createQuery(mainPool),
    main: createTransactionQuery(mainPool),
    replica: createQuery(replicaPool),
    escape,
    escapeId,
  };
}

export function createQuery(pool: Pool) {
  return (sql: string) =>
    new Promise<any>((resolve, reject) => pool.query(sql, (err, results) => (err ? reject(err) : resolve(results))));
}

export function createTransactionQuery(pool: Pool): TransactionQuery {
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
