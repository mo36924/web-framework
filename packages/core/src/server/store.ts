import { createObjectNull } from "../util/createObjectNull";

export type Store = {
  classes: {
    [cacheKey: string]: string;
  };
  graphql: {
    [query: string]: any;
  };
};

export const classes: { [cacheKey: string]: string } = createObjectNull();
export const graphql: { [query: string]: any } = createObjectNull();
