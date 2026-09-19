# Colox React — AI Agent Doctrine

Colox is a token-driven React component library. This file is the compact
doctrine digest for AI agents; the full sources live beside it:

- `components.md` — component map (responsibility + status per primitive)
- `skills/<name>/SKILL.md` — one bundle per topic: the procedural recipe in
  the body, `references/` holding the layers read on demand
  (`rules.md` = must/avoid, `component.md` = API reference)
- `skills/doctrine/` — the doctrine's own manual (read order) + global rules
- `skills/style/` — styling setup, token grid, theming, override discipline

Rules are written as `[condition] → action` pairs with the reason attached. The
reason is the part that generalizes: when the condition does not match your case
exactly, apply the reason, not the letter.

## Global rules

- `[spacing/alignment]` → use token props (`gap`/`align`/`justify`) or
  `--colox-*` CSS variables. Never hand-write `px`/`margin`/hex values.
  Why: the token grid is the theming contract; hand values break re-theming.
- `[app root]` → `import '@colox/react/style.css'` exactly once.
  Why: the package CSS is self-contained (theme cascade included).
- `[bundle size matters]` → import components per-entry
  (`@colox/react/button`, `/container`, `/input`, `/stack`) instead of the barrel.
  Why: each component is its own build entry, so bundlers drop the rest;
  `style.css` stays the single import either way.
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
- `[responsive gap]` → `<Stack.Responsive gap={{ sm?, md?, lg?, xl? }} />`
  mounted inside the `Stack`. Never CSS media queries. Why: keys are the fixed
  breakpoint contract (no `base`); a key activates at its band and carries
  upward, unconfigured bands keep the latest value, the static `gap` is the
  fallback below the first configured band.
- `[static layout]` → no `Stack.Responsive` "just in case".
  Why: capability is mountable, not default; a static Stack stays context-free.

## Container — quick rules

- `[page width ceiling]` → `<Container>`: `size`/`gutter`/`align`. Each size cap is a
  large-dimension design token (`--colox-size-*`): sm/md/lg/xl = 640/768/1024/1280px.
  Defaults: no `size` = no cap, no gutter, `align="center"`. `align` places the box
  on the inline axis (`start`/`center`/`end` — box-alignment words, never physical
  `left`/`right`).
- `[layout]` → keep mechanisms separate: `<Container><Stack>…</Stack></Container>`,
  never flexbox/grid semantics inside Container. Why: Container owns only the
  width shell (one mechanism per component).

## Grid — quick rules

- `[grid layout]` → `<Grid>`: `columns`/`gap`/`align`/`justify` + `<Grid.Item span>`.
  Defaults: 1 column, no gap, CSS-faithful `stretch`/`start` track distribution.
- `[equal tracks]` → `columns={n}` — any number, not locked to a 12-column convention.
  Why: the template is `repeat(n, minmax(0, 1fr))`; 12 is a use pattern, not a limit.
- `[responsive columns]` → `columns={{ sm?, md?, lg?, xl? }}`. Never media queries.
  Why: fixed breakpoint contract (no `base`), min-width activation — a key starts
  at its band and carries upward; below the first configured band the default
  (1) applies.
- `[per-axis gap]` → `gap="4"` (both axes) or `gap={{ row: '4', column: '6' }}`.
  Never raw px. Why: spacing keys re-theme; CSS row-gap/column-gap order.
- `[featured cell]` → `<Grid.Item span={n}>`. Why: span is the item-axis
  vocabulary; it rides a custom property so arbitrary counts stay class-free.

## Anchor — quick rules

- `[positioning context]` → `<Anchor>`: a layout-neutral relative box; whatever is
  inside becomes the reference for absolutely positioned children (a `Positioner`,
  or a hand-written absolute box). Why: it owns only the positioning relationship —
  flexbox/grid flow stays with Stack/Grid.
- `[overlay on a control]` → `<Anchor inline>` so the frame box matches the
  control's box, then pin a `<Positioner>` inside. Why: nothing extra appears in the
  DOM beyond the positioned box.
- `[frame inside a frame]` → no second Anchor: a positioned `Positioner` is itself a
  reference for its children.

## Positioner — quick rules

- `[positioning mechanism]` → two names, one role each: `<Anchor>` is the reference
  frame (a relative box; `inline` hugs the control so an overlay pins to it), and
  `<Positioner>` is the positioned box — `absolute` by default (against the nearest
  positioned ancestor) or `fixed` (against the viewport). A positioned box is itself
  a reference, so frames compose without a second Anchor. Why: the third mechanism —
  flexbox/grid flow stays with Stack/Grid, and it owns only the CSS positioning
  relationship (no measurement, no portal).
- `[anchor word]` → block axis is physical (`top`/`bottom` — they never mirror),
  inline axis is logical (`start`/`end` — they mirror in RTL). Never physical
  left/right. Why: one word family across `placement`, `offset` and the layout
  components.
- `[distance from an edge]` → `offset="2"` (spacing key) spaces the edges the
  placement pins; `offset={{ top, bottom, start, end }}` states each edge and pins
  the edges it names. Never raw px.
- `[badge on a control]` → see the Anchor rules: `<Anchor inline>` around the
  control, then a `<Positioner placement="top-end" offset="1">`.
- `[page-level layer]` → `<Positioner position="fixed">` (`fill` for a full-viewport
  scrim) — no Anchor involved. Why: fixed resolves against the viewport — mind
  transformed ancestors, which become its containing block.
- `[sticky / pin inside a scroller]` → not this mechanism: sticky is a scroll
  relationship, owned by the scroll component.
- `[follow an anchor / flip at edges / escape overflow]` → the floating layer owns
  measurement and portals. Why: one mechanism per component.

Full sources: `skills/doctrine/SKILL.md` (read order) ·
`skills/doctrine/references/rules.md` (global rules) ·
`skills/stack/references/rules.md` (stack rules) ·
`skills/stack/references/component.md` (stack reference)
