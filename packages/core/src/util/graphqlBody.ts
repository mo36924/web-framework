import type { GraphQLArgs } from "../type";

export const graphqlBody = ({ query, variables }: GraphQLArgs<any>) => JSON.stringify({ query, variables });
