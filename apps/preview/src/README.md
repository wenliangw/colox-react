# Component examples

Storybook stories for the component library live here, organized by
component directory — this app is the preview environment, so its
examples are app content, not library source.

```
src/
└── <Component>/          # e.g. button/, input/
    └── *.stories.tsx     # one story file per concern
```

Conventions:

- Import components from `@colox/react` (the consumer perspective).
  The preview dev server aliases that package to the component source,
  so examples stay hot-reloadable during development.
- One story file per concern (size, state, ...); keep legacy stories
  under `packages/components` until those components are rewritten.
