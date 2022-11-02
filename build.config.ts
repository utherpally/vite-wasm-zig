import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: false,
  declaration: true,
  failOnWarn: false,
  externals: [
    'vite',
  ],
  rollup: {
    emitCJS: true,
    inlineDependencies: true,
  },
})