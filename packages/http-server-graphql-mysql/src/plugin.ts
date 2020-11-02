import { MiddlewareFactory, Response, Plugin } from "@mo36924/http-server";
import { graphqlHTTP, OptionsData } from "express-graphql";
import { extensions } from "./extensions";
import { json } from "./json";

export const plugin: Plugin<OptionsData> = (options) => (_server) => {
  if (!options.pretty) {
    options.extensions = extensions;
    (Response.prototype as any).json = json;
  }

  const middleware = graphqlHTTP(options);

  return (request, response) => {
    if (request.url && (request.url === "/graphql" || request.url.startsWith("/graphql?"))) {
      return middleware(request, response);
    }
  };
};
