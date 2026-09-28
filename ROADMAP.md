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

### M4 — Overlay family (done — Tooltip/Popover/Modal/Drawer/Toast/Notify shipped)

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
- `Modal` — the modal dialog — **shipped**: the first consumer of the cdk
  `overlay` family (the full-screen carrier + dim backdrop, pure CSS flex
  centering — no floating math, a dialog has no reference to anchor to),
  purely composed (`<Modal visible>` + `Modal.Title` / `Modal.Content` /
  `Modal.Footer`; plain children are a compile error), always controlled
  (no defaultVisible — the corner close, Escape and a mask click all speak
  through `onVisibleChange(false)`), the strict focus trap (Tab never
  escapes, aria-modal, initial focus lands on the first focusable or the
  panel, closing restores the prior focus), the body scroll lock, size
  tiers bound to the design-language width tokens (sm/md/lg → 448/640/768px)
  plus a `width` escape hatch, the opaque `bg-default` card surface
  (borderless, radius-lg, union drop-shadow) and the fade+scale / fade
  entrance-exit pair on the shared cdk exit channel. The `Content` is the
  only scrolling region (title/footer stay fixed) — its scrollbar-padding
  interplay is tracked under M8 `ScrollView`.
- `Drawer` — the edge-anchored sliding panel — **shipped**: the second
  consumer of the cdk `overlay` family (Modal's sibling — same
  full-screen carrier, dim backdrop, strict trap and scroll lock; the
  only difference is the anchored edge: Modal centers, Drawer slides
  in from an edge). Purely composed `<Drawer visible>` + `Drawer.Title`
  / `Drawer.Content` / `Drawer.Footer` (plain children are a compile
  error), controlled only (no defaultVisible). The `direction` axis
  (left/right/top/bottom, default right) names the sliding edge —
  `placement` stays a floating-family word (it means "placed relative
  to a trigger"; a drawer has none). `size` = the content space: it
  sizes the panel width for left/right and the panel height for
  top/bottom (sm/md/lg → the 320/384/448px design-language tokens,
  symmetric across directions) with `width`/`height` escape hatches.
  Close via the corner button (`showClose` default true), Escape and
  the backdrop click; directional slide entrance/exit (translate from
  the anchored edge) on the shared cdk exit channel.
- `Toast`/`Notify` — **shipped**: the message system — a shared
  **scope-registry base** (cdk/message) with two imperative kinds.
  The consumer mounts one `<MessageViewport>` per container (default
  `root`, screen-wide `fixed`; `positioning="absolute"` pins a scoped
  container inside a `position: relative` parent). `Toast.…` is the
  lightweight hint kind — a slim single-line pill, default slot
  `top-center`, no title; `Notify.…` is the titled card kind —
  title + content, default slot `top-right`. No action slot on either
  kind — the message system is purely informational (report, don't
  ask): a 3s transient hint solicits no decision, and the titled card
  reports and closes — decision-tier interactions (undo/retry) are a
  dialog's job; custom interactive content rides the `content` node /
  `Toast.custom` / `Notify.custom` (an arbitrary ReactNode). Both kinds carry
  renderer chrome — `showIcon` / `closeable` (both default
  on) drop the mode icon / the corner ✕ on Toast AND the Notify card,
  fixed by the renderer not
  the payload, so chrome toggles apply eagerly while only the words
  ride the zoom. Both kinds
  are global imperative namespaces (callable from any code position —
  the content comes from a call, not the tree) routing into the scope
  named by `{ scope }`; the base scope table is shared, so **one
  container holds toast and notify entries side by side**, each in its
  own slot. Mode shortcuts on both kinds (info/success/warning/error —
  palette semantic icons), **palette** (six family colors, defaulting
  to the mode) and **variant** (plain/subtle/solid/outline surface)
  axes, **strategy** (`single` replaces in place — the Toast default,
  `stack` piles up — the Notify default), `custom` renders arbitrary
  content, `update(key, patch)` same-key in-place updates,
  `dismiss(key?)`, duration auto-dismiss (default ~3s, 0 = sticky),
  hover pause, manual close (IconButton muted, gated by `closeable`),
  per-item exit on the
  shared motion tier, `role="status"` (polite) by default. A slot
  showing more than two notify cards **folds** — the newest card stays
  visible, the rest stop rendering and fold into a count capsule (the
  tally + one clear-all ✕) — the viewport-pollution valve for
  notification bursts. Folded countdowns **freeze**: nothing deletes
  itself behind the user's back; closing the visible card pops the
  stack **in place** (the popped card leaves instantly — no exit
  animation — and the next card lands right there with the zoom
  entrance, the single-replacement update language; **only the last
  card of a fold plays the exit animation**) and the last survivor
  resumes its timer under a **countdown capsule** on its remaining
  seconds. A card arriving **while the capsule is out** is another
  such reveal — the frame stays, the fresh words zoom in. The message
  store is a shown→exiting→removed state machine (all timers in the
  store — duration, hover pause/resume on a holder counter so the fold
  freeze and hover pause stack, `DEFAULT_EXIT`=200 window;
  `single` replaces same-type same-slot entries IN PLACE at add time —
  same node, the new payload lands instantly and its words play a
  **zoom entrance** (a scale+fade re-mount on the shared motion tier —
  no opacity dip at all, for updates AND replacements); the
  countdown restarts; `update` visible payload changes land the same
  instant zoom way; every
  payload end — dismissed (✕ / dismiss), auto-expired,
  cleared or replaced in place — fires its `onClose({ id, data })`
  once, with the caller's opaque `data` passed through; the `outline` variant
  keeps the opaque bg-default card under its family border; the message
  pills take their depth from the design language (`--colox-shadow-md`).
  With this
  the M4 overlay family is complete: Tooltip / Popover / Modal / Drawer
  / Toast / Notify.

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

- `ScrollView` — the scroll container, the one home for every scroll scenario:
  the container itself (including the sticky ownership decision — a scroll
  relationship, not an absolute one; `ScrollView.Sticky` is the leading
  candidate), the scrollbar chrome (the double-engine recipe — `scrollbar-width`
  - `scrollbar-color` / `::-webkit-scrollbar-*` — token-pinned, unified across
    engines), and the loading extensions: scroll loading / dynamic loading (load
    more on reach, infinite scroll). **Driver**: the Modal `Content` scrollbar
    currently eats the right padding (a classic gutter renders inside the padding
    box — right side visually narrower than left). The ScrollView owns the fix
    (the scroll container owns its inline padding — `边框 | 滚动条 | padding | 内容` —
    the Textarea 定案 recipe); Modal content keeps its padding until ScrollView
    lands and adopts it.
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
