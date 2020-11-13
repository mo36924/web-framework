import { useContext, useMemo } from "preact/hooks";
import type { UseQuery } from "../type";
import { graphqlQuerystring } from "../util/graphqlQuerystring";
import { context } from "./context";
import { graphqlGet } from "./graphqlGet";

export const useQuery: UseQuery = (args: any) => {
  const queryString = graphqlQuerystring(args);
  const graphql = useContext(context).graphql;

  const result = (graphql[queryString] ||= graphqlGet(queryString).then((result) => (graphql[queryString] = result)));

  if (typeof result.then === "function") {
    throw result;
  }

  return result;
};
