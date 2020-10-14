import { sep } from "path";
import { packageOutDir, packageRootDir, packagesDir } from "./config";

export function outFilePath(path: string) {
  if (!path.startsWith(packagesDir)) {
    return path;
  }

  path = path.slice(packagesDir.length);
  const paths = path.split(sep);

  if (paths[1] !== packageRootDir) {
    return path;
  }

  paths[1] = packageOutDir;
  return packagesDir + paths.join(sep);
}
