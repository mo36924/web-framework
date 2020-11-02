import { transformAsync } from "@babel/core";
import { expect, it } from "@jest/globals";
import plugin from "./index";

it("babel-plugin-import-meta-url", async () => {
  const result = await transformAsync("console.log(import.meta.url);", {
    babelrc: false,
    configFile: false,
    plugins: [plugin],
  });

  expect(result!.code).toMatchInlineSnapshot(`"console.log(require(\\"url\\").pathToFileURL(__filename));"`);
});
