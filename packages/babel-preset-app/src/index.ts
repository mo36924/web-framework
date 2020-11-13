import "./module";
import type { default as babel, TransformOptions, ConfigAPI } from "@babel/core";
import presetEnv, { Options as presetEnvOptions } from "@babel/preset-env";
import presetReact from "@babel/preset-react";
import presetTypescript from "@babel/preset-typescript";
// import { packageName, routerComponent } from "../config";
// import { rootId, storeId, styleId } from "../constants";
// import { modern, module, nomodule } from "./browserslists";
// import cssTaggedTemplate, { Options as cssTaggedTemplateOptions } from "./cssTaggedTemplate";
// import deadCodeElimination from "./deadCodeElimination";
// import inject from "./inject";
// import removeUnusedImport from "./removeUnusedImport";
// import replace from "./replace";
// import resolve, { Options as ResolveOptions } from "./resolve";

type Api = ConfigAPI & typeof babel;

export type Options = {
  env?: "production" | "development" | "test";
  target?: "node" | "modern" | "module" | "nomodule";
  type?: "module" | "commonjs";
  pkg?: string;
};

export default (_api: Api, options: Options): TransformOptions => {
  const { NODE_ENV, NODE_TARGET, NODE_TYPE } = process.env;
  const { env = NODE_ENV ?? "production", target = NODE_TARGET, type = NODE_TYPE } = options;
  const __PROD__ = env === "production";
  const __DEV__ = env === "development";
  const __TEST__ = env === "test";
  const __NODE__ = target === "node";
  const __MODERN__ = target === "modern";
  const __MODULE__ = target === "module";
  const __NOMODULE__ = target === "nomodule";
  const __COMMONJS__ = type === "commonjs";
  return {
    presets: [
      [
        presetEnv,
        {
          bugfixes: true,
          modules: __COMMONJS__ && "commonjs",
          loose: false,
          ignoreBrowserslistConfig: true,
          targets: __NODE__,
          // ? {
          //     node: true,
          //   }
          // : __MODERN__
          // ? modern
          // : __MODULE__
          // ? module
          // : __NOMODULE__
          // ? nomodule
          // : {
          //     node: "14",
          //     chrome: "80",
          //   },
          useBuiltIns: false,
          debug: __DEV__,
        } as presetEnvOptions,
      ],
      [presetTypescript],
      [presetReact, { useBuiltIns: __NOMODULE__, useSpread: !__NOMODULE__, development: __DEV__ }],
    ],
    // plugins: [
    //   [
    //     replace,
    //     target
    //       ? {
    //           "typeof self": __NODE__ ? "'undefined'" : "'object'",
    //           "typeof window": __NODE__ ? "'undefined'" : "'object'",
    //           "typeof global": __NODE__ ? "'object'" : "'undefined'",
    //           "typeof process": "'object'",
    //           "process.env.NODE_ENV": `'${env}'`,
    //           __PROD__: `${__PROD__}`,
    //           __DEV__: `${__DEV__}`,
    //           __TEST__: `${__TEST__}`,
    //           __ROOT_ID__: `"${rootId}"`,
    //           __STORE_ID__: `"${storeId}"`,
    //           __STYLE_ID__: `"${styleId}"`,
    //         }
    //       : false,
    //   ],
    //   [deadCodeElimination, target ? {} : false],
    //   [cssTaggedTemplate, target ? ({} as cssTaggedTemplateOptions) : false],
    //   [removeUnusedImport, target ? {} : false],
    //   [
    //     resolve,
    //     target
    //       ? ({
    //           ignoreBareImport: __NODE__,
    //         } as ResolveOptions)
    //       : false,
    //   ],
    //   [
    //     inject,
    //     {
    //       createElement: [pkg, "createElement"],
    //       createContext: [pkg, "createContext"],
    //       Fragment: [pkg, "Fragment"],
    //       hydrate: [pkg, "hydrate"],
    //       render: [pkg, "render"],
    //       useState: [pkg, "useState"],
    //       useReducer: [pkg, "useReducer"],
    //       useEffect: [pkg, "useEffect"],
    //       useLayoutEffect: [pkg, "useLayoutEffect"],
    //       useRef: [pkg, "useRef"],
    //       useImperativeHandle: [pkg, "useImperativeHandle"],
    //       useMemo: [pkg, "useMemo"],
    //       useCallback: [pkg, "useCallback"],
    //       useContext: [pkg, "useContext"],
    //       useDebugValue: [pkg, "useDebugValue"],
    //       useQuery: [pkg, "useQuery"],
    //       useMutation: [pkg, "useMutation"],
    //       Body: [pkg, "Body"],
    //       Head: [pkg, "Head"],
    //       Html: [pkg, "Html"],
    //       Meta: [pkg, "Meta"],
    //       Title: [pkg, "Title"],
    //       Router: [routerComponent, "default"],
    //       fetch: [pkg, "fetch"],
    //       Headers: [pkg, "Headers"],
    //       Request: [pkg, "Request"],
    //       Response: [pkg, "Response"],
    //     },
    //   ],
    // ],
  };
};
