import { once } from "events";
import { mkdir, readFile, writeFile } from "fs/promises";
import { dirname, extname, relative, resolve, sep } from "path";
import { watch } from "chokidar";
import { format as prettierFormat, resolveConfig } from "prettier";

export type Options = {
  watch?: boolean;
  dir: string;
  paths: string | string[];
  component: string;
  template: string;
  ignore: string | string[];
};

const defaultTemplate = `
import "@mo36924/changestate";
import { createContext, Component, ComponentType } from "preact";
/**__imports__**/

type Props = { [key: string]: string };
type Route<T = any> = ComponentType<T> & { load: () => Promise<any> };
type DynamicImport<T = any> = Promise<{ default: ComponentType<T> }>;
type StaticRoutes = { [path: string]: Route | undefined };
type DynamicRoutes = [RegExp, string[], Route][];

const [
  /*__names__*/
] = [
  /*__dynamicImports__*/
].map(lazy);

export const staticRoutes: StaticRoutes = Object.assign(Object.create(null), {
  /*__staticRoutes__*/
});

export const dynamicRoutes: DynamicRoutes = [
  /*__dynamicRoutes__*/
];

export type RouteContextValue = { url: URL; route: Route; props: Props };
export const RouteContext = createContext((null as any) as RouteContextValue);
export const { Provider, Consumer } = RouteContext;
export const NotFound: Route = lazy(() => Promise.resolve(() => null));

export const match = (href: string): RouteContextValue => {
  const url = new URL(href);
  const path = url.pathname.slice(1);
  const route = staticRoutes[path] || NotFound;
  const props: Props = {};

  if (!route) {
    for (const [regexp, names, route] of dynamicRoutes) {
      const matches = path.match(regexp);

      if (matches) {
        names.forEach((name, i) => (props[name] = matches[i + 1]));
        return { url, route, props };
      }
    }
  }

  return { url, route, props };
};

export default class Router extends Component<{ href: string }, RouteContextValue> {
  constructor(props: { href: string }) {
    super(props);
    this.state = match(props.href);
  }
  componentDidMount() {
    addEventListener("changestate", this.handleChangestate);
  }
  componentWillUnmount() {
    removeEventListener("changestate", this.handleChangestate);
  }
  handleChangestate = () => {
    const context = match(location.href);
    context.route.load().then(() => this.setState(context));
  };
  render() {
    return (
      <Provider value={this.state}>
        <this.state.route {...this.state.props} />
      </Provider>
    );
  }
}
`;

export async function routeGenerator(options: Options) {
  const {
    watch: watchMode = false,
    dir = "pages",
    paths = ["**/*.tsx"],
    component = "components/Router.tsx",
    template = "components/Router.txt",
    ignore = [],
  } = options ?? {};

  await Promise.all([
    mkdir(dir, { recursive: true }),
    mkdir(dirname(component), { recursive: true }),
    mkdir(dirname(template), { recursive: true }),
  ]);

  const watcher = watch(paths, { cwd: dir, ignored: ignore });
  watcher.on("add", generateDefaultFile);
  watcher.on("change", generateDefaultFile);

  await once(watcher, "ready");
  await generate();

  if (watchMode) {
    watcher.on("add", generate);
    watcher.on("unlink", generate);
    watcher.on("unlinkDir", generate);
  } else {
    await watcher.close();
  }

  function pathToRoute(path: string) {
    const absolutePath = resolve(path);
    const nonExtAbsolutePath = absolutePath.slice(0, -extname(absolutePath).length || undefined);
    const nonExtPath = relative(dir, nonExtAbsolutePath).split(sep).join("/");

    const componentName = nonExtPath.replace(/[\/\-]/g, "$");

    let routePath = nonExtPath
      .replace(/^index$/, "")
      .replace(/\/index$/, "/")
      .replace(/__|_/g, (m) => (m === "_" ? ":" : "_"));

    const rank = routePath
      .split("/")
      .map((segment) => {
        if (!segment.includes(":")) {
          return 9;
        }

        if (segment[0] !== ":") {
          return 8;
        }

        return segment.split(":").length;
      })
      .join("");

    const isDynamic = routePath.includes(":");
    const paramNames: string[] = [];

    if (isDynamic) {
      routePath =
        "/^" +
        routePath.replace(/\//g, "\\/").replace(/\:([A-Za-z][0-9A-Za-z]*)/g, (_m, p1) => {
          paramNames.push(p1);
          return "([^\\/]+?)";
        }) +
        "$/";
    }

    let importPath = relative(dirname(component), nonExtAbsolutePath).split(sep).join("/");

    if (importPath[0] !== "." && importPath[0] !== "/") {
      importPath = `./${importPath}`;
    }

    return { importPath, componentName, isDynamic, routePath, paramNames, rank };
  }

  async function generateDefaultFile(path: string) {
    const absolutePath = resolve(dir, path);
    let code = await readFile(absolutePath, "utf8");

    if (code.trim() !== "") {
      return;
    }

    const { paramNames, isDynamic } = pathToRoute(absolutePath);

    if (isDynamic) {
      const params = paramNames.map((name) => `${name}: string`).join();

      code = `
        export default (props: { ${params} }) => {
          return (
            <div></div>
          )
        }
      `;
    } else {
      code = `
        export default () => {
          return (
            <div></div>
          )
        }
      `;
    }

    code = await format(code, absolutePath);
    await writeFile(absolutePath, code);
  }

  async function generate() {
    const watched = watcher.getWatched();

    const pagePaths = Object.entries(watched)
      .flatMap(([_dir, names]) => names.map((name) => pathToRoute(resolve(dir, _dir, name))))
      .sort((a, b) => (b.rank as any) - (a.rank as any));

    const imports = [];
    const dynamicImports = [];
    const names = [];
    const routes = [];
    const staticRoutes = [];
    const dynamicRoutes = [];

    for (const { importPath, componentName, routePath, isDynamic, paramNames } of pagePaths) {
      imports.push(`import ${componentName} from '${importPath}';`);
      names.push(componentName);

      if (isDynamic) {
        const params = paramNames.map((name) => `${name}: string`).join();
        routes.push(`(): Route<{${params}}> => import('${importPath}')`);
        dynamicImports.push(`() => import('${importPath}') as DynamicImport<{${params}}>`);
        dynamicRoutes.push(`[${routePath}, ${JSON.stringify(paramNames)}, ${componentName} as Route<{${params}}>]`);
      } else {
        routes.push(`(): Route => import('${importPath}')`);
        staticRoutes.push(`'${routePath}': ${componentName} as Route`);
        dynamicImports.push(`() => import('${importPath}') as DynamicImport`);
      }
    }

    let code = defaultTemplate;

    try {
      code = await readFile(template, "utf8");
    } catch {
      code = await format(defaultTemplate, component);
      await writeFileAsync(template, code);
    }

    code = code
      .replace("/*__imports__*/", imports.join(""))
      .replace("/*__names__*/", names.join())
      .replace("/*__dynamicImports__*/", dynamicImports.join())
      .replace("/*__routes__*/", routes.join())
      .replace("/*__staticRoutes__*/", staticRoutes.join())
      .replace("/*__dynamicRoutes__*/", dynamicRoutes.join());

    code = await format(code, component);
    await writeFileAsync(component, code);
  }
}

async function format(code: string, filepath: string) {
  const prettierConfig = await resolveConfig(filepath);
  return prettierFormat(code, { ...prettierConfig, filepath });
}

async function writeFileAsync(path: string, data: string) {
  try {
    await writeFile(path, data);
  } catch {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, data);
  }
}
