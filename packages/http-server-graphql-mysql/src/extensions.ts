import { promisify } from "util";
import { brotliCompress, constants, gzip } from "zlib";
import type { Request } from "@mo36924/http-server";
import accepts from "accepts";
import type { RequestInfo } from "express-graphql";

const brotliCompressAsync = promisify(brotliCompress);
const gzipAsync = promisify(gzip);

export async function extensions(info: RequestInfo) {
  const result = info.result;
  const request: Request = info.context as any;

  if (result.errors?.length) {
    await request.mysqlRollback();
  } else {
    await request.mysqlCommit();
  }

  const encoding = accepts(request).encodings(["br", "gzip"]);
  const data = JSON.stringify(result);
  let chunk = Buffer.from(data, "utf8");

  switch (encoding) {
    case "br":
      chunk = await brotliCompressAsync(chunk, {
        params: {
          [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
          [constants.BROTLI_PARAM_QUALITY]: 5,
          [constants.BROTLI_PARAM_SIZE_HINT]: chunk.length,
        },
      });

      break;
    case "gzip":
      chunk = await gzipAsync(chunk, { level: 8 });
      break;
  }

  return { chunk, encoding };
}
