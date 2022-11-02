import type { Plugin } from "vite";
import { Options } from "./types";
import { spawn } from "cross-spawn";
import * as path from "node:path";
import * as os from "node:os";
import { fsPathFromUrl } from "./helper";

const ID_SUFFIX = ".zig?init";

export default function zigWasmPlugin(options: Options = {}): Plugin {
  const { tmpDir = os.tmpdir(), releaseMode = "small" } = options;
  return {
    name: "vite-wasm-zig",
    async transform(code, id) {
      if (id.endsWith(ID_SUFFIX)) {
        const filePath = fsPathFromUrl(id);
        const name = path.basename(filePath, ".zig");
        const wasmFile = `${name}.wasm`;
        const tmpFile = path.posix.join(tmpDir, wasmFile);
        const command = `zig build-lib -dynamic -target wasm32-freestanding -Drelease-${releaseMode} -femit-bin=${tmpFile} ${filePath}`;
        const [cmd, ...args] = command.split(" ");
        const child = spawn(cmd, args, { stdio: "inherit" });

        await new Promise((resolve, reject) => {
          child.on("close", (code) => {
            if (code === 0) {
              resolve(void 0);
            } else {
              reject(`failed to compile ${filePath} exited with code ${code}.`);
            }
          });
        });
        return {
          code: `
import init from '${tmpFile}?init';
export default init;`,
          map: { mappings: "" },
        };
      }
    },
  };
}
