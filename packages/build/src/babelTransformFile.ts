import { transformAsync, transformFromAstAsync } from "@babel/core";
import babelPluginTransformModulesCommonjs from "@babel/plugin-transform-modules-commonjs";
import babelPresetEnv from "@babel/preset-env";
import babelPresetReact from "@babel/preset-react";
import babelPluginReplaceImportExtensions from "@mo36924/babel-plugin-replace-import-extensions";
import { addSourceMappingURL } from "./addSourceMappingURL";
import { scriptRegExp } from "./config";
import { writeFile } from "./writeFile";

export async function babelTransformFile(path: string, data: string) {
  const module = await transformAsync(data, {
    babelrc: false,
    configFile: false,
    sourceType: "module",
    sourceMaps: true,
    ast: true,
    filename: path,
    presets: [
      [babelPresetEnv, { modules: false, targets: { node: true }, bugfixes: true }],
      [babelPresetReact, { runtime: "automatic", useSpread: true }],
    ],
    plugins: [[babelPluginReplaceImportExtensions, { ".ts": ".mjs", ".tsx": ".mjs" }]],
  });

  const commonjs = await transformFromAstAsync(module!.ast!, module!.code!, {
    babelrc: false,
    configFile: false,
    sourceType: "module",
    sourceMaps: true,
    inputSourceMap: module!.map,
    filename: path,
    plugins: [[babelPluginReplaceImportExtensions, { ".mjs": ".js" }], babelPluginTransformModulesCommonjs],
  });

  const modulePath = path.replace(scriptRegExp, ".mjs");
  const moduleMapPath = `${modulePath}.map`;
  const commonjsPath = path.replace(scriptRegExp, ".js");
  const commonjsMapPath = `${commonjsPath}.map`;

  module!.map!.sources[0] = `../src/${module!.map!.sources[0]}`;
  commonjs!.map!.sources[0] = `../src/${commonjs!.map!.sources[0]}`;

  writeFile(modulePath, addSourceMappingURL(module!.code!, moduleMapPath));
  writeFile(moduleMapPath, JSON.stringify(module!.map!));
  writeFile(commonjsPath, addSourceMappingURL(commonjs!.code!, commonjsMapPath));
  writeFile(commonjsMapPath, JSON.stringify(commonjs!.map!));
}
