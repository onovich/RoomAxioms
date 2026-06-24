import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    emptyOutDir: false,
    lib: {
      entry: 'src/cli.ts',
      formats: ['es'],
      fileName: () => 'cli.js',
    },
    minify: false,
    rollupOptions: {
      external: ['node:fs', 'node:path'],
      treeshake: false,
    },
    sourcemap: true,
    target: 'node24',
  },
})
