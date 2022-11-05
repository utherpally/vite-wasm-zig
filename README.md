<p>
  <a href="https://npmjs.com/package/vite-wasm-zig"><img src="https://img.shields.io/npm/v/vite-wasm-zig.svg" alt="npm package"></a>
  <a href="https://ziglang.org/"><img src="https://img.shields.io/badge/zig-%3E%3D%200.9.0-yellow?logo=zig" alt="zig language"></a>
  <a href="https://ziglang.org/"><img src="https://img.shields.io/badge/vite-%5E3.0.0-blue?logo=vite&&labelColor=ffffff" alt="zig language"></a>
</p>

# vite-wasm-zig

## Install


```
yarn add -D vite-wasm-zig
```

## Usage

```js
// vite.config.{js, ts}
import zig from 'vite-wasm-zig';

export default defineConfig(({ mode }) => {
    return {
        plugins: {
            zig({
                // Enable this option require `wasm-opt` installed on your $PATH.
                optimize: mode === 'production',
                // Other options goes here
            })
        }
    }
}
```

```js
// main.zig

export fn add(a: i32, b: i32) i32 {
    return a + b;
}
```

```js
// index.{js,ts}
import init from "./main.zig?init";

function someFunc() {
  const importObject = {
    /* ... */
  };

  init(importObject).then((instance) => {
    console.log(instance.exports.add(1, 10));
  });
}
// OR
// This plugin support SSR, so top level await is OK
const instance = await init(importObject)
console.log(instance.exports.add(1, 10));
export default instance.exports;
```

## With Typescript

Add to `tsconfig.json`:

```json
{
  "types": ["vite/client", "vite-wasm-zig/client"]
}
```

## Semver

Until 1.0 release, this package don't follow Semver for versioning

## Lisence

MIT
