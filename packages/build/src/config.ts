import { existsSync } from "fs";
import { join, sep } from "path";
import { cwd } from "process";

export const baseDir = cwd() + sep;
export const packagesDir = join(baseDir, "packages") + sep;
export const tsconfigPath = join(baseDir, "tsconfig.json");
export const packageRootDir = "src";
export const packageOutDir = "dist";
export const testMatch = /[\\\/](test|__tests__)[\\\/]|\.(spec|test)\.(d\.ts|[jt]sx?)(\.map)?$/;

if (!existsSync(packagesDir)) {
  throw new Error("Not found workspace directory");
}
