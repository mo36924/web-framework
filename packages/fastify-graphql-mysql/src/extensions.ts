import type { IncomingMessage } from "http";
import type { RequestInfo } from "express-graphql";

export async function extensions(info: RequestInfo) {
  const mysql = (info.context as IncomingMessage).mysql;
  const result = info.result;

  if (result.errors?.length) {
    await mysql.main.rollback();
  } else {
    await mysql.main.commit();
  }

  return undefined;
}
