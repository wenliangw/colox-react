# Contributing to Colox React

Thanks for your interest in contributing!

## Ground rules

- **Code comments and commit messages are written in English** — this is an
  open-source project whose history must be readable for everyone.
  `.mesync/` is maintainer-only internal memory and stays in Chinese.
- **Comments are kept minimal.** Prefer self-documenting code. Add a comment
  only when it explains _why_ (a pipeline step, an obscure constraint) — never
  to restate what the code does.
- **No patch code.** Make the right choice, not a workaround: if a fix starts
  to feel like a patch, revisit the design instead of committing it. Keep the
  codebase clean and evolving forward.
- **JSDoc uses the multi-line form** for prop types:

  ```ts
  /**
   * Size of the input.
   * @default 'md'
   */
  ```

## Commit convention

[Conventional Commits](https://www.conventionalcommits.org/) with English
messages. The `commit-msg` git hook rejects CJK characters, and commitlint
enforces the type/format.

## Setup

```sh
pnpm install
pnpm --filter @colox/react build       # library build (regenerates design tokens)
pnpm --filter @colox/react typecheck
pnpm --filter @colox/react test
pnpm --filter @colox/preview dev     # component playground
```

## Design tokens

Tokens are generated artifacts:

```
Figma exports (src/styles/meta/*.tokens.json)
  → figma-to-tokens.mjs (`pnpm tokens:sync`)
  → src/styles/tokens/* (generated, gitignored)
  → Style Dictionary v4 (`pnpm emit:themes`)
  → dist/themes/light.css (runtime CSS variables)
```

Hand-maintained sources live in `src/styles/tokens/base.tokens.json`
(font family / shadow / motion / breakpoints) and
`semantic.derived.tokens.json` (solid hover/active color-mix rules). Every
entry script (`build`, `typecheck`, storybook `predev`) regenerates tokens
first, so a fresh clone never needs a manual generation step.

## Component conventions

- Arrow-function components with `forwardRef`; props extend the native HTML
  attribute interface.
- Variants via CVA; classes follow `colox-` BEM (`colox-<component>--<variant>`);
  conditional classes via `clsx`.
- Component styles consume token CSS variables (`var(--colox-*)`) imported
  from `dist/themes/light.css`.

Questions? Open an issue.
