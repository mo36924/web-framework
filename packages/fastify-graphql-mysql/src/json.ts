import { promisify } from "util";
import { brotliCompress, gzip, constants } from "zlib";
import type { FastifyReply, FastifyRequest } from "fastify";
import type {} from "fastify-accepts";

const brotliCompressAsync = promisify(brotliCompress);
const gzipAsync = promisify(gzip);

export async function json(request: FastifyRequest, reply: FastifyReply, result: any) {
  const encoding = request.encodings(["br", "gzip"]);
  const response = reply.raw;
  const data = JSON.stringify(result);
  let chunk = Buffer.from(data, "utf8");

  try {
    switch (encoding) {
      case "br":
        chunk = await brotliCompressAsync(chunk, {
          params: {
            [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT,
            [constants.BROTLI_PARAM_QUALITY]: 5,
            [constants.BROTLI_PARAM_SIZE_HINT]: chunk.length,
          },
        });

        response.setHeader("Content-Encoding", encoding);
        break;
      case "gzip":
        chunk = await gzipAsync(chunk, { level: 8 });
        response.setHeader("Content-Encoding", encoding);
        break;
    }
  } catch {}

  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Content-Length", String(chunk.length));
  response.end(chunk);
}
