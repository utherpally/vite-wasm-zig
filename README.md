# vite-wasm-zig

## Install

```
yarn add -D vite-wasm-zg
```

## Usage

```js
// vite.config.{js, ts}
import zig from 'vite-wasm-zig';

export default defineConfig(({ mode }) => {
    return {
        plugins: {
            zig({
                // Require `wasm-opt` installed on your PATH.
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
```

## With Typescript

Add to `tsconfig.json`:

```json
{
  "types": ["vite/client", "vite-wasm-zig/client"]
}
```

## Semver

Until 0.1 release, this package don't follow Semver for versioning

## Lisence

MIT
