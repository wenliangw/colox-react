import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    environmentOptions: {
      jsdom: { url: 'http://localhost:3000/' },
    },
    setupFiles: ['./test/setup.ts'],
    include: ['cli/**/*.test.mjs', 'config/**/*.test.mjs', 'src/**/*.test.{ts,tsx}'],
  },
});
