import type { FieldDirectives, Where } from "@mo36924/graphql-schema";
import { camelCase, noCase } from "change-case";
import {
  getDirectiveValues,
  getNamedType,
  getNullableType,
  GraphQLResolveInfo,
  isListType,
  isScalarType,
} from "graphql";
import { escape, escapeId } from "sqlstring";
import type { Context } from "./context";

export async function fieldResolver(source: any, args: any, context: Context, info: GraphQLResolveInfo) {
  if (info.operation.operation === "mutation" && info.parentType === info.schema.getMutationType()) {
  }

  const nullableType = getNullableType(info.returnType);
  const namedType = getNamedType(nullableType);

  if (isScalarType(namedType)) {
    return source[info.fieldName];
  }

  const { where, order, limit, offset } = args;
  const { field, type }: FieldDirectives = getFieldDirectives(info);
  const table = namedType.name;
  let sql = `select * from ${escapeId(table)}`;
  const _where = whereStringify(where);

  if (field) {
    if (!_where) {
      sql += ` where ${escapeId(field.key)} = ${escape(source.id)}`;
    } else {
      sql += ` where ${escapeId(field.key)} = ${escape(source.id)} and ${_where}`;
    }
  } else if (type) {
    const result = await context.query(
      `select ${escapeId(type.keys[1])} as id from ${escapeId(type.name)} where ${escapeId(type.keys[0])} = ${escape(
        source.id,
      )}`,
    );

    if (result.length === 0) {
      return [];
    }

    const ids = result.map((row) => row.id);

    if (!_where) {
      sql += ` where id in (${escape(ids)})`;
    } else {
      sql += ` where id in (${escape(ids)}) and ${_where}`;
    }
  } else if (_where) {
    sql += ` where ${_where}`;
  }

  const _order = orderStringify(order);

  if (_order) {
    sql += ` order by ${_order}`;
  }

  if (limit != null) {
    sql += ` limit ${escape(limit)}`;
  }

  if (offset != null) {
    sql += ` offset ${escape(offset)}`;
  }

  const result = await context.query(sql);
  return isListType(nullableType) ? result : result[0];
}

function getFieldDirectives(info: GraphQLResolveInfo) {
  const directives = Object.create(null);
  const fieldDef = info.parentType.getFields()[info.fieldName]?.astNode!;

  for (const directive of fieldDef?.directives ?? []) {
    directives[directive.name.value] = getDirectiveValues(info.schema.getDirective(directive.name.value)!, fieldDef);
  }

  return directives;
}

function whereStringify(where: Where | null | undefined) {
  if (!where) {
    return "";
  }

  const { not, and, or, ...args } = where;
  let predicates: string[] = [];

  for (const [field, ops] of Object.entries(args)) {
    for (const [op, value] of Object.entries(ops)) {
      if (value === null) {
        switch (op) {
          case "eq":
            predicates.push(`${escapeId(field)} is null`);
            break;
          case "ne":
            predicates.push(`${escapeId(field)} is not null`);
            break;
        }

        continue;
      }

      switch (op) {
        case "eq":
          predicates.push(`${escapeId(field)} = ${escape(value)}`);
          break;
        case "ne":
          predicates.push(`${escapeId(field)} <> ${escape(value)}`);
          break;
        case "gt":
          predicates.push(`${escapeId(field)} > ${escape(value)}`);
          break;
        case "lt":
          predicates.push(`${escapeId(field)} < ${escape(value)}`);
          break;
        case "ge":
          predicates.push(`${escapeId(field)} >= ${escape(value)}`);
          break;
        case "le":
          predicates.push(`${escapeId(field)} <= ${escape(value)}`);
          break;
        case "in":
          predicates.push(`${escapeId(field)} in (${escape(value)})`);
          break;
        case "ni":
          predicates.push(`${escapeId(field)} not in (${escape(value)})`);
          break;
        case "li":
          predicates.push(`${escapeId(field)} like ${escape(value)}`);
          break;
        case "nl":
          predicates.push(`${escapeId(field)} not like ${escape(value)}`);
          break;
      }

      continue;
    }
  }

  const _not = whereStringify(not);

  if (_not) {
    predicates.push(`not ${_not}`);
  }

  const _and = whereStringify(and);

  if (_and) {
    predicates.push(_and);
  }

  if (predicates.length) {
    predicates = [`${predicates.join(" and ")}`];
  }

  const _or = whereStringify(or);

  if (_or) {
    predicates.push(`${_or}`);
  }

  if (!predicates.length) {
    return "";
  }

  return `(${predicates.join(" or ")})`;
}

function orderStringify(order?: string[]) {
  if (!order) {
    return "";
  }

  return order
    .map((order) => {
      const [, p1, p2] = order.match(
        /^(.*?)_(ASC|DESC|ASC_NULLS_FIRST|ASC_NULLS_LAST|DESC_NULLS_FIRST|DESC_NULLS_LAST)$/,
      )!;

      const column = camelCase(p1);
      const sort = noCase(p2);
      return `${escapeId(column)} ${sort}`;
    })
    .join();
}
