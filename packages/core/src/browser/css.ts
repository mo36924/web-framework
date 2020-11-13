import { styleId } from "../env";
import { getElementById } from "./getElementById";
import { classes } from "./store";

type Values = (string | number | (() => string | number))[];

let i = 0;
const sheet = (getElementById(styleId) as HTMLStyleElement).sheet!;

export const css = (((cssFactory: (className: string, ...values: Values) => any, cacheKey: string) => (
  ...values: Values
) => {
  const _cacheKey = values.length
    ? cacheKey + JSON.stringify(values.map((value) => (typeof value === "function" ? value() : value)))
    : cacheKey;

  let className = classes[_cacheKey];

  if (!className) {
    className = classes[_cacheKey] = "_" + i++;
    cssFactory(className, ...values).forEach((rule: string) => sheet.insertRule(rule, sheet.cssRules.length));
  }

  return className;
}) as any) as (strings: TemplateStringsArray, ...values: Values) => string;
