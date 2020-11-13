import { createObject } from "./createObject";

export const memoizeObject = <K extends string | number | symbol, V>(
  fn: (arg: K) => V,
  cache: { [key in string | number | symbol]: V } = createObject(),
) => (arg: K) => (arg in cache ? cache[arg] : (cache[arg] = fn(arg)));
