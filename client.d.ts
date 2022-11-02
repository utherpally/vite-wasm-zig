declare module "*.zig?init" {
  export const instantiate: (
    options: WebAssembly.Imports
  ) => Promise<WebAssembly.Instance>;
  export default instantiate;
}
