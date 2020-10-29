import { execSync } from "child_process";
import { promisify } from "util";
import { afterAll, beforeAll, expect, it, jest } from "@jest/globals";
import { data as mysqlData, schema as mysqlSchema } from "@mo36924/graphql-mysql";
import { model as graphqlModel, schema as graphqlSchema } from "@mo36924/graphql-schema";
import { buildSchema, graphql } from "graphql";
import { ConnectionConfig, createPool, Pool } from "mysql";
import { fieldResolver } from "./fieldResolver";

const user = "root";
const password = "password";
const database = "test";

const connectConfig: ConnectionConfig = {
  user,
  password,
  database,
  multipleStatements: true,
};

let pool: Pool;

jest.setTimeout(60 * 1000);

beforeAll(async () => {
  execSync(
    `docker run --name mysql -d -e MYSQL_ROOT_PASSWORD=${password} -e MYSQL_DATABASE=${database} -p 3306:3306 mysql --default-authentication-plugin=mysql_native_password`,
  );

  pool = createPool(connectConfig);

  while (true) {
    try {
      await promisify(pool.getConnection).bind(pool)();
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
});

afterAll(() => {
  execSync("docker stop mysql");
  execSync("docker rm -v mysql");
  pool?.end?.();
});

it("mysql-graphql", async () => {
  const _graphqlSchema = graphqlSchema(
    graphqlModel(`
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
    `),
  );

  const _mysqlSchema = mysqlSchema(_graphqlSchema);
  const _mysqlData = mysqlData(_graphqlSchema);

  const query = promisify(pool.query).bind(pool);

  await query(_mysqlSchema);
  await query(_mysqlData);

  const result = await graphql({
    schema: buildSchema(_graphqlSchema),
    source: `
      {
        users(where: {id: {eq: 1}}){
          id
          name
          clubs {
            name
          }
        }
      }
    `,
    contextValue: { query },
    fieldResolver: fieldResolver,
  });

  expect(result).toMatchInlineSnapshot(`
    Object {
      "data": Object {
        "users": Array [
          Object {
            "clubs": Array [
              Object {
                "name": "name-1",
              },
            ],
            "id": 1,
            "name": "name-1",
          },
        ],
      },
    }
  `);
});
