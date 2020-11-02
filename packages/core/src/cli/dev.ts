import { watch } from "fs";
import { isMainThread, Worker, workerData } from "worker_threads";
import { routeGenerator } from "@mo36924/route-generator";
import { getConfig, clearCaches, Config } from "./config";

export async function dev() {
  if (isMainThread) {
    const config = await getConfig();
    const filepath = config.filepath;

    const worker = new Worker(__filename, {
      workerData: config,
    });

    if (!filepath) {
      return;
    }

    const watcher = watch(filepath, async () => {
      watcher.close();
      await worker.terminate();
      clearCaches();
      await dev();
    });

    return;
  }

  const { route }: Config = workerData;
  await Promise.all([routeGenerator({ ...route, watch: true })]);
}
