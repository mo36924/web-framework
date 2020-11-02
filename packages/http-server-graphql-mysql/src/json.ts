import type { Response } from "@mo36924/http-server";

export function json(this: Response, data: any) {
  const extensions = data.extensions;

  if (extensions && extensions.encoding && extensions.chunk) {
    this.setHeader("Content-Encoding", extensions.encoding);
    this.setHeader("Content-Type", "application/json; charset=utf-8");
    this.setHeader("Content-Length", String(extensions.chunk.length));
    this.end(extensions.chunk);
  } else {
    const chunk = Buffer.from(JSON.stringify(data), "utf8");
    this.setHeader("Content-Type", "application/json; charset=utf-8");
    this.setHeader("Content-Length", String(chunk.length));
    this.end(chunk);
  }
}
