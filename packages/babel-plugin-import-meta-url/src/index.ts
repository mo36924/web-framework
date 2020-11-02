import type { default as babel, PluginObj } from "@babel/core";

export default function babelPluginImportMetaUrl({ types: t, template }: typeof babel): PluginObj {
  const node = template.expression.ast('require("url").pathToFileURL(__filename)');
  return {
    name: "import-meta-url",
    visitor: {
      MemberExpression(path) {
        if (path.get("object").isMetaProperty() && path.get("property").isIdentifier({ name: "url" })) {
          path.replaceWith(t.cloneDeep(node));
        }
      },
    },
  };
}
