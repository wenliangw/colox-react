---
name: style
description: Wire Colox styling — the single style import, the token CSS variables, theming with ColoxTheme, and consumer override discipline.
whenToUse: When setting up styles in a consumer app for @colox/react, customizing theme/palette/breakpoints, dark mode, or writing app-level CSS around Colox components.
---

# Styling with Colox

## Setup

```ts
import '@colox/react/style.css';
```

Exactly once, at the app root: the package CSS bundles the theme cascade, so
one line covers components + theme.

## Token grid

Spacing, color and radii come from `--colox-*` CSS variables
(`--colox-spacing-4`, `--colox-color-bg-muted`, ...). Consume the variables;
never hand-write hex/px in app styles. Component props accept spacing keys
(`gap="4"`) that resolve to the same grid.

## Theming

`<ColoxTheme>` is optional: static defaults work provider-free. Mount it (with
`.Theme`/`.Palette`/`.Breakpoints`/`.Storage` dot parts or props) only when the
app customizes theme, palette, breakpoints or persistence. Dark mode is a data
attribute (`data-colox-theme="dark"`), not a second stylesheet.

## Consumer styles

Style custom blocks with `className` + token variables, compose on
`Stack.Item` instead of raw wrappers, and never override `colox-*` class
internals — extend through tokens.
