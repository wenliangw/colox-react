# Colox React — AI Agent Doctrine

Colox is a token-driven React component library. This file is the compact doctrine
for AI agents; the full sources live beside it:

- `skills/<name>/SKILL.md` — procedural recipes (how to compose a feature)
- `rules/<name>.rule.md` — conditional rules: condition → action → why
- `components/<name>.md` — per-component reference (props, classes, mechanism)

Rules are written as `[condition] → action` pairs with the reason attached. The
reason is the part that generalizes: when the condition does not match your case
exactly, apply the reason, not the letter.

## Global rules

- `[spacing/alignment]` → use token props (`gap`/`align`/`justify`) or
  `--colox-*` CSS variables. Never hand-write `px`/`margin`/hex values.
  Why: the token grid is the theming contract; hand values break re-theming.
- `[app root]` → `import '@colox/react/style.css'` exactly once.
  Why: the package CSS is self-contained (theme cascade included).
- `[theme]` → wrap only in `<ColoxTheme>` when the app customizes
  theme/palette/breakpoints. Why: static defaults work provider-free.
- `[div-shaped child]` → `<Stack.Item>` is the blessed div replacement.
  Why: it is the item-axis host and the composition base; see the Stack rules.
- `[component-shaped child]` → place the component directly, never wrap it in
  an extra div "for layout". Why: the component itself is the layout unit.

## Stack — quick rules

- `[need a flexbox layout]` → `<Stack>`: `direction`/`gap`/`align`/`justify`/`wrap`.
  CSS-faithful defaults: `row` / no gap / `stretch` / `start`.
- `[div-shaped child]` → `<Stack.Item>`, not a bare `<div>`.
  Why: Item is the item-axis host (`grow` today; `basis`/`shrink`/`alignSelf`
  land there) and the composition base — a bare div renders identically today
  but forfeits both.
- `[component-shaped child]` → place it directly; never wrap `Button`/`Input`
  in `Stack.Item`. Why: a zero-value DOM layer.
- `[spacer]` → `<Stack.Item grow />`. Never `margin: auto` or `width: 100%`.
- `[responsive gap]` → `<Stack.Responsive gap={{ base?, sm?, md?, lg?, xl? }} />`
  mounted inside the `Stack`. Never CSS media queries. Why: resolution follows the
  theme breakpoint bands (narrow bands win, `base` is the last fallback).
- `[static layout]` → no `Stack.Responsive` "just in case".
  Why: capability is mountable, not default; a static Stack stays context-free.

Full rules: `rules/stack.rule.md` · recipes: `skills/stack/SKILL.md` ·
reference: `components/stack.md`
