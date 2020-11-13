import { useEffect, useMemo, useState } from "preact/hooks";
import type { UseQuery } from "../type";
import { graphqlQuerystring } from "../util/graphqlQuerystring";
import { graphqlGet } from "./graphqlGet";
import { graphql } from "./store";

export const useQuery: UseQuery = (args: any) => {
  const queryString = graphqlQuerystring(args);
  const [result, setResult] = useState(graphql[queryString]);

  useEffect(() => {
    result || graphqlGet(queryString).then(setResult);
  }, [result, queryString]);

  return result || { loading: true };
};
