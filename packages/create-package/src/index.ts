#!/usr/bin/env node
import { execSync } from "child_process";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { argv } from "process";
import { sync as delSync } from "del";
import { format, resolveConfig } from "prettier";

const scope = "@mo36924";
const name = argv[2];
const packageName = `${scope}/${name}`;
const packageDir = `packages/${name}`;
const packageJson = `${packageDir}/package.json`;

execSync(`lerna create ${name} -y`);

let pkg = JSON.parse(readFileSync(packageJson, "utf8"));

pkg = {
  ...{
    name: undefined,
    version: undefined,
    description: undefined,
    keywords: undefined,
    license: undefined,
    author: undefined,
    homepage: undefined,
    bugs: undefined,
    repository: undefined,
    publishConfig: undefined,
    directories: undefined,
    files: undefined,
    main: undefined,
    module: undefined,
    scripts: undefined,
  },
  ...pkg,
  description: packageName,
  keywords: [name],
  license: "MIT",
  repository: {
    ...pkg.repository,
    directory: packageDir,
  },
  publishConfig: {
    access: "public",
  },
  directories: undefined,
  files: ["dist"],
  main: "dist/index.js",
  module: "dist/index.mjs",
};

writeFile(packageJson, JSON.stringify(pkg));
delSync([`${packageDir}/lib`, `${packageDir}/__tests__`]);
mkdirSync(`${packageDir}/src`);
mkdirSync(`${packageDir}/__tests__`);
writeFile(`${packageDir}/src/index.ts`, "export {};");
writeFile(`${packageDir}/README.md`, `# ${packageName}`);

writeFileSync(
  `${packageDir}/LICENSE`,
  `
MIT License

Copyright (c) 2020 mo36924

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
`.trimStart(),
);

function writeFile(path: string, data: string) {
  writeFileSync(path, format(data, { ...resolveConfig.sync(path), filepath: path }));
}
