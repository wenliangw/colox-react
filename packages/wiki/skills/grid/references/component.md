# Grid

CSS Grid layout primitive — equal tracks, per-breakpoint columns, token gaps.

**Import**: `import { Grid } from '@colox/react'`

## API

### Grid

| Prop    | Type                                                                | Default       | Maps to                        |
| ------- | ------------------------------------------------------------------- | ------------- | ------------------------------ |
| columns | `number \| { sm?, md?, lg?, xl? }`                                  | `1`           | grid-template-columns (repeat) |
| gap     | spacing key (`'1'`…`'16'`, `'0-5'`…`'4-5'`) \| `{ row?, column? }`  | — (gap: 0)    | gap / row-gap / column-gap     |
| align   | `'start' \| 'center' \| 'end' \| 'stretch'`                         | — (`stretch`) | align-content (block axis)     |
| justify | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | — (`start`)   | justify-content (inline axis)  |

Accepts all native `<div>` attributes; forwards ref.

### Grid.Item

| Prop | Type     | Default | Maps to                            |
| ---- | -------- | ------- | ---------------------------------- |
| span | `number` | `1`     | grid-column: span var (inline var) |

The blessed div-shaped grid child: full native passthrough (attributes, events,
`className`, ref).

## Mechanism

- **CSS**: `display: grid` root plus per-axis CVA classes
  (`colox-grid--gap-*`, `colox-grid--row-gap-*`, `colox-grid--column-gap-*`,
  `colox-grid--align-*`, `colox-grid--justify-*`); the template is
  `repeat(var(--colox-grid-columns, 1), minmax(0, 1fr))`.
- **Column resolution**: the root reads the theme breakpoint context and
  resolves `columns` with `resolveResponsiveValue` from `@colox/theme`
  (min-width activation: the last configured band at-or-narrower than the
  current one wins; `base` = beyond the widest cap and keeps the last
  configured value); the resolved count rides the `--colox-grid-columns`
  inline custom property into the single template rule — arbitrary counts
  stay class-free. A static number is the everywhere-form.
- **Span resolution**: `Grid.Item` writes `--colox-grid-item-span: span N`
  inline; the item rule reads it with an `auto` fallback.
- **Context discipline**: the root consumes the theme context for the band
  only; without a provider it warns once and renders the static default.

## Related

- Rules: `references/rules.md`
- Recipe: `../SKILL.md`
