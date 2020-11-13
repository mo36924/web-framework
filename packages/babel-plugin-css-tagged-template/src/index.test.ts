import { transformAsync, TransformOptions } from "@babel/core";
import { test, expect } from "@jest/globals";
import cssTaggedTemplate from "./index";

const options: TransformOptions = {
  babelrc: false,
  configFile: false,
  plugins: [[cssTaggedTemplate, {}]],
};

const transform = (code: string) => transformAsync(code, options);

test("babel-plugin-css-tagged-template", async () => {
  let result = await transform(`
    css\`
      width: 10px;
    \`
  `);

  expect(result).toMatchInlineSnapshot(`
    import { css as _css } from "framework";

    const _css2 = _css(
      typeof self === "undefined"
        ? (_0) => [
            [\`.\${_0}{width:10px}\`],
            [\`.\${_0}{width:10px}\`],
            [\`.\${_0}{width:10px}\`],
          ]
        : typeof __MODERN__ !== "undefined"
        ? (_0) => [\`.\${_0}{width:10px}\`]
        : typeof __MODULE__ !== "undefined"
        ? (_0) => [\`.\${_0}{width:10px}\`]
        : (_0) => [\`.\${_0}{width:10px}\`],
      "zfm5Ii6Tnh0="
    );

    _css2();
  `);

  result = await transform(`
    function a(){
      const className = css\`
        width: 10px;
      \`
    }
  `);

  expect(result).toMatchInlineSnapshot(`
    import { css as _css } from "framework";

    const _css2 = _css(
      typeof self === "undefined"
        ? (_0) => [
            [\`.\${_0}{width:10px}\`],
            [\`.\${_0}{width:10px}\`],
            [\`.\${_0}{width:10px}\`],
          ]
        : typeof __MODERN__ !== "undefined"
        ? (_0) => [\`.\${_0}{width:10px}\`]
        : typeof __MODULE__ !== "undefined"
        ? (_0) => [\`.\${_0}{width:10px}\`]
        : (_0) => [\`.\${_0}{width:10px}\`],
      "zfm5Ii6Tnh0="
    );

    function a() {
      const className = _css2();
    }
  `);

  result = await transform(`
    function a(b){
      const className = css\`
        width: 10px;
        height: \${b}px;
      \`
    }
  `);

  expect(result).toMatchInlineSnapshot(`
    import { css as _css } from "framework";

    const _css2 = _css(
      typeof self === "undefined"
        ? (_0, _1) => [
            [\`.\${_0}{height:\${_1}px;width:10px}\`],
            [\`.\${_0}{height:\${_1}px;width:10px}\`],
            [\`.\${_0}{height:\${_1}px;width:10px}\`],
          ]
        : typeof __MODERN__ !== "undefined"
        ? (_0, _1) => [\`.\${_0}{height:\${_1}px;width:10px}\`]
        : typeof __MODULE__ !== "undefined"
        ? (_0, _1) => [\`.\${_0}{height:\${_1}px;width:10px}\`]
        : (_0, _1) => [\`.\${_0}{height:\${_1}px;width:10px}\`],
      "WSOlo8TZK6A="
    );

    function a(b) {
      const className = _css2(b);
    }
  `);

  result = await transform(`
    function a(b){
      const className = css\`
        width: 10px;
        height: \${b}px;
      \`
    }

    function b(c, d){
      const className = css\`
        width: \${c}px;
        height: \${d}px;
      \`
    }
  `);

  expect(result).toMatchInlineSnapshot(`
    import { css as _css } from "framework";

    const _css2 = _css(
      typeof self === "undefined"
        ? (_0, _1) => [
            [\`.\${_0}{height:\${_1}px;width:10px}\`],
            [\`.\${_0}{height:\${_1}px;width:10px}\`],
            [\`.\${_0}{height:\${_1}px;width:10px}\`],
          ]
        : typeof __MODERN__ !== "undefined"
        ? (_0, _1) => [\`.\${_0}{height:\${_1}px;width:10px}\`]
        : typeof __MODULE__ !== "undefined"
        ? (_0, _1) => [\`.\${_0}{height:\${_1}px;width:10px}\`]
        : (_0, _1) => [\`.\${_0}{height:\${_1}px;width:10px}\`],
      "WSOlo8TZK6A="
    );

    const _css3 = _css(
      typeof self === "undefined"
        ? (_0, _1, _2) => [
            [\`.\${_0}{height:\${_2}px;width:\${_1}px}\`],
            [\`.\${_0}{height:\${_2}px;width:\${_1}px}\`],
            [\`.\${_0}{height:\${_2}px;width:\${_1}px}\`],
          ]
        : typeof __MODERN__ !== "undefined"
        ? (_0, _1, _2) => [\`.\${_0}{height:\${_2}px;width:\${_1}px}\`]
        : typeof __MODULE__ !== "undefined"
        ? (_0, _1, _2) => [\`.\${_0}{height:\${_2}px;width:\${_1}px}\`]
        : (_0, _1, _2) => [\`.\${_0}{height:\${_2}px;width:\${_1}px}\`],
      "vEKpkqOFzME="
    );

    function a(b) {
      const className = _css2(b);
    }

    function b(c, d) {
      const className = _css3(c, d);
    }
  `);

  result = await transform(`
    function a(b){
      const className = css\`
        width: 10px;
        height: \${b}px;
        &:before {
          width: \${b}px;
        }
      \`
    }
  `);

  expect(result).toMatchInlineSnapshot(`
    import { css as _css } from "framework";

    const _css2 = _css(
      typeof self === "undefined"
        ? (_0, _1, _2) => [
            [\`.\${_0}{height:\${_1}px;width:10px}\`, \`.\${_0}:before{width:\${_2}px}\`],
            [\`.\${_0}{height:\${_1}px;width:10px}\`, \`.\${_0}:before{width:\${_2}px}\`],
            [\`.\${_0}{height:\${_1}px;width:10px}\`, \`.\${_0}:before{width:\${_2}px}\`],
          ]
        : typeof __MODERN__ !== "undefined"
        ? (_0, _1, _2) => [
            \`.\${_0}{height:\${_1}px;width:10px}\`,
            \`.\${_0}:before{width:\${_2}px}\`,
          ]
        : typeof __MODULE__ !== "undefined"
        ? (_0, _1, _2) => [
            \`.\${_0}{height:\${_1}px;width:10px}\`,
            \`.\${_0}:before{width:\${_2}px}\`,
          ]
        : (_0, _1, _2) => [
            \`.\${_0}{height:\${_1}px;width:10px}\`,
            \`.\${_0}:before{width:\${_2}px}\`,
          ],
      "jUdhaQWZX8A="
    );

    function a(b) {
      const className = _css2(b, b);
    }
  `);
});
