# Colox React

A modular, accessible React component library monorepo built with **Vite + TypeScript + React**, with **Storybook** for component preview and **Docusaurus** for official documentation.

## Tech stack

| Area                       | Choice                                                                 |
| -------------------------- | ---------------------------------------------------------------------- |
| Package manager / monorepo | pnpm workspaces                                                        |
| Build                      | Vite (library mode) + `vite-plugin-dts` (ESM/CJS + types + CSS bundle) |
| Framework                  | React 19 + TypeScript 5                                                |
| Styling                    | SCSS + CSS (design tokens, component-level `.scss`)                    |
| Component preview          | Storybook 8 (`@storybook/react-vite`)                                  |
| Documentation              | Docusaurus 3 (live component examples in MDX)                          |
| Testing                    | Vitest + Testing Library                                               |
| Code quality               | ESLint 9 (flat config) + Prettier + EditorConfig                       |
| Commit convention          | Commitlint + Husky + lint-staged                                       |
| Versioning                 | Changesets                                                             |

## Structure

```
colox-react/
├── packages/
│   └── components/        # @colox/react — the component library
├── apps/
│   ├── storybook/         # component preview (dev environment)
│   └── docs/              # Docusaurus official documentation site
├── .changeset/            # versioning config
├── .husky/                # git hooks
└── root config            # eslint, prettier, commitlint, tsconfig...
```

## Getting started

```bash
pnpm install
```

### Develop components (Storybook)

```bash
pnpm dev
```

Storybook reads stories co-located with components in `packages/components/src/**/*.stories.tsx`, with full source-level HMR.

### Develop docs (Docusaurus)

```bash
pnpm docs:dev
```

This builds `@colox/react` once, then watches it while Docusaurus runs, so MDX live examples stay in sync.

## Scripts

| Script                              | Description                                  |
| ----------------------------------- | -------------------------------------------- |
| `pnpm dev`                          | Start Storybook                              |
| `pnpm build`                        | Build the component library (`@colox/react`) |
| `pnpm build:storybook`              | Build static Storybook                       |
| `pnpm docs:dev` / `pnpm docs:build` | Run / build Docusaurus docs                  |
| `pnpm lint` / `pnpm lint:fix`       | Lint the monorepo                            |
| `pnpm format` / `pnpm format:check` | Format / check formatting                    |
| `pnpm typecheck`                    | Type-check all packages                      |
| `pnpm test`                         | Run unit tests                               |
| `pnpm changeset`                    | Add a changeset                              |

## Consuming the library

```tsx
import { Button } from '@colox/react';
import '@colox/react/style.css';

function App() {
  return <Button variant="primary">Click me</Button>;
}
```

## Commit convention

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) (enforced by Commitlint via Husky):

```
feat: add Button component
fix(button): correct disabled styling
docs: update README
```

## License

MIT
