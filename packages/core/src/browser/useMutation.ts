import { useCallback, useState } from "preact/hooks";
import type { UseMutation, UseMutationReturnType } from "../type";
import { graphqlBody } from "../util/graphqlBody";
import { graphqlPost } from "./graphqlPost";

export const useMutation: UseMutation = (args: any): UseMutationReturnType<any> => {
  const [result, setResult] = useState({});

  const callback = useCallback(() => {
    setResult({ loading: true });
    graphqlPost(graphqlBody(args)).then((result) => setResult(result));
  }, [args]);

  return [callback, result];
};
