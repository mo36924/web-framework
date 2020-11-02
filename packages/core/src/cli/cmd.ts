import { program } from "commander";
import { build } from "./build";
import { dev } from "./dev";

program
  .name("web-framework")
  .usage("[options]")
  .option("-b, --build", "build")
  .option("-d, --dev", "development")
  .parse(process.argv);

if (program.build) {
  build().catch(error);
}

if (program.dev) {
  dev().catch(error);
}

function error(err?: any) {
  process.exitCode = 1;
  console.error(err);
}
