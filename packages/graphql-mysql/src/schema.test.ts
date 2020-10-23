import { expect, it } from "@jest/globals";
import { schema } from "@mo36924/graphql-schema";
import { schema as mysqlSchema } from "./schema";

it("mysql-schema", () => {
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

  const sql = mysqlSchema(schema(gql));

  expect(sql).toMatchInlineSnapshot(`
    "create table \`User\` (
      \`id\` int not null auto_increment primary key,
      \`version\` int not null,
      \`createdAt\` datetime(3) not null default current_timestamp(3),
      \`updatedAt\` datetime(3) not null default current_timestamp(3) on update current_timestamp(3),
      \`name\` longtext not null,
      \`classId\` int
    );
    create table \`Profile\` (
      \`id\` int not null auto_increment primary key,
      \`version\` int not null,
      \`createdAt\` datetime(3) not null default current_timestamp(3),
      \`updatedAt\` datetime(3) not null default current_timestamp(3) on update current_timestamp(3),
      \`age\` int,
      \`userId\` int
    );
    create table \`Class\` (
      \`id\` int not null auto_increment primary key,
      \`version\` int not null,
      \`createdAt\` datetime(3) not null default current_timestamp(3),
      \`updatedAt\` datetime(3) not null default current_timestamp(3) on update current_timestamp(3),
      \`name\` longtext not null
    );
    create table \`Club\` (
      \`id\` int not null auto_increment primary key,
      \`version\` int not null,
      \`createdAt\` datetime(3) not null default current_timestamp(3),
      \`updatedAt\` datetime(3) not null default current_timestamp(3) on update current_timestamp(3),
      \`name\` longtext not null
    );
    create table \`ClubToUser\` (
      \`id\` int not null auto_increment primary key,
      \`clubId\` int not null,
      \`userId\` int not null
    );
    alter table \`Profile\` add unique (\`userId\`);
    alter table \`User\` add foreign key (\`classId\`) references \`Class\` (\`id\`);
    alter table \`Profile\` add foreign key (\`userId\`) references \`User\` (\`id\`);
    alter table \`ClubToUser\` add foreign key (\`clubId\`) references \`Club\` (\`id\`);
    alter table \`ClubToUser\` add foreign key (\`userId\`) references \`User\` (\`id\`);
    "
  `);
});
