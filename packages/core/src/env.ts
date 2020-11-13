import "./type";

export const isServer = typeof global === "object";
export const storeId = typeof __STORE_ID__ === "string" ? __STORE_ID__ : "store";
export const rootId = typeof __ROOT_ID__ === "string" ? __ROOT_ID__ : "root";
export const styleId = typeof __STYLE_ID__ === "string" ? __STYLE_ID__ : "style";
export const baseUrl =
  typeof __BASE_URL__ === "string" ? __BASE_URL__ : isServer ? "http://127.0.0.1" : location.origin;
export const graphqlEndpoint = typeof __GRAPHQL_ENDPOINT__ === "string" ? __GRAPHQL_ENDPOINT__ : baseUrl + "/graphql";
