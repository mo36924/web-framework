import type { GraphQLArgs } from "../type";

export const graphqlQuerystring = ({ query, variables }: GraphQLArgs<any>) => {
  const params: any = { query };

  if (variables) {
    params.variables = JSON.stringify(variables);
  }

  return "" + new URLSearchParams(params);
};
