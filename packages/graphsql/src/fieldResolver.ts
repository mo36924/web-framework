import {
  getDirectiveValues,
  getNamedType,
  getNullableType,
  GraphQLResolveInfo,
  isListType,
  isObjectType,
  isScalarType,
} from "graphql";
import { Query, query } from "./query";

function getFieldDirectives(info: GraphQLResolveInfo) {
  const directives = Object.create(null);
  const fieldDef = info.parentType.getFields()[info.fieldName].astNode!;

  for (const directive of fieldDef.directives ?? []) {
    directives[directive.name.value] = getDirectiveValues(info.schema.getDirective(directive.name.value)!, fieldDef);
  }

  return directives;
}

export function fieldResolver(source: Query, args: any, context: any, info: GraphQLResolveInfo) {
  const alias = info.path.key;
  const returnType = info.returnType;
  const nullableType = getNullableType(returnType);
  const namedType = getNamedType(nullableType);

  if (isScalarType(namedType)) {
    source.fields[alias] = info.fieldName;
    return;
  }

  if (isObjectType(namedType)) {
    const fieldQuery = (source.fields[alias] = query());
    fieldQuery.parent = source;
    fieldQuery.type = namedType.name;
    fieldQuery.where = args.where ?? Object.create(null);
    fieldQuery.order = args.order ?? [];
    fieldQuery.limit = args.limit ?? undefined;
    fieldQuery.offset = args.offset ?? undefined;

    if (returnType !== nullableType) {
      fieldQuery.null = false;
    }

    if (isListType(nullableType)) {
      fieldQuery.list = true;
    } else {
      fieldQuery.limit = 1;
    }

    fieldQuery.directives = getFieldDirectives(info);
    return fieldQuery;
  }
}
