import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'src'),
    },
  },
  test: {
    environment: 'node',
    environmentOptions: {
      jsdom: { url: 'http://localhost:3000/' },
    },
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.test.{ts,tsx,mjs}'],
  },
});
