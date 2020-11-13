import { graphqlEndpoint } from "../env";
import { graphqlFetch } from "./graphqlFetch";

export const graphqlGet = (queryString: string) => graphqlFetch(`${graphqlEndpoint}?${queryString}`);
