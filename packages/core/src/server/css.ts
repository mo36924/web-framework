import { createObjectNull } from "../util/createObjectNull";
import { createClassName } from "./createClassName";
import { classes } from "./store";

type Values = (string | number | (() => string))[];

let i = 0;

export const styles: {
  [className: string]: [cacheKey: string, styles: [modern: string, module: string, nomodule: string]];
} = createObjectNull();

export const css = (((cssFactory: (className: string, ...values: Values) => any, cacheKey: string) => (
  ...values: Values
) => {
  const _cacheKey = values.length
    ? cacheKey + JSON.stringify(values.map((value) => (typeof value === "function" ? value() : value)))
    : cacheKey;

  let className = classes[_cacheKey];

  if (!className) {
    className = classes[_cacheKey] = createClassName(i++);
    styles[className] = [_cacheKey, cssFactory(className, ...values).map((rules: string[]) => rules.join(""))];
  }

  return className;
}) as any) as (strings: TemplateStringsArray, ...values: Values) => string;
