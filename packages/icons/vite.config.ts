import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// A single barrel entry is enough: preserveModules keeps one emitted file
// per source module, so consumer bundlers tree-shake per icon with no
// per-icon subpath exports.
const externals = ['react', 'react-dom', 'react/jsx-runtime'];

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.build.json',
      entryRoot: 'src',
      outDir: 'dist/types',
      include: ['src'],
      exclude: ['src/**/*.test.tsx'],
    }),
  ],
  build: {
    rollupOptions: {
      input: { index: resolve(import.meta.dirname, 'src/index.ts') },
      external: externals,
      preserveEntrySignatures: 'exports-only',
      output: [
        {
          format: 'es',
          dir: 'dist',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: 'es/[name].js',
        },
        {
          format: 'cjs',
          dir: 'dist',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: 'cjs/[name].cjs',
        },
      ],
    },
  },
});
