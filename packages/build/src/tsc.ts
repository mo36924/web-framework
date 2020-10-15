import { existsSync, readFileSync, writeFileSync } from "fs";
import { createRequire } from "module";
import { join } from "path";
import { baseDir } from "./config";

const _require = createRequire(join(baseDir, "index.js"));
const tscPath = _require.resolve("typescript/lib/tsc.js");
const _tscPath = tscPath.replace(/tsc\.js$/, "_tsc.js");

if (!existsSync(_tscPath)) {
  const tscSource = readFileSync(tscPath, "utf8");
  const tscSeparator = "(function (ts) {";
  const tscSeparatorIndex = tscSource.lastIndexOf(tscSeparator);

  if (tscSeparatorIndex === -1) {
    throw new Error("Could not find a separator");
  }

  const _tscSource = `${tscSource.slice(0, tscSeparatorIndex)}\nts.tsc = function(){\n${tscSource.slice(
    tscSeparatorIndex,
  )}\n}\nmodule.exports = ts;`;

  writeFileSync(_tscPath, _tscSource);
}

export const ts: typeof import("typescript") & { tsc: () => void } = _require(_tscPath);
export const tsc = ts.tsc;
