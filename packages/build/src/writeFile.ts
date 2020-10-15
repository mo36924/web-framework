import { mkdir, writeFile as _writeFile } from "fs/promises";
import { dirname } from "path";
import { queue } from "./queue";

export function writeFile(path: string, data: string) {
  return queue.add(async () => {
    try {
      await _writeFile(path, data);
    } catch {
      await mkdir(dirname(path), { recursive: true });
      await _writeFile(path, data);
    }
  });
}
