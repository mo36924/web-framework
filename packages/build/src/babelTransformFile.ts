import { basename } from "path";
import { transformAsync, transformFromAstAsync } from "@babel/core";
import babelPluginTransformModulesCommonjs from "@babel/plugin-transform-modules-commonjs";
import babelPresetEnv from "@babel/preset-env";
import babelPresetReact from "@babel/preset-react";
import babelPluginImportMetaUrl from "@mo36924/babel-plugin-import-meta-url";
import babelPluginReplaceImportExtensions from "@mo36924/babel-plugin-replace-import-extensions";
import { addSourceMappingURL } from "./addSourceMappingURL";
import { scriptRegExp } from "./config";
import { outFilePath } from "./outFilePath";
import { writeFile } from "./writeFile";

const sourceMapComment = "//# sourceMappingURL=data:application/json;base64,";
const sourceMapCommentLength = sourceMapComment.length;

export async function babelTransformFile(path: string, data: string) {
  const sourceMapCommentIndex = data.lastIndexOf(sourceMapComment);

  const sourceMap = JSON.parse(
    Buffer.from(data.slice(sourceMapCommentIndex + sourceMapCommentLength), "base64").toString(),
  );

  data = data.slice(0, sourceMapCommentIndex);

  const module = await transformAsync(data, {
    babelrc: false,
    configFile: false,
    sourceType: "module",
    sourceMaps: true,
    inputSourceMap: sourceMap,
    ast: true,
    filename: path,
    presets: [
      [babelPresetEnv, { modules: false, targets: { node: true }, bugfixes: true }],
      [babelPresetReact, { runtime: "automatic", useSpread: true }],
    ],
    plugins: [[babelPluginReplaceImportExtensions, { ".ts": ".mjs", ".tsx": ".mjs" }]],
  });

  const commonjs = await transformFromAstAsync(module!.ast!, data, {
    babelrc: false,
    configFile: false,
    sourceType: "module",
    sourceMaps: true,
    inputSourceMap: sourceMap,
    filename: path,
    plugins: [
      babelPluginImportMetaUrl,
      [babelPluginReplaceImportExtensions, { ".mjs": ".js" }],
      babelPluginTransformModulesCommonjs,
    ],
  });

  path = outFilePath(path);
  const modulePath = path.replace(scriptRegExp, ".mjs");
  const moduleMapPath = `${modulePath}.map`;
  const commonjsPath = path.replace(scriptRegExp, ".js");
  const commonjsMapPath = `${commonjsPath}.map`;

  module!.map!.file = basename(modulePath);
  module!.map!.sources[0] = `../src/${module!.map!.sources[0]}`;
  commonjs!.map!.file = basename(commonjsPath);
  commonjs!.map!.sources[0] = `../src/${commonjs!.map!.sources[0]}`;

  writeFile(modulePath, addSourceMappingURL(module!.code!, moduleMapPath));
  writeFile(moduleMapPath, JSON.stringify(module!.map!));
  writeFile(commonjsPath, addSourceMappingURL(commonjs!.code!, commonjsMapPath));
  writeFile(commonjsMapPath, JSON.stringify(commonjs!.map!));
}
