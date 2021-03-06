import { it, expect } from "@jest/globals";
import { buildASTSchema, DocumentNode, print, parse } from "graphql";
import { schema } from "./schema";

it("graphql-schema", () => {
  const gql = `
    type User {
      name: String!
      profile: Profile
      class: Class!
      clubs: [Club!]!
    }
    type Profile {
      age: Int
    }
    type Class {
      name: String!
      users: [User!]!
    }
    type Club {
      name: String!
      users: [User!]!
    }
  `;

  const schemaGql = schema(gql);
  const documentNode = parse(schemaGql);
  buildASTSchema(documentNode);

  expect(documentNode).toMatchInlineSnapshot(`
    scalar Date

    directive @join on OBJECT

    directive @unique on FIELD_DEFINITION

    directive @key(name: String!) on FIELD_DEFINITION

    directive @ref(name: String!) on FIELD_DEFINITION

    directive @field(name: String!, key: String!) on FIELD_DEFINITION

    directive @type(name: String!, keys: [String!]!) on FIELD_DEFINITION

    type Query {
      user(where: WhereUser, order: [OrderUser!], offset: Int): User
      users(where: WhereUser, order: [OrderUser!], limit: Int, offset: Int): [User!]!
      profile(where: WhereProfile, order: [OrderProfile!], offset: Int): Profile
      profiles(where: WhereProfile, order: [OrderProfile!], limit: Int, offset: Int): [Profile!]!
      class(where: WhereClass, order: [OrderClass!], offset: Int): Class
      classes(where: WhereClass, order: [OrderClass!], limit: Int, offset: Int): [Class!]!
      club(where: WhereClub, order: [OrderClub!], offset: Int): Club
      clubs(where: WhereClub, order: [OrderClub!], limit: Int, offset: Int): [Club!]!
    }

    type Mutation {
      create(data: CreateData!): Boolean
      update(data: UpdateData!): Boolean
      delete(data: DeleteData!): Boolean
    }

    type User {
      id: Int!
      version: Int!
      createdAt: Date!
      updatedAt: Date!
      name: String!
      profile: Profile @field(name: "user", key: "userId")
      class: Class @key(name: "classId")
      clubs(where: WhereClub, order: [OrderClub!], limit: Int, offset: Int): [Club!]! @type(name: "ClubToUser", keys: ["userId", "clubId"])
      classId: Int @ref(name: "Class")
    }

    type Profile {
      id: Int!
      version: Int!
      createdAt: Date!
      updatedAt: Date!
      age: Int
      user: User @key(name: "userId")
      userId: Int @ref(name: "User") @unique
    }

    type Class {
      id: Int!
      version: Int!
      createdAt: Date!
      updatedAt: Date!
      name: String!
      users(where: WhereUser, order: [OrderUser!], limit: Int, offset: Int): [User!]! @field(name: "class", key: "classId")
    }

    type Club {
      id: Int!
      version: Int!
      createdAt: Date!
      updatedAt: Date!
      name: String!
      users(where: WhereUser, order: [OrderUser!], limit: Int, offset: Int): [User!]! @type(name: "ClubToUser", keys: ["clubId", "userId"])
    }

    type ClubToUser @join {
      id: Int!
      clubId: Int! @ref(name: "Club")
      userId: Int! @ref(name: "User")
    }

    input CreateData {
      user: CreateDataUser
      users: [CreateDataUser!]
      profile: CreateDataProfile
      profiles: [CreateDataProfile!]
      class: CreateDataClass
      classes: [CreateDataClass!]
      club: CreateDataClub
      clubs: [CreateDataClub!]
    }

    input UpdateData {
      user: UpdateDataUser
      users: [UpdateDataUser!]
      profile: UpdateDataProfile
      profiles: [UpdateDataProfile!]
      class: UpdateDataClass
      classes: [UpdateDataClass!]
      club: UpdateDataClub
      clubs: [UpdateDataClub!]
    }

    input DeleteData {
      user: DeleteDataUser
      users: [DeleteDataUser!]
      profile: DeleteDataProfile
      profiles: [DeleteDataProfile!]
      class: DeleteDataClass
      classes: [DeleteDataClass!]
      club: DeleteDataClub
      clubs: [DeleteDataClub!]
    }

    input CreateDataUser {
      name: String!
      profile: CreateDataProfile
      class: CreateDataClass
      clubs: [CreateDataClub!]
    }

    input CreateDataProfile {
      age: Int
      user: CreateDataUser
    }

    input CreateDataClass {
      name: String!
      users: [CreateDataUser!]
    }

    input CreateDataClub {
      name: String!
      users: [CreateDataUser!]
    }

    input UpdateDataUser {
      id: Int!
      version: Int!
      name: String
      profile: UpdateDataProfile
      class: UpdateDataClass
      clubs: [UpdateDataClub!]
    }

    input UpdateDataProfile {
      id: Int!
      version: Int!
      age: Int
      user: UpdateDataUser
    }

    input UpdateDataClass {
      id: Int!
      version: Int!
      name: String
      users: [UpdateDataUser!]
    }

    input UpdateDataClub {
      id: Int!
      version: Int!
      name: String
      users: [UpdateDataUser!]
    }

    input DeleteDataUser {
      id: Int!
      version: Int!
      profile: DeleteDataProfile
      class: DeleteDataClass
      clubs: [DeleteDataClub!]
    }

    input DeleteDataProfile {
      id: Int!
      version: Int!
      user: DeleteDataUser
    }

    input DeleteDataClass {
      id: Int!
      version: Int!
      users: [DeleteDataUser!]
    }

    input DeleteDataClub {
      id: Int!
      version: Int!
      users: [DeleteDataUser!]
    }

    input WhereUser {
      id: WhereInt
      version: WhereInt
      createdAt: WhereDate
      updatedAt: WhereDate
      name: WhereString
      classId: WhereInt
      and: [WhereUser!]
      or: [WhereUser!]
      not: WhereUser
    }

    input WhereProfile {
      id: WhereInt
      version: WhereInt
      createdAt: WhereDate
      updatedAt: WhereDate
      age: WhereInt
      userId: WhereInt
      and: [WhereProfile!]
      or: [WhereProfile!]
      not: WhereProfile
    }

    input WhereClass {
      id: WhereInt
      version: WhereInt
      createdAt: WhereDate
      updatedAt: WhereDate
      name: WhereString
      and: [WhereClass!]
      or: [WhereClass!]
      not: WhereClass
    }

    input WhereClub {
      id: WhereInt
      version: WhereInt
      createdAt: WhereDate
      updatedAt: WhereDate
      name: WhereString
      and: [WhereClub!]
      or: [WhereClub!]
      not: WhereClub
    }

    input WhereID {
      eq: ID
      ne: ID
      gt: ID
      lt: ID
      ge: ID
      le: ID
      in: [ID]
      ni: [ID]
      li: String
      nl: String
    }

    input WhereInt {
      eq: Int
      ne: Int
      gt: Int
      lt: Int
      ge: Int
      le: Int
      in: [Int]
      ni: [Int]
      li: String
      nl: String
    }

    input WhereFloat {
      eq: Float
      ne: Float
      gt: Float
      lt: Float
      ge: Float
      le: Float
      in: [Float]
      ni: [Float]
      li: String
      nl: String
    }

    input WhereString {
      eq: String
      ne: String
      gt: String
      lt: String
      ge: String
      le: String
      in: [String]
      ni: [String]
      li: String
      nl: String
    }

    input WhereBoolean {
      gt: Boolean
      lt: Boolean
      ge: Boolean
      le: Boolean
      in: [Boolean]
      ni: [Boolean]
      li: String
      nl: String
    }

    input WhereDate {
      eq: Date
      ne: Date
      gt: Date
      lt: Date
      ge: Date
      le: Date
      in: [Date]
      ni: [Date]
      li: String
      nl: String
    }

    enum OrderUser {
      ID_ASC
      ID_DESC
      VERSION_ASC
      VERSION_DESC
      CREATED_AT_ASC
      CREATED_AT_DESC
      UPDATED_AT_ASC
      UPDATED_AT_DESC
      NAME_ASC
      NAME_DESC
      CLASS_ID_ASC
      CLASS_ID_DESC
      CLASS_ID_ASC_NULLS_FIRST
      CLASS_ID_ASC_NULLS_LAST
      CLASS_ID_DESC_NULLS_FIRST
      CLASS_ID_DESC_NULLS_LAST
    }

    enum OrderProfile {
      ID_ASC
      ID_DESC
      VERSION_ASC
      VERSION_DESC
      CREATED_AT_ASC
      CREATED_AT_DESC
      UPDATED_AT_ASC
      UPDATED_AT_DESC
      AGE_ASC
      AGE_DESC
      AGE_ASC_NULLS_FIRST
      AGE_ASC_NULLS_LAST
      AGE_DESC_NULLS_FIRST
      AGE_DESC_NULLS_LAST
      USER_ID_ASC
      USER_ID_DESC
      USER_ID_ASC_NULLS_FIRST
      USER_ID_ASC_NULLS_LAST
      USER_ID_DESC_NULLS_FIRST
      USER_ID_DESC_NULLS_LAST
    }

    enum OrderClass {
      ID_ASC
      ID_DESC
      VERSION_ASC
      VERSION_DESC
      CREATED_AT_ASC
      CREATED_AT_DESC
      UPDATED_AT_ASC
      UPDATED_AT_DESC
      NAME_ASC
      NAME_DESC
    }

    enum OrderClub {
      ID_ASC
      ID_DESC
      VERSION_ASC
      VERSION_DESC
      CREATED_AT_ASC
      CREATED_AT_DESC
      UPDATED_AT_ASC
      UPDATED_AT_DESC
      NAME_ASC
      NAME_DESC
    }

  `);
});
