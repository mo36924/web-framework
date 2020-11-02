import { routeGenerator } from "@mo36924/route-generator";
import { getConfig } from "./config";

export async function build() {
  const config = await getConfig();
  await routeGenerator({ ...config.route, watch: false });
}
