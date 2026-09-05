import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// One entry per component so consumer bundlers can tree-shake at the module
// level (`import { Button } from '@colox/react/button'`). The `index` entry
// keeps the one-line `@colox/react` import path intact.
const entries = {
  index: resolve(import.meta.dirname, 'src/index.ts'),
  button: resolve(import.meta.dirname, 'src/button/index.ts'),
  input: resolve(import.meta.dirname, 'src/input/index.ts'),
  stack: resolve(import.meta.dirname, 'src/stack/index.ts'),
};

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      entryRoot: 'src',
      outDir: 'dist/types',
      include: ['src'],
      exclude: ['src/**/*.stories.tsx', 'src/**/*.test.tsx', 'src/test-setup.ts'],
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: { api: 'modern' },
    },
  },
  build: {
    // Single css bundle: the one-line import contract
    // (`import '@colox/react/style.css'`) stays as the token cascade plus all
    // components. Per-component css splitting is a later step once component
    // styles grow large enough to pay for the assembly logic.
    cssCodeSplit: false,
    lib: {
      entry: entries,
      formats: ['es', 'cjs'],
      fileName: (format, entryName) =>
        format === 'es' ? `es/${entryName}.js` : `cjs/${entryName}.cjs`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        exports: 'named',
        assetFileNames: 'style.[ext]',
      },
    },
  },
});
