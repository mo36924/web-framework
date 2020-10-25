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
    callback: (u: U, t: T) => PromiseOrValue<U>,
    initialValue: PromiseOrValue<U>,
  ): PromiseOrValue<U>;
}
declare module "graphql/jsutils/promiseForObject" {
  type ObjMap<T> = { [key: string]: T };
  export default function promiseForObject<T>(object: ObjMap<Promise<T>>): Promise<ObjMap<T>>;
}
declare module "graphql/jsutils/devAssert" {
  export default function devAssert(condition: any, message: string): void;
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
declare module "graphql/jsutils/isObjectLike" {
  export default function isObjectLike(value: any): boolean;
}
declare module "graphql/jsutils/memoize3" {
  export default function memoize3<A1, A2, A3, R>(fn: (a1: A1, a2: A2, a3: A3) => R): (a1: A1, a2: A2, a3: A3) => R;
}
declare module "graphql/polyfills/arrayFrom" {
  const arrayFrom: typeof Array.from;
  export default arrayFrom;
}
