import { resolve } from "url";
import nodeFetch, { RequestInfo, RequestInit, Response } from "node-fetch";
import { baseUrl } from "../env";

export const fetch = (url: RequestInfo, init?: RequestInit): Promise<Response> => {
  if (typeof url === "string") {
    url = resolve(baseUrl, url);
  } else if ("url" in url) {
    url.url = resolve(baseUrl, url.url);
  }

  return nodeFetch(url, init);
};

export { Headers, Request, Response } from "node-fetch";
export type { RequestInfo, RequestInit };
