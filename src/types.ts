export type Options = {
  /**
   * Temporary dir to store generated .wasm files and zig-cache during transform
   */
   cacheDir?: string | false;
  /**
   * Enable optimize after building .wasm file from zig file.
   *
   * Default run with ["-Oz", "--strig-debug"]
   */
  optimize?: boolean | string[];
  /**
   * Effected zig build command
   */
  zig?: {
    releaseMode?: "safe" | "small" | "fast";
    strip?: boolean;
    binPath?: string;
    cacheDir?: string;
    extraArgs?: string[];
  };
};
