import { relative, dirname } from "path";
import type { Node, SourceFile, TransformerFactory, ResolvedModuleFull, StringLiteralLike } from "typescript";
import { ts } from "./tsc";

type ResolvedModules = Map<string, ResolvedModuleFull>;
type _Node = Node;

declare module "typescript" {
  interface SourceFile {
    resolvedModules: ResolvedModules;
  }
  function isImportKeyword(node: _Node): boolean;
}

function relativeResolveModuleSpecifier(sf: SourceFile, path: string) {
  if (!path.startsWith(".")) {
    return;
  }

  const resolvedModule = sf.resolvedModules.get(path);

  if (!resolvedModule) {
    return;
  }

  let moduleSpecifier = relative(dirname(sf.fileName), resolvedModule.resolvedFileName);

  if (!moduleSpecifier.startsWith(".")) {
    moduleSpecifier = `./${moduleSpecifier}`;
  }

  return moduleSpecifier;
}

export const relativeResolveTransformerFactory: TransformerFactory<SourceFile> = (ctx) => (sf) => {
  if (sf.isDeclarationFile) {
    return sf;
  }

  return ts.visitNode(sf, function visitor(node): Node {
    let moduleSpecifier;

    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      (moduleSpecifier = relativeResolveModuleSpecifier(sf, node.moduleSpecifier.text))
    ) {
      if (ts.isImportDeclaration(node)) {
        return ctx.factory.updateImportDeclaration(
          node,
          node.decorators,
          node.modifiers,
          node.importClause,
          ctx.factory.createStringLiteral(moduleSpecifier),
        );
      } else {
        return ctx.factory.updateExportDeclaration(
          node,
          node.decorators,
          node.modifiers,
          node.isTypeOnly,
          node.exportClause,
          ctx.factory.createStringLiteral(moduleSpecifier),
        );
      }
    }

    if (
      ts.isCallExpression(node) &&
      ts.isImportKeyword(node.expression) &&
      node.arguments.length === 1 &&
      ts.isStringLiteralLike(node.arguments[0]) &&
      (moduleSpecifier = relativeResolveModuleSpecifier(sf, (node.arguments[0] as StringLiteralLike).text))
    ) {
      return ctx.factory.updateCallExpression(node, node.expression, node.typeArguments, [
        ctx.factory.createStringLiteral(moduleSpecifier),
      ]);
    }

    return ts.visitEachChild(node, visitor, ctx);
  });
};
