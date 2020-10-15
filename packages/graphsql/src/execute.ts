// Copied from: https://github.com/graphql/graphql-js/blob/v15.3.0/src/execution/execute.js
/* 
MIT License

Copyright (c) GraphQL Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
 */

import {
  FieldNode,
  getNamedType,
  getOperationRootType,
  GraphQLAbstractType,
  GraphQLError,
  GraphQLObjectType,
  GraphQLOutputType,
  GraphQLResolveInfo,
  isAbstractType,
  isLeafType,
  isNamedType,
  isObjectType,
  locatedError,
  OperationDefinitionNode,
} from "graphql";
import {
  assertValidExecutionArguments,
  buildExecutionContext,
  buildResolveInfo,
  collectFields,
  ExecutionArgs,
  ExecutionContext,
  ExecutionResult,
  getFieldDef,
} from "graphql/execution/execute";
import { getArgumentValues } from "graphql/execution/values";
import type { ObjMap } from "graphql/jsutils/ObjMap";
import type { Path } from "graphql/jsutils/Path";
import { addPath, pathToArray } from "graphql/jsutils/Path";
import type { PromiseOrValue } from "graphql/jsutils/PromiseOrValue";
import inspect from "graphql/jsutils/inspect";
import invariant from "graphql/jsutils/invariant";
import isPromise from "graphql/jsutils/isPromise";
import memoize3 from "graphql/jsutils/memoize3";
import promiseReduce from "graphql/jsutils/promiseReduce";
import { fieldResolver as defaultFieldResolver } from "./fieldResolver";
import { query } from "./query";

const isArray: (v: any) => v is readonly any[] = Array.isArray;

export function execute(args: ExecutionArgs): PromiseOrValue<ExecutionResult> {
  return executeImpl(args);
}

export function executeSync(args: ExecutionArgs): ExecutionResult {
  const result = executeImpl(args);

  if (isPromise(result)) {
    throw new Error("GraphQL execution failed to complete synchronously.");
  }

  return result;
}

export function executeImpl(args: ExecutionArgs): PromiseOrValue<ExecutionResult> {
  const {
    schema,
    document,
    rootValue,
    contextValue,
    variableValues,
    operationName,
    fieldResolver,
    typeResolver,
  } = args;

  // If arguments are missing or incorrect, throw an error.
  assertValidExecutionArguments(schema, document, variableValues);

  // If a valid execution context cannot be created due to incorrect arguments,
  // a "Response" with only errors is returned.
  const exeContext = buildExecutionContext(
    schema,
    document,
    rootValue ?? query(),
    contextValue,
    variableValues,
    operationName,
    fieldResolver ?? defaultFieldResolver,
    typeResolver,
  );

  // Return early errors if execution context failed.
  if (isArray(exeContext)) {
    return { errors: exeContext };
  }

  // Return a Promise that will eventually resolve to the data described by
  // The "Response" section of the GraphQL specification.
  //
  // If errors are encountered while executing a GraphQL field, only that
  // field and its descendants will be omitted, and sibling fields will still
  // be executed. An execution which encounters errors will still result in a
  // resolved Promise.
  const result = executeOperation(exeContext, exeContext.operation, exeContext.rootValue);
  return buildResponse(exeContext, result);
}

/**
 * Given a completed execution context and data, build the { errors, data }
 * response defined by the "Response" section of the GraphQL specification.
 */
function buildResponse(exeContext: ExecutionContext, result: PromiseOrValue<void>): PromiseOrValue<ExecutionResult> {
  if (isPromise(result)) {
    return result.then((resolved) => buildResponse(exeContext, resolved));
  }

  const extensions = exeContext;
  const data = exeContext.rootValue;
  return exeContext.errors.length === 0 ? { data, extensions } : { errors: exeContext.errors, data, extensions };
}

/**
 * Implements the "Evaluating operations" section of the spec.
 */
function executeOperation(
  exeContext: ExecutionContext,
  operation: OperationDefinitionNode,
  rootValue: any,
): PromiseOrValue<void> {
  const type = getOperationRootType(exeContext.schema, operation);
  const fields = collectFields(exeContext, type, operation.selectionSet, Object.create(null), Object.create(null));

  const path = undefined;

  // Errors from sub-fields of a NonNull type may propagate to the top level,
  // at which point we still log the error and null the parent field, which
  // in this case is the entire response.
  try {
    const result =
      operation.operation === "mutation"
        ? executeFieldsSerially(exeContext, type, rootValue, path, fields)
        : executeFields(exeContext, type, rootValue, path, fields);

    if (isPromise(result)) {
      return result.then(undefined, (error) => {
        exeContext.errors.push(error);
        return Promise.resolve();
      });
    }
  } catch (error) {
    exeContext.errors.push(error);
  }
}

/**
 * Implements the "Evaluating selection sets" section of the spec
 * for "write" mode.
 */
function executeFieldsSerially(
  exeContext: ExecutionContext,
  parentType: GraphQLObjectType,
  sourceValue: any,
  path: Path | undefined,
  fields: ObjMap<Array<FieldNode>>,
): PromiseOrValue<void> {
  return promiseReduce(
    Object.keys(fields),
    (_, responseName) => {
      const fieldNodes = fields[responseName];
      const fieldPath = addPath(path, responseName, parentType.name);
      const result = resolveField(exeContext, parentType, sourceValue, fieldNodes, fieldPath);

      if (isPromise(result)) {
        return result;
      }
    },
    undefined,
  );
}

/**
 * Implements the "Evaluating selection sets" section of the spec
 * for "read" mode.
 */
function executeFields(
  exeContext: ExecutionContext,
  parentType: GraphQLObjectType,
  sourceValue: any,
  path: Path | undefined,
  fields: ObjMap<Array<FieldNode>>,
): PromiseOrValue<void> {
  const results: Promise<void>[] = [];

  for (const responseName of Object.keys(fields)) {
    const fieldNodes = fields[responseName];
    const fieldPath = addPath(path, responseName, parentType.name);
    const result = resolveField(exeContext, parentType, sourceValue, fieldNodes, fieldPath);

    if (isPromise(result)) {
      results.push(result);
    }
  }

  // If there are no promises, we can just return the object
  if (results.length === 0) {
    return;
  }

  // Otherwise, results is a map from field name to the result of resolving that
  // field, which is possibly a promise. Return a promise that will return this
  // same map, but with any promises replaced with the values they resolved to.
  return Promise.all(results).then();
}

/**
 * Resolves the field on the given source object. In particular, this
 * figures out the value that the field returns by calling its resolve function,
 * then calls completeValue to complete promises, serialize scalars, or execute
 * the sub-selection-set for objects.
 */
function resolveField(
  exeContext: ExecutionContext,
  parentType: GraphQLObjectType,
  source: any,
  fieldNodes: ReadonlyArray<FieldNode>,
  path: Path,
): PromiseOrValue<void> {
  const fieldNode = fieldNodes[0];
  const fieldName = fieldNode.name.value;

  const fieldDef = getFieldDef(exeContext.schema, parentType, fieldName);

  if (!fieldDef) {
    return;
  }

  const returnType = fieldDef.type;
  const resolveFn = exeContext.fieldResolver;

  const info = buildResolveInfo(exeContext, fieldDef, fieldNodes, parentType, path);

  // Get the resolve function, regardless of if its result is normal or abrupt (error).
  try {
    // Build a JS object of arguments from the field.arguments AST, using the
    // variables scope to fulfill any variable references.
    // TODO: find a way to memoize, in case this field is within a List type.
    const args = getArgumentValues(fieldDef, fieldNodes[0], exeContext.variableValues);

    // The resolve function's optional third argument is a context value that
    // is provided to every resolve function within an execution. It is commonly
    // used to represent an authenticated user, or request-specific caches.
    const contextValue = exeContext.contextValue;

    const result = resolveFn(source, args, contextValue, info);

    let completed;

    if (isPromise(result)) {
      completed = result.then((resolved) => completeValue(exeContext, returnType, fieldNodes, info, path, resolved));
    } else {
      completed = completeValue(exeContext, returnType, fieldNodes, info, path, result);
    }

    if (isPromise(completed)) {
      // Note: we don't rely on a `catch` method, but we do expect "thenable"
      // to take a second callback for the error case.
      return completed.then(undefined, (rawError) => {
        const error = locatedError(rawError, fieldNodes, pathToArray(path));
        exeContext.errors.push(error);
      });
    }
  } catch (rawError) {
    const error = locatedError(rawError, fieldNodes, pathToArray(path));
    exeContext.errors.push(error);
  }
}

function completeValue(
  exeContext: ExecutionContext,
  returnType: GraphQLOutputType,
  fieldNodes: ReadonlyArray<FieldNode>,
  info: GraphQLResolveInfo,
  path: Path,
  result: any,
): PromiseOrValue<void> {
  // If result is an Error, throw a located error.
  if (result instanceof Error) {
    throw result;
  }

  const namedType = getNamedType(returnType);

  // If field type is a leaf type, Scalar or Enum, serialize to a valid value,
  // returning null if serialization is not possible.
  if (isLeafType(namedType)) {
    return;
  }

  // If field type is an abstract type, Interface or Union, determine the
  // runtime Object type and complete for that type.
  if (isAbstractType(namedType)) {
    return completeAbstractValue(exeContext, namedType, fieldNodes, info, path, result);
  }

  // If field type is Object, execute and complete all sub-selections.
  // istanbul ignore else (See: 'https://github.com/graphql/graphql-js/issues/2618')
  if (isObjectType(namedType)) {
    return completeObjectValue(exeContext, namedType, fieldNodes, info, path, result);
  }

  // istanbul ignore next (Not reachable. All possible output types have been considered)
  invariant(false, "Cannot complete value of unexpected output type: " + inspect(returnType));
}

/**
 * Complete a value of an abstract type by determining the runtime object type
 * of that value, then complete the value for that type.
 */
function completeAbstractValue(
  exeContext: ExecutionContext,
  returnType: GraphQLAbstractType,
  fieldNodes: ReadonlyArray<FieldNode>,
  info: GraphQLResolveInfo,
  path: Path,
  result: any,
): PromiseOrValue<void> {
  const resolveTypeFn = returnType.resolveType ?? (exeContext as any).typeResolver;
  const contextValue = exeContext.contextValue;
  const runtimeType = resolveTypeFn(result, contextValue, info, returnType);

  if (isPromise(runtimeType)) {
    return runtimeType.then((resolvedRuntimeType) =>
      completeObjectValue(
        exeContext,
        ensureValidRuntimeType(resolvedRuntimeType, exeContext, returnType, fieldNodes, info, result),
        fieldNodes,
        info,
        path,
        result,
      ),
    );
  }

  return completeObjectValue(
    exeContext,
    ensureValidRuntimeType(runtimeType, exeContext, returnType, fieldNodes, info, result),
    fieldNodes,
    info,
    path,
    result,
  );
}

function ensureValidRuntimeType(
  runtimeTypeOrName: any,
  exeContext: ExecutionContext,
  returnType: GraphQLAbstractType,
  fieldNodes: ReadonlyArray<FieldNode>,
  info: GraphQLResolveInfo,
  result: any,
): GraphQLObjectType {
  if (runtimeTypeOrName == null) {
    throw new GraphQLError(
      `Abstract type "${returnType.name}" must resolve to an Object type at runtime for field "${info.parentType.name}.${info.fieldName}". Either the "${returnType.name}" type should provide a "resolveType" function or each possible type should provide an "isTypeOf" function.`,
      fieldNodes,
    );
  }

  // FIXME: temporary workaround until support for passing object types would be removed in v16.0.0
  const runtimeTypeName = isNamedType(runtimeTypeOrName) ? runtimeTypeOrName.name : runtimeTypeOrName;

  if (typeof runtimeTypeName !== "string") {
    throw new GraphQLError(
      `Abstract type "${returnType.name}" must resolve to an Object type at runtime for field "${info.parentType.name}.${info.fieldName}" with ` +
        `value ${inspect(result)}, received "${inspect(runtimeTypeOrName)}".`,
    );
  }

  const runtimeType = exeContext.schema.getType(runtimeTypeName);

  if (runtimeType == null) {
    throw new GraphQLError(
      `Abstract type "${returnType.name}" was resolve to a type "${runtimeTypeName}" that does not exist inside schema.`,
      fieldNodes,
    );
  }

  if (!isObjectType(runtimeType)) {
    throw new GraphQLError(
      `Abstract type "${returnType.name}" was resolve to a non-object type "${runtimeTypeName}".`,
      fieldNodes,
    );
  }

  if (!exeContext.schema.isSubType(returnType, runtimeType)) {
    throw new GraphQLError(
      `Runtime Object type "${runtimeType.name}" is not a possible type for "${returnType.name}".`,
      fieldNodes,
    );
  }

  return runtimeType;
}

function completeObjectValue(
  exeContext: ExecutionContext,
  returnType: GraphQLObjectType,
  fieldNodes: ReadonlyArray<FieldNode>,
  info: GraphQLResolveInfo,
  path: Path,
  result: any,
): PromiseOrValue<void> {
  return collectAndExecuteSubfields(exeContext, returnType, fieldNodes, path, result);
}

function collectAndExecuteSubfields(
  exeContext: ExecutionContext,
  returnType: GraphQLObjectType,
  fieldNodes: ReadonlyArray<FieldNode>,
  path: Path,
  result: any,
): PromiseOrValue<void> {
  // Collect sub-fields to execute to complete this value.
  const subFieldNodes = collectSubfields(exeContext, returnType, fieldNodes);
  return executeFields(exeContext, returnType, result, path, subFieldNodes);
}

/**
 * A memoized collection of relevant subfields with regard to the return
 * type. Memoizing ensures the subfields are not repeatedly calculated, which
 * saves overhead when resolving lists of values.
 */
const collectSubfields = memoize3(_collectSubfields);

function _collectSubfields(
  exeContext: ExecutionContext,
  returnType: GraphQLObjectType,
  fieldNodes: ReadonlyArray<FieldNode>,
): ObjMap<Array<FieldNode>> {
  let subFieldNodes = Object.create(null);
  const visitedFragmentNames = Object.create(null);

  for (const node of fieldNodes) {
    if (node.selectionSet) {
      subFieldNodes = collectFields(exeContext, returnType, node.selectionSet, subFieldNodes, visitedFragmentNames);
    }
  }

  return subFieldNodes;
}
