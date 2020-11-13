declare module "cssnano-preset-advanced" {
  import type { Plugin } from "postcss";
  const defaultPreset: (opts?: { [plugin: string]: any }) => { plugins: [Plugin<{}>, any][] };
  export default defaultPreset;
}
