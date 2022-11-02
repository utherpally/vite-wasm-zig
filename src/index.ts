import type { Plugin } from "vite";
import type { Options } from "./types";
import { sync as spawnSync } from "cross-spawn";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs/promises";
import which from "which";
import { fsPathFromUrl, cleanUrl, getHash, normalizePath } from "./helper";

const ID_SUFFIX = ".zig?init";

export default function zigWasmPlugin(options: Options = {}): Plugin {
  let { tmpDir = os.tmpdir(), zig = {}, optimize = false } = options;
  const { releaseMode = "small", strip = false, extraArgs = [], binPath } = zig;

  return {
    name: "vite-wasm-zig",
    async transform(code, id) {
      if (id.endsWith(ID_SUFFIX)) {
        const filePath = fsPathFromUrl(id);
        if (!tmpDir) {
          // Fallback to current source dir
          tmpDir = path.dirname(filePath);
        }

        const hash = getHash(cleanUrl(id));
        const uniqWasmName = `${path.basename(filePath, ".zig")}.${hash}.wasm`;
        const wasmPath = path.join(tmpDir, uniqWasmName);

        const command = binPath ?? "zig";
        const args = [
          "build-lib",
          "-dynamic",
          "-target",
          "wasm32-freestanding",
          `-femit-bin=${wasmPath}`,
          `-Drelease-${releaseMode}`,
        ];
        if (strip) {
          args.push("-dead_strip");
        }
        if (extraArgs.length) {
          args.push.apply(args, extraArgs);
        }
        args.push(filePath);
        const result = spawnSync(command, args, { stdio: "inherit" });
        if (result.error) throw result.error;

        if (optimize) {
          const wasmOptPath = which.sync("wasm-opt", { nothrow: true });
          const optimizedFile = path.join(
            tmpDir,
            `wasm-optimized.${uniqWasmName}`
          );
          const args = ["-o", optimizedFile];
          const extraArgs = Array.isArray(optimize)
            ? optimize
            : ["-Oz", "--strip-debug"];
          if (wasmOptPath) {
            const result = spawnSync(
              wasmOptPath,
              [wasmPath, ...args, ...extraArgs],
              { stdio: "ignore" }
            );
            if (result.error) throw result.error;
            await fs.rename(optimizedFile, wasmPath);
          } else {
            console.warn(
              "Can't optimize .wasm file, wasm-opt command not found. Are you installed?"
            );
          }
        }

        return {
          code: `
import init from '${normalizePath(wasmPath)}?init';
export default init;`,
          map: { mappings: "" },
        };
      }
    },
  };
}
