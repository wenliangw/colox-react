---
sidebar_position: 2
---

# Roadmap

`@colox/react` is a token-driven, accessible, tree-shakable component library. The
living roadmap — milestones, the definition of done every component passes, release
discipline and non-goals — lives in the repository:
[`ROADMAP.md`](https://github.com/wenliangw/colox-react/blob/master/ROADMAP.md).

## Shipped

- **Foundation** — `@colox/theme`, `@colox/theme-builder`, the React scaffold,
  `@colox/icons`, the internal cdk layers, `@colox/wiki` and `@colox/mcp`.
- **Layout** — `Stack`, `Grid`, `Container`, `Anchor`, `Positioner`.
- **Actions** — `Button`, `IconButton`.
- **Form controls** — `Input`, `InputNumber`, `Textarea`, `Checkbox`, `Radio`,
  `Switch`, `Slider`, `DatePicker`, `Select`, `AutoComplete`.
- **Form layer** — `Form` with `Form.Field` / `Form.Label` / `Form.Hint` /
  `Form.Validate` and `useForm`.

## Next

| Milestone                     | Contents                                                                 |
| ----------------------------- | ------------------------------------------------------------------------ |
| M3 Form layer (in progress)   | remaining: `FieldArray`, `InputGroup`, `TimePicker`                      |
| M4 Overlay                    | `Tooltip`, `Popover`, `Modal`, `Drawer`, `Toast`                         |
| M5 Display and feedback       | `Avatar`, `Badge`, `Tag`, `Alert`, `Progress`, `Skeleton`, `Empty`       |
| M6 Navigation and containment | `Tabs`, `Accordion`, `Card`, `Breadcrumb`, `Pagination`, `Menu`, `Steps` |
| M7 Data display               | `Table`, `VirtualList`, `Tree`                                           |
| M8 Scroll and geometry        | `ScrollView` (with sticky), `Affix`, `Splitter`                          |
| M9 Combobox consumers         | `Mentions`, `Cascader`, `TreeSelect`, `Transfer`                         |

Components with no product scenario yet (Carousel, Tour, Upload, …) are listed as
"on demand" in the repository roadmap and enter a milestone when a real need
appears — the library does not ship speculative APIs.

## How a component ships

Every component is designed with the maintainer before it is implemented, then
lands with contracts under `types/`, unit tests, a preview story, a docs page, a
component-map row, the wiki module record and a changeset — with formatting, lint,
typecheck, the full test suite and all three application builds green. Work that
jsdom cannot see (layout, positioning, overlays) is verified in a real browser
before review.
