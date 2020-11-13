import { storeId } from "../env";
import { createObject } from "../util/createObject";
import { getElementById } from "./getElementById";

export type Store = {
  classes?: {
    [cacheKey: string]: string;
  };
  graphql?: {
    [query: string]: any;
  };
};

const store: Store = JSON.parse(getElementById(storeId).innerHTML);

export const classes: { [cacheKey: string]: string } = createObject(store.classes);
export const graphql: { [query: string]: any } = createObject(store.graphql);
