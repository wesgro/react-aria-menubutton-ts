import { defineConfig } from 'tsup'
import packageJson from "./package.json"
export default defineConfig({
  entry: ['src/index.ts'],
  splitting: true,
  sourcemap: true,
  clean: true,
  format: ['esm'],
  external: [...Object.keys(packageJson.dependencies), ...Object.keys(packageJson.peerDependencies)],
    dts: true,
    treeshake: true,
})