// Copied from: https://github.com/graphql/graphql-js/blob/v15.3.0/src/graphql.js
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

import { ExecutionResult, GraphQLArgs, parse, validate, validateSchema } from "graphql";
import type { PromiseOrValue } from "graphql/jsutils/PromiseOrValue";
import isPromise from "graphql/jsutils/isPromise";
import { execute } from "./execute";

export function graphql(args: GraphQLArgs): Promise<ExecutionResult> {
  return new Promise((resolve) => resolve(graphqlImpl(args)));
}

export function graphqlSync(args: GraphQLArgs): ExecutionResult {
  const result = graphqlImpl(args);

  if (isPromise(result)) {
    throw new Error("GraphQL execution failed to complete synchronously.");
  }

  return result;
}

function graphqlImpl(args: GraphQLArgs): PromiseOrValue<ExecutionResult> {
  const { schema, source, rootValue, contextValue, variableValues, operationName, fieldResolver, typeResolver } = args;

  // Validate Schema
  const schemaValidationErrors = validateSchema(schema);

  if (schemaValidationErrors.length > 0) {
    return { errors: schemaValidationErrors };
  }

  // Parse
  let document;

  try {
    document = parse(source);
  } catch (syntaxError) {
    return { errors: [syntaxError] };
  }

  // Validate
  const validationErrors = validate(schema, document);

  if (validationErrors.length > 0) {
    return { errors: validationErrors };
  }

  // Execute
  return execute({
    schema,
    document,
    rootValue,
    contextValue,
    variableValues,
    operationName,
    fieldResolver,
    typeResolver,
  });
}
