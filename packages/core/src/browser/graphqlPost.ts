import { graphqlEndpoint } from "../env";
import { graphqlFetch } from "./graphqlFetch";

export const graphqlPost = (body: string) =>
  graphqlFetch(graphqlEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body });
