import type { Options as RouteGeneratorConfig } from "@mo36924/route-generator";
import { cosmiconfig } from "cosmiconfig";

export type Config = {
  route?: RouteGeneratorConfig;
  filepath?: string;
};

const moduleName = "webFramework";

export async function getConfig() {
  const result = await cosmiconfig(moduleName).search();
  const config: Config = result?.config ?? {};
  config.filepath = result?.filepath;
  return config;
}

export function clearCaches() {
  cosmiconfig(moduleName).clearCaches();
}
