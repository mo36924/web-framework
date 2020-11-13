import type { default as babel, PluginObj } from "@babel/core";
import { modern, module, nomodule } from "@mo36924/browserslists";
import cssnanoPresetAdvanced from "cssnano-preset-advanced";
import postcss, { Transformer } from "postcss";
import nested from "postcss-nested";
import "./module";

export type Options = {
  tags?: string[];
  pragma?: string;
  importSource?: string;
};
type State = {
  name: string;
  statements: babel.types.Statement[];
};

const plugins = (browserslist: string[]) => {
  const preset = cssnanoPresetAdvanced({ autoprefixer: { overrideBrowserslist: browserslist } });
  const nestedPlugin = nested();
  const asyncPlugins = ["postcss-svgo"];

  const cssnanoPlugins = preset.plugins
    .map(([creator, pluginConfig]) => creator(pluginConfig))
    .filter((plugin) => !plugin.postcssPlugin || !asyncPlugins.includes(plugin.postcssPlugin));

  return [nestedPlugin, ...cssnanoPlugins];
};

const modernPlugins = plugins(modern);

const modulePlugins = plugins(module);

const nomodulePlugins = plugins(nomodule);

const splitRulePlugin = postcss.plugin<{ separator: string }>(
  "postcss-split-rule",
  (opts = { separator: "\n" }) => (root) => {
    root.walkRules((rule) => {
      if (rule.prev()) {
        rule.raws.before = opts.separator;
      }
    });
  },
);

const templateCss = (styles: string[], wrapper = "_") => {
  let uncompiledCss = `.${wrapper}0${wrapper}{${styles[0]}`;

  for (let i = 1, len = styles.length; i < len; i++) {
    uncompiledCss += `${wrapper}${i}${wrapper}${styles[i]}`;
  }

  uncompiledCss += `}`;
  return uncompiledCss;
};

const compileCss = (uncompiledCss: string, plugins: Transformer[] = modernPlugins, separator: string = "\n") =>
  postcss([...plugins, splitRulePlugin({ separator })])
    .process(uncompiledCss)
    .toString();

const compileRules = (uncompiledCss: string, plugins: Transformer[] = modernPlugins, separator: string = "\n") =>
  compileCss(uncompiledCss, plugins, separator).split(separator);

const cacheKeys: { [cacheKey: string]: number } = Object.create(null);
let i = 0;

export default (
  { types: t }: typeof babel,
  { tags = ["css"], pragma = "css", importSource = "@mo36924/core" }: Options,
): PluginObj<State> => {
  return {
    name: "css-tagged-template",
    visitor: {
      Program: {
        enter(path, state) {
          state.name = path.scope.generateUid(pragma);
          state.statements = [];
        },
        exit(path, state) {
          if (!state.statements.length) {
            return;
          }

          path.unshiftContainer("body", [
            t.importDeclaration(
              [t.importSpecifier(t.identifier(state.name), t.identifier(pragma))],
              t.stringLiteral(importSource),
            ),
            ...state.statements,
          ]);
        },
      },
      TaggedTemplateExpression(path, state) {
        const {
          node: { tag, quasi },
        } = path;

        if (!t.isIdentifier(tag) || !tags.includes(tag.name)) {
          return;
        }

        const styles = quasi.quasis.map(({ value: { cooked, raw } }) => cooked ?? raw);
        const css = compileCss(templateCss(styles));
        const cacheKey = (cacheKeys[css] ??= i++);
        const wrapperLength = css.length;
        const wrapper = "_".repeat(wrapperLength);
        const trimWrapper = (str: string) => str.slice(wrapperLength, -wrapperLength);
        const wrapRegexp = new RegExp(`${wrapper}\\d+${wrapper}`, "g");
        const separator = `/*${"*".repeat(wrapperLength)}*/`;
        const uncompiledCss = templateCss(styles, wrapper);

        const arrayExpressions = [modernPlugins, modulePlugins, nomodulePlugins].map((plugins) => {
          const rules = compileRules(uncompiledCss, plugins, separator);

          const templates = rules.map((rule) => {
            const quasis = rule
              .split(wrapRegexp)
              .map((str, index, self) => t.templateElement({ raw: str }, index === self.length - 1));

            const expressions = (rule.match(wrapRegexp) || []).map((m) => t.identifier(`_${trimWrapper(m)}`));
            return t.templateLiteral(quasis, expressions);
          });

          return t.arrayExpression(templates);
        });

        const params = styles.map((_, i) => t.identifier(`_${i}`));
        const nodeRulesFactory = t.arrowFunctionExpression(params, t.arrayExpression(arrayExpressions));

        const [modernRulesFactory, moduleRulesFactory, nomoduleRulesFactory] = arrayExpressions.map((arrayExpression) =>
          t.arrowFunctionExpression(params, arrayExpression),
        );

        const id = path.scope.generateUidIdentifier("css");

        const conditional = t.conditionalExpression(
          t.binaryExpression("===", t.unaryExpression("typeof", t.identifier("self")), t.stringLiteral("undefined")),
          nodeRulesFactory,
          t.conditionalExpression(
            t.binaryExpression(
              "!==",
              t.unaryExpression("typeof", t.identifier("__MODERN__")),
              t.stringLiteral("undefined"),
            ),
            modernRulesFactory,
            t.conditionalExpression(
              t.binaryExpression(
                "!==",
                t.unaryExpression("typeof", t.identifier("__MODULE__")),
                t.stringLiteral("undefined"),
              ),
              moduleRulesFactory,
              nomoduleRulesFactory,
            ),
          ),
        );

        const key = t.numericLiteral(cacheKey);

        path.replaceWith(t.callExpression(id, quasi.expressions));

        state.statements.push(
          t.variableDeclaration("const", [
            t.variableDeclarator(id, t.callExpression(t.identifier(state.name), [conditional, key])),
          ]),
        );
      },
    },
  };
};
