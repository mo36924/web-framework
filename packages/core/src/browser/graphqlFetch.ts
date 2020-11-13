import type { ExecutionResult } from "graphql";
import { fetch, RequestInfo, RequestInit } from "./fetch";

export const graphqlFetch = (url: RequestInfo, init?: RequestInit): Promise<ExecutionResult> =>
  fetch(url, init)
    .then((res) => res.json())
    .catch((error) => ({
      errors: [{ message: `${error}` }],
    }));
