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
  checkbox: resolve(import.meta.dirname, 'src/checkbox/index.ts'),
  input: resolve(import.meta.dirname, 'src/input/index.ts'),
  stack: resolve(import.meta.dirname, 'src/stack/index.ts'),
  container: resolve(import.meta.dirname, 'src/container/index.ts'),
  grid: resolve(import.meta.dirname, 'src/grid/index.ts'),
};

// Runtime deps stay in `dependencies` (installed transitively, one-line
// install preserved) and are externalized here so consumers bundle a single
// copy. React is a peer dependency and always external.
const externals = [
  'react',
  'react-dom',
  'react/jsx-runtime',
  'clsx',
  'class-variance-authority',
  // Theme runtime must stay external (never inlined): useColoxTheme relies on
  // a shared React context, and an inlined copy would split context identity
  // from the consumer's `<ColoxTheme>`, silently dropping theme overrides.
  '@colox/theme',
  // Icons are a sibling asset package, not part of the component bundle:
  // keeping them external preserves per-icon tree-shaking for consumers.
  '@colox/icons',
];

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
    // (`import '@colox/react/style.css') stays as the token cascade plus all
    // components. Per-component css splitting is a later step once component
    // styles grow large enough to pay for the assembly logic.
    cssCodeSplit: false,
    rollupOptions: {
      input: entries,
      external: externals,
      // Input-level preserveEntrySignatures: vite injects `false` here for app
      // builds (before spreading user config), and rollup rejects input-level
      // `false` under preserveModules. Override it at the level vite reads.
      preserveEntrySignatures: 'exports-only',
      // A raw rollup output array replaces `lib.formats`/`fileName`: per-format
      // naming is the only way to keep .js (ESM) and .cjs (CJS) extensions
      // correct under "type": "module". preserveModules emits one file per
      // source module (antd es/lib shape): no hashed chunks, component folders
      // keep their source layout.
      output: [
        {
          format: 'es',
          dir: 'dist',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: 'es/[name].js',
          // The css asset is emitted by both outputs with identical content;
          // a plain root-relative name makes dist/style.css the single public
          // css file no matter which output is written last.
          assetFileNames: 'style[extname]',
        },
        {
          format: 'cjs',
          dir: 'dist',
          preserveModules: true,
          preserveModulesRoot: 'src',
          entryFileNames: 'cjs/[name].cjs',
          assetFileNames: 'style[extname]',
        },
      ],
    },
  },
});
