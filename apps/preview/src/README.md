# Component examples

Storybook stories for the component library live here, organized by
component directory — this app is the preview environment, so its
examples are app content, not library source.

```
src/
├── <Component>/          # e.g. button/, input/
│   └── <component>.stories.tsx   # one Overview story per component
└── showcase/
    └── section.tsx       # shared Section exhibit helper
```

Conventions:

- Import components from `@colox/react` (the consumer perspective, or
  the layout components when used as exhibit scaffolds).
  The preview dev server aliases `@colox/react` to the component source,
  so examples stay hot-reloadable during development.
- **One Overview story per component**: group the component's states
  into `Section` blocks (sizes, variants, slots, states, ...) ordered
  from pure form to interaction. Add a section for a state only when it
  carries a visually distinct, real axis — no one-demo-per-story spam.
- Exhibit pages are laid out with the library's own layout components
  (`Container` + `Stack` scaffolds, `Grid` for multi-column demos), set
  `parameters.layout = 'fullscreen'` on the meta and let the `Container`
  cap (`md` for form content and grid demos; `xl` for width-cap demos).
- **Layout demos must make their reference frames visible**: draw the
  available width with the shared `track` style (dashed border), bound
  reading rows to `bound()` (`min(480px, 100%)`), and show Container
  caps against a full-width track instead of nesting invisible shells.
  Fluid viewport-scale demos (`Stack.Responsive`) sit outside the capped
  column at page width, or their bands can never change.
- Interactive rows (clearable, filterPattern, toggles) hold their state
  in a small local component inside the story file.
