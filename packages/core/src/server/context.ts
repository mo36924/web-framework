import { Context, createContext } from "preact";
import { createObjectNull } from "../util/createObjectNull";

export type Value = {
  url: string;
  type: "modern" | "module" | "nomodule";
  src: string;
  classes: {
    [cacheKey: string]: string;
  };
  graphql: {
    [query: string]: any;
  };
  prepass?: boolean;
};
export const defaultValue = (): Value => ({
  url: "/",
  type: "module",
  src: "module.js",
  classes: createObjectNull(),
  graphql: createObjectNull(),
  prepass: true,
});
export const context: Context<Value> = (createContext as any)();
export const { Provider, Consumer } = context;
