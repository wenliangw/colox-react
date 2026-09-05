---
name: colox-stack
description: Compose flexbox layouts with Colox Stack — rows, columns, toolbars, spacers and responsive gaps — following the blessed-child doctrine.
whenToUse: When building row/column flexbox layouts, toolbars, action bars, form rows or any flex distribution with @colox/react Stack.
---

# Composing layouts with Stack

`Stack` is the flexbox layout primitive. Canonical form:

```tsx
<Stack direction="row" gap="4" align="center" justify="between">
  <Stack.Item>alpha</Stack.Item>
  <Stack.Item>beta</Stack.Item>
</Stack>
```

Order of decisions: direction → gap → cross-axis align → main-axis justify → wrap.

## Recipes

### Toolbar / action bar

```tsx
<Stack gap="2">
  <Button variant="outline">Back</Button>
  <Stack.Item grow />
  <Button>Next</Button>
</Stack>
```

The `grow` Item is the spacer: it absorbs the free main-axis space.

### Form stack

```tsx
<Stack direction="column" gap="4" align="stretch" style={{ maxWidth: 400 }}>
  <Input placeholder="Name" />
  <Stack>{/* the second row inherits nothing — set its own props */}</Stack>
</Stack>
```

Note: `Stack` props never cascade to nested stacks.

### Responsive spacing

```tsx
<Stack gap="4">
  <Stack.Responsive gap={{ base: '2', md: '4', lg: '8' }} />
  <Stack.Item>block one</Stack.Item>
  <Stack.Item>block two</Stack.Item>
</Stack>
```

Resolution: the first configured band at-or-wider than the viewport band wins,
`base` last. The part renders nothing and restores the static `gap` on unmount.

## Guardrails

- Never use a bare `<div>` for a div-shaped child — use `<Stack.Item>`.
- Never wrap `Button`/`Input` in `Stack.Item` — place components directly.
- Never hand `@media` queries for stack spacing — mount `Stack.Responsive`.
- Never hand `px`/`margin` — spacing keys only (token grid).
- Never mount `Stack.Responsive` on a static layout.
