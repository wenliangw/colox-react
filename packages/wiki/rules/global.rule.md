# Global Rules

Cross-component doctrine for @colox/react. Format:
`[condition] → action. Why: reason.`

1. `[styling anything]` → `className` + `--colox-*` CSS variables; never inline
   style objects for layout/spacing/color.
   Why: the token grid is the theming contract; the class is the escape hatch.
2. `[app entry]` → `import '@colox/react/style.css'` exactly once.
   Why: the package CSS is self-contained (the theme cascade is bundled in).
3. `[theme customization]` → mount `<ColoxTheme>` with theme/palette/breakpoints
   props only when the app changes them.
   Why: static defaults are served provider-free, so the provider is opt-in.
4. `[choosing a layout]` → pick the mechanism, not the look: flexbox = `Stack`,
   grid = `Grid` (when available), absolute positioning context = `Positioner` (when
   available), semantic width shell = `Container` (when available).
   Why: one component per layout mechanism keeps the API surface minimal.
5. `[consumer composition]` → build app-level primitives on the library parts
   (`Stack.Item`, `Button`, ...) with `forwardRef` + `className` merge rather than
   re-wrapping in hand-rolled divs.
   Why: refs, native attributes and the library vocabulary stay intact.
