import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Mirrors vite.config.ts: tests resolve the internal CDK alias.
    alias: {
      '@colox/cdk': resolve(import.meta.dirname, 'src/cdk'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: { api: 'modern' },
    },
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./src/test-setup.ts'],
    css: true,
  },
});
