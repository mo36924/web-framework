import { getTypes, Types, createObject } from "@mo36924/graphql-schema";
import { escape, escapeId } from "sqlstring";

const defaultScalarValues = createObject<{ [key: string]: any }>({
  ID: "",
  Int: 0,
  Float: 0,
  String: "",
  Boolean: true,
  Date: new Date(0),
});

const getInsertQueries = (types: Types, baseRecordCount = 3) => {
  const recordCounts = createObject<{ [typeName: string]: number }>();

  const getRecordCount = (dep: string, deps: string[] = []): number => {
    if (deps.includes(dep)) {
      return 0;
    }

    if (recordCounts[dep]) {
      return recordCounts[dep];
    }

    const fields = types[dep].fields;

    const recordCount = Math.max(
      baseRecordCount,
      ...Object.values(fields).map(({ directives: { ref, unique } }) =>
        ref ? getRecordCount(ref.name, [dep, ...deps]) * (unique ? 1 : baseRecordCount) : 0,
      ),
    );

    recordCounts[dep] = recordCount;
    return recordCount;
  };

  const getInsertQuery = (typeName: string) => {
    const recordCount = getRecordCount(typeName);
    const fieldEntries = Object.entries(types[typeName].fields).filter(([, field]) => field.scalar);
    const fieldNames = fieldEntries.map(([fieldName]) => escapeId(fieldName));
    const valuesList: string[] = [];

    for (let i = 0; i < recordCount; i++) {
      const values: string[] = [];

      for (const [fieldName, field] of fieldEntries) {
        const {
          type: fieldType,
          directives: { ref },
        } = field;

        const defaultValue = defaultScalarValues[fieldType];
        let value: any;

        if (fieldName === "id") {
          value = i + 1;
        } else if (fieldName === "version") {
          value = 1;
        } else if (ref) {
          value = (i % getRecordCount(ref.name)) + 1;
        } else if (typeof defaultValue === "string") {
          value = `${fieldName}-${i + 1}`;
        } else {
          value = defaultValue;
        }

        values.push(escape(value));
      }

      valuesList.push(`(${values.join()})`);
    }

    return `insert into ${escapeId(typeName)} (${fieldNames.join()}) values \n${valuesList.join(",\n")};\n`;
  };

  return Object.keys(types).map(getInsertQuery).join("");
};

export const data = (schema: string) => {
  const { Query, Mutation, ...types } = getTypes(schema);
  let sql = "";
  sql += `set foreign_key_checks=0;\n`;
  sql += getInsertQueries(types);
  sql += `set foreign_key_checks=1;\n`;
  return sql;
};
