import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: './tsconfig.json',
      entryRoot: 'src',
      outDir: 'dist/types',
      include: ['src'],
      exclude: ['src/**/*.test.tsx', 'src/**/*.test.ts'],
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  build: {
    // emit:themes CSS/cli-data artifacts coexist with the JS artifacts in
    // dist, so vite must not empty the directory
    emptyOutDir: false,
    lib: {
      entry: resolve(import.meta.dirname, 'src/index.ts'),
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'es/index.js' : 'cjs/index.cjs'),
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        exports: 'named',
      },
    },
  },
});
