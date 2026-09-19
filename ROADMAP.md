# Roadmap

Colox React is a token-driven, accessible, tree-shakable React component library.
This roadmap is the single source of truth for **what we build next and how a
component ships**: milestones below order the work, and the definition of done at
the bottom is the checklist every component passes before it lands.

Status legend: **shipped** · **next** · **planned** · **on demand** (no scenario
yet — we do not build speculative APIs).

## Where we are

### M0 — Foundation (shipped)

The tooling and the vocabulary the rest of the library stands on:

- `@colox/theme` runtime (provider, palettes, breakpoints, storage) and
  `@colox/theme-builder` (token pipeline, `colox theme build`, JSON schema).
- `@colox/react` per-component build entries, one `style.css`, subpath exports.
- Layout mechanisms: `Stack` (flexbox), `Grid` (tracks), `Container` (width shell).
- Actions: `Button`, `IconButton`; first-party `@colox/icons` (stroke family).
- Internal cdk layers: `floating` (popup/position/dismiss), `combobox`
  (option word + filter + keyboard + walk), `input-control`.
- `@colox/wiki` doctrine data pack and `@colox/mcp` server.

### M1 — Form controls (shipped)

`Input`, `InputNumber`, `Textarea`, `Checkbox`, `Radio` (+ `Radio.Group`),
`Switch`, `Slider`, `DatePicker`, `Select`, `AutoComplete`.

### M2 — Layout mechanisms, complete (shipped)

`Positioner` (the positioned box) and `Anchor` (the reference frame), closing the
flexbox / grid / absolute trio. `Select` retro-fitted onto the shared
`cdk/combobox` kernel.

## What comes next

### M3 — Form layer (in progress)

The validation and field layer the form controls deliberately left out:

- **`Form` + `Form.Field` / `Form.Label` / `Form.Hint` / `Form.Validate` +
  `useForm` — shipped.** Declarative rules (required / pattern / bounds /
  lengths / custom, sync or async), error messages, `deps` field linkage,
  `validateOn` policy, submit lifecycle. A subsystem of its own, not a prop on
  `Input`; every field injects the family `{ event, value }` payload, so all
  twelve leaves read the same way.
- `FieldArray` — repeating field groups (remaining).
- `InputGroup` — the sibling component whose class namespace `colox-input-group*`
  is already reserved (remaining).
- `TimePicker` — the time sibling of `DatePicker` (same shell, panel and
  IconButton recipe) (remaining).

### M4 — Overlay family (planned)

The cdk `floating` layer already provides positioning, portal and dismissal; this
milestone adds the semantics on top (focus management, scroll locking, ARIA):

- `Tooltip`, `Popover`, `Modal`/`Dialog`, `Drawer`, `Toast`/`Notification`.

### M5 — Display and feedback (planned)

- `Avatar`, `Badge`, `Tag` (the size/rounded habits for shape components are
  already recorded in the API-design taste), `Alert`, `Progress`, `Skeleton`,
  `Empty`.

### M6 — Navigation and containment (planned)

- `Tabs`, `Accordion`, `Card`, `Breadcrumb`, `Pagination`, `Dropdown`/`Menu`,
  `Steps`.

### M7 — Data display (planned)

- `Table` (the largest single component) and `VirtualList`, then `Tree`.

### M8 — Scroll and geometry (planned)

- `ScrollView` — the scroll container, including the sticky ownership decision
  (a scroll relationship, not an absolute one; `ScrollView.Sticky` is the leading
  candidate).
- `Affix`, `Splitter` — on demand.

### M9 — Combobox kernel consumers (planned)

The `cdk/combobox` kernel was built for reuse; these are its next consumers:

- `Mentions`, `Cascader`, `TreeSelect` (search), `Transfer`.

### On demand

`Carousel`, `Tour`, `QRCode`, `Statistic`, `Descriptions`, `Segmented`,
`Timeline`, `Rate`, `Upload`, `Result`, `Watermark` — no scenario yet. They enter
a milestone when a real product need appears, not before.

## Definition of done

Every component ships through these steps; a component missing one is not done.

1. **Design aligned first.** The API is settled with the maintainer before any
   implementation (the "which axes, which words, what is out of scope" round).
   No implementation starts from an unaligned design.
2. **House structure.** Component folder with `types/` contracts by capability
   layer, `variants/` per axis, `styles/` aggregated through `@use`, `children/`
   for dot parts only, `utils/` for pure functions, `hooks/` for state/behavior.
3. **Contract-level quality.** Public props extend the native element attributes,
   forward `ref`, merge `className`, keep the loading-order (props → methods →
   events), never `any`, never a silent no-op.
4. **Accessibility and RTL are part of the API**, not a follow-up: focus
   ownership, keyboard model, reachable names, logical (not physical) inline
   words.
5. **Tests.** `_tests/` units for every axis and behavior. Work that jsdom cannot
   see (layout, positioning, overlays, hit areas) also gets a real-browser probe
   before review.
6. **Docs in lockstep.** Preview story (one Overview, `Section`-grouped), docs
   page + sidebar, `packages/wiki/components.md` row, `wiki/modules/<name>.md`
   and the overview index, plus the `.changeset` entry.
7. **Gates green.** `prettier`, `eslint`, `tsc --noEmit`, the full `vitest` suite,
   and the `components`, `storybook` and `docs` builds — all with real exit codes.
8. **Commit split.** `feat(<component>)` for the code, tests, stories, docs and
   changeset; `docs(mesync)` for the memory records. Push after review.

## Release discipline

- **Changesets carry the meaning**: a new component or a public API change is a
  `minor`; a component bugfix is a `patch`; no entry for internal refactors.
- **`@colox/react` and `@colox/wiki` share their major.minor**; the wiki patch
  slot is reserved for component bugfixes, and the wiki follows API, semantics or
  behavior changes — never cosmetics.
- **`@colox/mcp` follows the wiki** through the internal dependency bump.

## Non-goals

- **No styling-prop explosion.** Token props (`gap`, `size`, `palette`, …) and
  `--colox-*` CSS variables are the theme contract; there is no
  `css`-in-JS or styled-system surface.
- **One mechanism per component.** Layout stays with `Stack`/`Grid`/`Positioner`,
  the width shell with `Container`; components do not grow a second mechanism.
- **No speculative APIs.** Capabilities arrive with a real consumer (the
  `cdk/combobox` kernel exists because two consumers needed it).
- **Measurement belongs to the mechanism that owns it.** Following an anchor,
  flipping, collision and portals stay in the floating layer; absolute
  positioning boxes do not measure.
