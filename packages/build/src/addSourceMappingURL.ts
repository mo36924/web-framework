import { basename } from "path";

export function addSourceMappingURL(code: string, path: string) {
  return `${code}\n//# sourceMappingURL=${basename(path)}`;
}
