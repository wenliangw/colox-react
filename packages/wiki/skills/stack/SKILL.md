---
name: stack
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

### Form stack

```tsx
<Stack direction="column" gap="4" align="stretch" style={{ maxWidth: 400 }}>
  <Input placeholder="Name" />
</Stack>
```

### Responsive spacing

```tsx
<Stack gap="4">
  <Stack.Responsive gap={{ base: '2', md: '4', lg: '8' }} />
  <Stack.Item>block one</Stack.Item>
</Stack>
```

## Reference files

Read `references/rules.md` before writing any Stack code — it is the
authoritative must/avoid list. `references/component.md` holds the full API,
defaults and mechanism.
