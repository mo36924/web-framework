import { readFileSync, writeFileSync } from "fs";
import { format, resolveConfig } from "prettier";
import { packageRootDir, tsconfigPath } from "./config";

const compilerOptions = {
  incremental: true,
  target: "ES2020",
  module: "ES2020",
  declaration: true,
  declarationMap: true,
  sourceMap: undefined,
  inlineSourceMap: true,
  inlineSources: true,
  strict: true,
  moduleResolution: "node",
  esModuleInterop: true,
  skipLibCheck: true,
  forceConsistentCasingInFileNames: true,
  importsNotUsedAsValues: "error",
  newLine: "lf",
  emitBOM: false,
  rootDir: "packages",
  outDir: undefined,
  outFile: undefined,
  baseUrl: "packages",
  paths: {
    "@mo36924/*": [`*/${packageRootDir}`],
  },
};

export function fixTsconfig() {
  let tsconfig;
  let tsconfigJson = "";

  try {
    tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf8"));
    tsconfigJson = JSON.stringify(tsconfig);
  } catch {
    tsconfig = {};
  }

  tsconfig.extends = undefined;

  tsconfig.compilerOptions = {
    ...compilerOptions,
    ...tsconfig.compilerOptions,
    ...compilerOptions,
  };

  tsconfig.include = [
    ...new Set([`packages/*/${packageRootDir}`, "packages/*/__tests__", ...(tsconfig.include ?? [])]),
  ];

  let fixedTsconfigJson = JSON.stringify(tsconfig);

  if (tsconfigJson !== fixedTsconfigJson) {
    fixedTsconfigJson = format(fixedTsconfigJson, { ...resolveConfig.sync(tsconfigPath), filepath: tsconfigPath });
    writeFileSync(tsconfigPath, fixedTsconfigJson);
  }
}
