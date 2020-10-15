declare module "graphql/jsutils/ObjMap" {
  export type ObjMap<T> = { [key: string]: T };
}
declare module "graphql/jsutils/isPromise" {
  export default function isPromise(value: any): value is Promise<any>;
}
declare module "graphql/jsutils/promiseReduce" {
  import type { PromiseOrValue } from "graphql/jsutils/PromiseOrValue";
  export default function promiseReduce<T, U>(
    values: ReadonlyArray<T>,
    callback: (U, T) => PromiseOrValue<U>,
    initialValue: PromiseOrValue<U>,
  ): PromiseOrValue<U>;
}
declare module "graphql/jsutils/promiseForObject" {
  import type { ObjMap } from "graphql/jsutils/ObjMap";
  export default function promiseForObject<T>(object: ObjMap<Promise<T>>): Promise<ObjMap<T>>;
}
declare module "graphql/jsutils/inspect" {
  export default function inspect(value: any): string;
}
declare module "graphql/jsutils/invariant" {
  export default function invariant(condition: any, message?: string): void;
}
declare module "graphql/jsutils/isCollection" {
  export default function isCollection(obj: any): boolean;
}
declare module "graphql/jsutils/memoize3" {
  export default function memoize3<
    A1 extends ReadonlyArray<any>,
    A2 extends ReadonlyArray<any>,
    A3 extends ReadonlyArray<any>,
    R extends any
  >(fn: (A1, A2, A3) => R): (A1, A2, A3) => R;
}
