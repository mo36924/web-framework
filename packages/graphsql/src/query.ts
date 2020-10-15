export type Query = {
  parent: Query | undefined;
  type: string;
  alias: string;
  fields: { [alias: string]: string | [number, string] | Query };
  where: Where;
  directives: { field?: { name: string }; type?: { name: string } };
  order: string[];
  limit?: number;
  offset?: number;
  list: boolean;
  null: boolean;
};

export type Where = {
  [key: string]: {
    eq?: any;
    ne?: any;
    gt?: any;
    lt?: any;
    ge?: any;
    le?: any;
    in?: any;
    ni?: any;
    li?: any;
    nl?: any;
  };
  not?: any;
  and?: any;
  or?: any;
};

export const query = (): Query => ({
  parent: undefined,
  type: "",
  alias: "",
  fields: Object.create(null),
  where: Object.create(null),
  order: [],
  limit: undefined,
  offset: undefined,
  list: false,
  null: true,
  directives: Object.create(null),
});
