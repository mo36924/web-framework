import { expect, it } from "@jest/globals";
import { schema } from "@mo36924/graphql-schema";
import { data } from "./data";

it("mysql-data", () => {
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

  const sql = data(schema(gql));

  expect(sql).toMatchInlineSnapshot(`
    "set foreign_key_checks=0;
    insert into \`User\` (\`id\`,\`version\`,\`createdAt\`,\`updatedAt\`,\`name\`,\`classId\`) values 
    (1,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000','name-1',1),
    (2,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000','name-2',2),
    (3,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000','name-3',3),
    (4,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000','name-4',1),
    (5,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000','name-5',2),
    (6,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000','name-6',3),
    (7,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000','name-7',1),
    (8,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000','name-8',2),
    (9,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000','name-9',3);
    insert into \`Profile\` (\`id\`,\`version\`,\`createdAt\`,\`updatedAt\`,\`age\`,\`userId\`) values 
    (1,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000',0,1),
    (2,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000',0,2),
    (3,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000',0,3),
    (4,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000',0,4),
    (5,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000',0,5),
    (6,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000',0,6),
    (7,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000',0,7),
    (8,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000',0,8),
    (9,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000',0,9);
    insert into \`Class\` (\`id\`,\`version\`,\`createdAt\`,\`updatedAt\`,\`name\`) values 
    (1,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000','name-1'),
    (2,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000','name-2'),
    (3,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000','name-3');
    insert into \`Club\` (\`id\`,\`version\`,\`createdAt\`,\`updatedAt\`,\`name\`) values 
    (1,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000','name-1'),
    (2,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000','name-2'),
    (3,1,'1970-01-01 09:00:00.000','1970-01-01 09:00:00.000','name-3');
    insert into \`ClubToUser\` (\`id\`,\`clubId\`,\`userId\`) values 
    (1,1,1),
    (2,2,2),
    (3,3,3),
    (4,1,4),
    (5,2,5),
    (6,3,6),
    (7,1,7),
    (8,2,8),
    (9,3,9),
    (10,1,1),
    (11,2,2),
    (12,3,3),
    (13,1,4),
    (14,2,5),
    (15,3,6),
    (16,1,7),
    (17,2,8),
    (18,3,9),
    (19,1,1),
    (20,2,2),
    (21,3,3),
    (22,1,4),
    (23,2,5),
    (24,3,6),
    (25,1,7),
    (26,2,8),
    (27,3,9);
    set foreign_key_checks=1;
    "
  `);
});
