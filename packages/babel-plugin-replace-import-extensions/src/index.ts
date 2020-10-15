import type { default as babel, NodePath, PluginObj, types as t } from "@babel/core";

export default function babelPluginReplaceImportExtensions(
  { types: t }: typeof babel,
  options: { [ext: string]: string },
): PluginObj {
  const extEntries = Object.entries(options);

  const replaceImportExtension = (path: string) => {
    for (const [ext, replaceExt] of extEntries) {
      if (path.endsWith(ext)) {
        return path.slice(0, -ext.length) + replaceExt;
      }
    }
  };

  const transformDeclaration = (
    path: NodePath<t.ImportDeclaration> | NodePath<t.ExportAllDeclaration> | NodePath<t.ExportNamedDeclaration>,
  ) => {
    const source = path.get("source");

    if (Array.isArray(source) || !source.isStringLiteral()) {
      return;
    }

    const importPath = replaceImportExtension(source.node.value);

    if (!importPath) {
      return;
    }

    source.replaceWith(t.stringLiteral(importPath));
  };

  return {
    name: "replace-import-extensions",
    visitor: {
      ImportDeclaration: transformDeclaration,
      ExportAllDeclaration: transformDeclaration,
      ExportNamedDeclaration: transformDeclaration,
      CallExpression(path) {
        if (!path.get("callee").isImport()) {
          return;
        }

        const arg = path.get("arguments.0");

        if (Array.isArray(arg) || !arg.isStringLiteral()) {
          return;
        }

        const importPath = replaceImportExtension(arg.node.value);

        if (!importPath) {
          return;
        }

        arg.replaceWith(t.stringLiteral(importPath));
      },
    },
  };
}
