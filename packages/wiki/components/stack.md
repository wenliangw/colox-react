# Stack

Flexbox layout primitive — one component for the flexbox mechanism.

**Import**: `import { Stack } from '@colox/react'`

## API

### Stack

| Prop      | Type                                                                | Default     | Maps to         |
| --------- | ------------------------------------------------------------------- | ----------- | --------------- |
| direction | `'row' \| 'column' \| 'row-reverse' \| 'column-reverse'`            | `'row'`     | flex-direction  |
| gap       | spacing key (`'1'`…`'16'`, `'0-5'`…`'4-5'`)                         | — (gap: 0)  | gap             |
| align     | `'start' \| 'center' \| 'end' \| 'stretch' \| 'baseline'`           | `'stretch'` | align-items     |
| justify   | `'start' \| 'center' \| 'end' \| 'between' \| 'around' \| 'evenly'` | `'start'`   | justify-content |
| wrap      | `boolean`                                                           | `false`     | flex-wrap       |

Accepts all native `<div>` attributes; forwards ref.

### Stack.Item

| Prop | Type      | Default | Maps to   |
| ---- | --------- | ------- | --------- |
| grow | `boolean` | `false` | flex-grow |

The blessed div-shaped child container: full native passthrough (attributes,
events, `className`, ref). Bare divs remain legal but examples and doctrine
standardize on Item.

### Stack.Responsive

| Prop | Type                                            | Notes                                        |
| ---- | ----------------------------------------------- | -------------------------------------------- |
| gap  | `{ base?, sm?, md?, lg?, xl? }` of spacing keys | resolves against the current breakpoint band |

Mounted capability; renders nothing. Must be mounted inside a `Stack`; the last
mounted instance wins (LWW) and unmounting restores the static `gap`.

## Mechanism

- **CSS**: `display: flex` with per-axis CVA classes (`colox-stack--direction-*`,
  `colox-stack--gap-*`, ...); `Stack.Item` renders `colox-stack-item` plus
  `colox-stack-item--grow` when `grow`.
- **Responsive resolution**: the theme runtime publishes the current band on
  `<html data-colox-breakpoint>`; `Stack.Responsive` resolves its config with
  `resolveResponsiveValue` from `@colox/theme` (first configured band at-or-wider
  wins, `base` last) and registers the result with the enclosing Stack.
- **Context discipline**: a static `Stack` reads no theme context — only the
  mounted `Stack.Responsive` does.

## Related

- Rules: `rules/stack.rule.md`
- Recipe: `skills/stack/SKILL.md`
