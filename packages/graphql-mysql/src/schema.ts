import { createObject, getTypes } from "@mo36924/graphql-schema";
import { escapeId } from "sqlstring";

const dbTypes = createObject<{ [key: string]: string }>({
  ID: "int",
  Int: "int",
  Float: "float",
  String: "longtext",
  Boolean: "boolean",
  Date: "datetime(3)",
});

export const schema = (schema: string) => {
  const { Query, Mutation, ...types } = getTypes(schema);
  const create: string[] = [];
  const unique: string[] = [];
  const foreignKeys: string[] = [];

  for (const [typeName, type] of Object.entries(types)) {
    const { fields } = type;
    const columns: string[] = [];

    for (const [fieldName, field] of Object.entries(fields)) {
      const {
        type: fieldTypeName,
        list,
        null: _null,
        scalar,
        directives: { ref: refDirective, unique: uniqueDirective },
      } = field;

      if (scalar) {
        const dbType = dbTypes[fieldTypeName];

        switch (fieldName) {
          case "id":
            columns.push(`${escapeId(fieldName)} ${dbType} not null auto_increment primary key`);
            break;
          case "version":
            columns.push(`${escapeId(fieldName)} ${dbType} not null`);
            break;
          case "createdAt":
            columns.push(`${escapeId(fieldName)} ${dbType} not null default current_timestamp(3)`);
            break;
          case "updatedAt":
            columns.push(
              `${escapeId(fieldName)} ${dbType} not null default current_timestamp(3) on update current_timestamp(3)`,
            );

            break;
          default:
            columns.push(`${escapeId(fieldName)} ${dbType}${_null ? "" : " not null"}`);
            break;
        }
      }

      if (uniqueDirective) {
        unique.push(`alter table ${escapeId(typeName)} add unique (${escapeId(fieldName)});\n`);
      }

      if (refDirective) {
        foreignKeys.push(
          `alter table ${escapeId(typeName)} add foreign key (${escapeId(fieldName)}) references ${escapeId(
            refDirective.name,
          )} (${escapeId("id")});\n`,
        );
      }
    }

    create.push(`create table ${escapeId(typeName)} (\n${columns.map((column) => `  ${column}`).join(",\n")}\n);\n`);
  }

  return create.join("") + unique.join("") + foreignKeys.join("");
};
