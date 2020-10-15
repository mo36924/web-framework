import { it, expect } from "@jest/globals";
import { test, serialize } from "@mo36924/jest-snapshot-serializer-graphql";
import { Source, parse } from "graphql";

it("jest-snapshot-serializer-graphql", () => {
  const gql = "scalar Date type User{id:ID!,name:String createdAt:Date!}";
  const source = new Source("scalar Date type User{id:ID!,name:String createdAt:Date!}");
  const documentNode = parse(gql);

  expect(test(gql as any)).toBeFalsy();
  expect(test(source)).toBeTruthy();
  expect(test(documentNode)).toBeTruthy();

  expect(serialize(source)).toMatchInlineSnapshot(`
    "scalar Date

    type User {
      id: ID!
      name: String
      createdAt: Date!
    }
    "
  `);

  expect(serialize(documentNode)).toMatchInlineSnapshot(`
    "scalar Date

    type User {
      id: ID!
      name: String
      createdAt: Date!
    }
    "
  `);
});
