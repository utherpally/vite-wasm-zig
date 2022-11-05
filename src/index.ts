import type { Plugin, ResolvedConfig } from "vite";
import type { Options } from "./types";
import { sync as spawnSync } from "cross-spawn";
import * as path from "node:path";
import * as os from "node:os";
import * as fs from "node:fs/promises";
import which from "which";
import {
  fsPathFromUrl,
  cleanUrl,
  getHash,
  normalizePath,
  ensureZigVersion,
  atLeastZigVersion,
  lookupFile,
} from "./helper";

const ID_SUFFIX = ".zig?init";

export default function zigWasmPlugin(options: Options = {}): Plugin {
  let { cacheDir, zig = {}, optimize = false } = options;
  const {
    releaseMode = "small",
    strip = false,
    extraArgs = [],
    binPath,
    cacheDir: zigCacheDir,
  } = zig;

  const zigBinPath = which.sync(binPath ?? "zig");
  const versionCmd = spawnSync(zigBinPath, ["version"]);
  if (versionCmd.error) {
    throw new Error(`failed when execute "${zigBinPath} version" command.`);
  }
  const version = versionCmd.stdout.toString();

  const wasmOptPath = which.sync("wasm-opt", { nothrow: true });
  if (optimize && !wasmOptPath) {
    throw new Error(
      "Can't enable wasm optimize option, wasm-opt command not found. Make sure `wasm-opt` in your $PATH."
    );
  }

  ensureZigVersion(version, ">= 0.9.0");

  const zigSelfHosted = atLeastZigVersion(version, "0.10.0");

  let resolvedCacheDir: string;
  let resolvedZigCacheDir: string;
  return {
    name: "vite-wasm-zig",
    async transform(code, id, options) {
      if (id.endsWith(ID_SUFFIX)) {
        const filePath = fsPathFromUrl(id);

        const hash = getHash(cleanUrl(id));
        const uniqWasmName = `${path.basename(filePath, ".zig")}.${hash}.wasm`;
        const wasmPath = path.join(resolvedCacheDir, uniqWasmName);

        const args = [
          "build-lib",
          "-dynamic",
          "-target",
          "wasm32-freestanding",
          `-femit-bin=${wasmPath}`,
          `-Drelease-${releaseMode}`,
          `--cache-dir`,
          resolvedZigCacheDir,
        ];
        if (strip) {
          args.push(zigSelfHosted ? "-dead_strip" : "--strip");
        }
        if (extraArgs.length) {
          args.push.apply(args, extraArgs);
        }
        args.push(filePath);
        const result = spawnSync(zigBinPath, args, { stdio: "inherit" });
        if (result.error) throw result.error;

        if (optimize) {
          const optimizedFile = path.join(
            resolvedCacheDir,
            `wasm-optimized.${uniqWasmName}`
          );
          const args = ["-o", optimizedFile];
          const extraArgs = Array.isArray(optimize)
            ? optimize
            : ["-Oz", "--strip-debug"];
          const result = spawnSync(
            wasmOptPath!,
            [wasmPath, ...args, ...extraArgs],
            { stdio: "inherit" }
          );
          if (result.error) throw result.error;
          await fs.rename(optimizedFile, wasmPath);
        }
        return {
          code: options?.ssr
            ? `
import * as fs from "node:fs/promises";

export default async function init(opts) {
  const bytes = await fs.readFile('${normalizePath(wasmPath)}');
  const result = await WebAssembly.instantiate(bytes, opts);
  return result.instance;
}`
            : `
import init from '${normalizePath(wasmPath)}?init';
export default init;`,
          map: { mappings: "" },
        };
      }
    },
    configResolved: async (config) => {
      const pkgPath = lookupFile(config.root, ["package.json"]);
      resolvedCacheDir = cacheDir
        ? path.resolve(config.root, cacheDir)
        : pkgPath
        ? path.join(path.dirname(pkgPath), "node_modules/.vite-wasm-zig")
        : path.join(config.root, ".vite-wasm-zig");

      resolvedZigCacheDir = zigCacheDir
        ? path.join(config.root, zigCacheDir)
        : path.join(resolvedCacheDir, "zig-cache");

      await fs.mkdir(resolvedZigCacheDir, { recursive: true });
    },
  };
}
