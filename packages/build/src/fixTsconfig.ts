import { readFileSync, writeFileSync } from "fs";
import { format, resolveConfig } from "prettier";
import { packageRootDir, tsconfigPath } from "./config";

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
    ...tsconfig.compilerOptions,
    incremental: true,
    target: "ES2020",
    module: "CommonJS",
    declaration: true,
    declarationMap: true,
    sourceMap: true,
    inlineSources: true,
    strict: true,
    moduleResolution: "node",
    esModuleInterop: true,
    skipLibCheck: true,
    forceConsistentCasingInFileNames: true,
    importsNotUsedAsValues: "error",
    newLine: "lf",
    rootDir: "packages",
    baseUrl: "packages",
    paths: {
      "@mo36924/*": [`*/${packageRootDir}`],
    },
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
