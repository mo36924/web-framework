import { getTypes, Fields } from "./types";
import { createObject } from "./util";

export const {
  BaseType: { fields: baseTypeFields },
  BaseJoinType: { fields: baseJoinTypeFields },
} = getTypes(`
type BaseType {
  id: Int!
  version: Int!
  createdAt: Date!
  updatedAt: Date!
}
type BaseJoinType {
  id: Int!
}
`);
