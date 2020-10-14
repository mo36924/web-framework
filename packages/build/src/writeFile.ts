import { mkdir, writeFile as _writeFile } from "fs/promises";
import { dirname } from "path";

export async function writeFile(path: string, data: string, writeByteOrderMark?: boolean) {
  data = writeByteOrderMark ? `\uFEFF${data}` : data;

  try {
    await _writeFile(path, data);
  } catch {
    await mkdir(dirname(path), { recursive: true });
    await _writeFile(path, data);
  }
}
