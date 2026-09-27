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
- Per-component entry points (`@colox/react/<component>`) plus the
  public utility toolbelts: `@colox/react/cdk/date` (canonical-string
  date/time helpers — shipped).
- `@colox/wiki` doctrine data pack and `@colox/mcp` server.

### M1 — Form controls (shipped)

`Input`, `InputNumber`, `Textarea`, `Checkbox`, `Radio` (+ `Radio.Group`),
`Switch`, `Slider`, `DatePicker`, `Select`, `AutoComplete`.

### M2 — Layout mechanisms, complete (shipped)

`Positioner` (the positioned box) and `Anchor` (the reference frame), closing the
flexbox / grid / absolute trio. `Select` retro-fitted onto the shared
`cdk/combobox` kernel.

## What comes next

### M3 — Form layer (complete)

The validation and field layer the form controls deliberately left out:

- **`Form` + `Form.Field` / `Form.Label` / `Form.Hint` / `Form.Validate` +
  `useForm` — shipped.** Declarative rules (required / pattern / bounds /
  lengths / custom, sync or async), error messages, `deps` field linkage,
  `validateOn` policy (form-wide + per-field override), submit lifecycle.
  The required mark derives from the rules; a form-wide `disabled` lock
  cascades into every control; a failed submit lands on the first invalid
  field (`focusOnInvalid`); `useFormWatch`/`useFormWatchError` read the
  store from outside the tree; the edit-form loop is closed with
  `initialValues`, the silent `setValues` backfill and the user-edit-only
  `onValuesChange` report; a form-wide `size` cascades and a `colon`
  finishes the labels Chinese-admin style; dotted names travel nested and
  dynamic sections drop cleanly through `unregister`. A subsystem of its
  own, not a prop on
  `Input`; every field injects the family `{ event, value }` payload, so all
  twelve leaves read the same way. **The form base closes here** — the
  list-shaped dynamic form below was deliberately parked as its own slot,
  not forgotten.
- 动态表单 — the list-shaped form with add/remove rows. The block-level
  pattern already works: conditional fields round-trip their values (unmount
  keeps them, remount restores them — the controls are controlled), and
  `unregister(name)` drops a section for good. What is not first-class yet:
  row numbering is author-side, the export stays object-shaped
  (`rows.0.title` rebuilds to `{ rows: { 0: { title } } }` — no array
  synthesis so far), and unmounting an invalid field leaves an orphan error
  in the map that blocks submit until `unregister`. **Deferred — the design
  direction re-opens in a dedicated alignment round** (the block-level
  machinery above stays; the `Form.Array` / `FieldArray` primitive shape,
  numeric-segment array synthesis and the unmount-clears-error fix are
  theirs to settle).
- `Compact` — the visual joining base that replaced the reserved `InputGroup`
  slot — **shipped**: the seam primitive that joins the adjacent members into
  one unit (shared borders, radii only at the two ends, a state member paints
  the seam). Wordless by design — no gap/alignment/direction — members keep
  their own values and payloads; the same design makes the future
  `ButtonGroup`/`IconGroup` visual layer.
- `TimePicker` — the time sibling of `DatePicker` (same shell, panel and
  IconButton recipe) — **shipped**: the cdk `date` core (canonical-string
  clock math, curated `@colox/react/cdk/date` toolbelt) plus the component
  itself, with the three cyclic rolling columns, the confirm commit and
  the throttle-gated direct-write glide.

### M4 — Overlay family (next)

The cdk `floating` layer already provides positioning, portal and dismissal; this
milestone adds the semantics on top (focus management, scroll locking, ARIA):

- `Tooltip` — the hover/focus hint layer on the floating mechanism —
  **shipped**: zero container (the trigger is cloned in place — no wrapper
  element enters the authored DOM), two channels (the `content` prop form
  and the composed `Tooltip.Trigger` + `Tooltip.Content` form; giving both
  is a compile error, an empty content renders nothing), hover/click/manual
  visibility (`delay` as `{ in, out }`, timers always cancel their
  opposite, focus instant), `closeOnScroll` as the explicit opt-out of
  the default follow, `closeOnOutsideClick` (default true, the Popover
  word) and — under `manual` — the opt-in close channels echoing
  `onVisibleChange(false)` instead of closing, palette surfaces (gray/primary/info/error/warning/
  success/white, every one translucent at the design-language 0.9 alpha
  tier, borderless, no backdrop blur) with sm/md/lg tiers, a rotated
  diamond arrow half-buried under the bubble (no clip-path), one union
  drop-shadow cast on the panel (bubble + diamond silhouette together,
  offset following the arrow direction), pinned to the resolved
  placement (`data-placement` from the cdk popup, post-flip) while
  staying aimed at the trigger under boundary collision, and now the
  exit channel too (the cdk Popup `exitDuration` window — a fade-out
  plays on close). Upgrade side: the cdk
  `useFloatingPosition`/`Popup` gained the optional
  `fallbackPlacements` chain and the additive `exitDuration` exit
  channel (default 0 = the old instant unmount) — pickers unchanged.
- `Popover` — the interactive floating card (the Tooltip's interactive
  sibling, a non-modal dialog) — **shipped**: zero container (trigger
  cloned in place), two channels (the `title`/`content` prop form and
  the composed `Popover.Trigger` + `Popover.Title` + `Popover.Content`
  form; giving a word in both is a compile error, an empty content
  never opens), click/hover/manual visibility — click (default)
  toggles instantly and focuses the panel (Tab/Shift+Tab cycle
  trapped, Escape closes and returns the focus to the trigger, an
  outside close never steals it), hover rides `{ in: 300, out: 100 }`
  where the out-delay IS the pointer bridge into the panel and never
  steals focus, manual is the controlled word whose opt-in close
  channels (`closeOnOutsideClick` default true, `closeOnScroll`) echo
  `onVisibleChange(false)` — an opaque
  `bg-default` card (borderless, radius-lg) with a union drop-shadow
  cast at the Tooltip's calibration (direction follows the arrow),
  the same rotated diamond arrow recipe, content-owned width (no size
  axis), entrance fade+scale / exit fade on the shared cdk exit
  channel.
- `Modal`/`Dialog`, `Drawer`, `Toast`/`Notification` — planned.

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
