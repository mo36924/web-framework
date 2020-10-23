import { babelTransformFile } from "./babelTransformFile";
import { scriptRegExp, testRegExp } from "./config";
import { outFilePath } from "./outFilePath";
import { queue } from "./queue";
import { relativeResolveTransformerFactory } from "./relativeResolveTransformer";
import type { ts as typescript } from "./tsc";
import { writeFile } from "./writeFile";

export function patchTypescript(ts: typeof typescript) {
  const createProgram = ts.createProgram;

  ts.createProgram = (...args: [any]) => {
    const program = createProgram(...args);
    const emit = program.emit;

    program.emit = (targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, _customTransformers) => {
      return emit(targetSourceFile, writeFile, cancellationToken, emitOnlyDtsFiles, {
        after: [relativeResolveTransformerFactory],
      });
    };

    return program;
  };

  ts.sys.writeFile = (path, data, _writeByteOrderMark) => {
    if (testRegExp.test(path)) {
      return;
    }

    if (scriptRegExp.test(path)) {
      babelTransformFile(path, data);
    } else {
      writeFile(outFilePath(path), data);
    }
  };

  const exit = ts.sys.exit;

  ts.sys.exit = (exitCode) => {
    queue.onIdle().then(
      () => exit(exitCode),
      () => exit(exitCode || 1),
    );
  };
}
