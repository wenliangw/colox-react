---
name: grid
description: Compose CSS Grid layouts with Colox Grid — equal column tracks, per-breakpoint columns, per-axis gaps and spanned items — following the token grid doctrine.
whenToUse: When building grid layouts — responsive column counts, tile rows, bento boxes, feature grids — with @colox/react Grid.
---

# Composing layouts with Grid

`Grid` is the CSS Grid layout primitive. Canonical form:

```tsx
<Grid columns={{ sm: 1, md: 2, lg: 4 }} gap="4">
  <Grid.Item>alpha</Grid.Item>
  <Grid.Item span={2}>beta</Grid.Item>
</Grid>
```

Order of decisions: columns → gap → block-axis align → inline-axis justify →
item span.

## Recipes

### Equal tiles

```tsx
<Grid columns={3} gap="4">
  <Grid.Item>tile one</Grid.Item>
  <Grid.Item>tile two</Grid.Item>
  <Grid.Item>tile three</Grid.Item>
</Grid>
```

### Responsive dashboard

```tsx
<Grid columns={{ sm: 1, md: 2, lg: 6 }} gap={{ row: '4', column: '6' }}>
  <Grid.Item span={2}>metric</Grid.Item>
</Grid>
```

## Reference files

Read `references/rules.md` before writing any Grid code — it is the
authoritative must/avoid list. `references/component.md` holds the full API,
defaults and mechanism.
