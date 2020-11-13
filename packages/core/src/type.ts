import type {} from "preact";
import type { GraphQLError, ExecutionResult } from "graphql";

declare module "preact" {
  namespace JSX {
    interface HTMLAttributes {
      noModule?: boolean;
    }
  }
}

declare global {
  interface Window {
    onchangestate?: null | ((this: Window, ev: Event) => any);
  }
  interface WindowEventMap {
    changestate: Event;
  }
  const { __PROD__, __DEV__, __TEST__, __NODE__, __MODERN__, __MODULE__, __NOMODULE__ }: { [key: string]: boolean };
  const {
    __STORE_ID__,
    __ROOT_ID__,
    __STYLE_ID__,
    __BASE_URL__,
    __GRAPHQL_ENDPOINT__,
  }: { [key: string]: string | undefined };
}

export interface GraphQL {
  default: [values: any[], data: { [key: string]: any }];
}

type GraphQLKeys = keyof GraphQL;

export type GraphQLArgs<T> = { query: string; variables?: T };

type ResultType<T extends GraphQLKeys> = ExecutionResult<GraphQL[T][1]> & { loading?: boolean };

export type UseQuery = {
  <T extends GraphQLKeys>(strings: TemplateStringsArray, ...values: GraphQL[T][0]): ResultType<T>;
  <T extends GraphQLKeys>(args: GraphQLArgs<GraphQL[T][0]>): ResultType<T>;
};

export type UseMutationReturnType<T extends GraphQLKeys> = [() => void, ResultType<T>];

export type UseMutation = {
  <T extends GraphQLKeys>(strings: TemplateStringsArray, ...values: GraphQL[T][0]): UseMutationReturnType<T>;
  <T extends GraphQLKeys>(args: GraphQLArgs<GraphQL[T][0]>): UseMutationReturnType<T>;
};
