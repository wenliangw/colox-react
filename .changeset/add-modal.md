---
'@colox/react': minor
'@colox/wiki': minor
---

Add Modal: the modal dialog — the first consumer of the new cdk
`overlay` (the full-screen overlay family, distinct from the anchored
floating family: no trigger, no reference, no collision math —
positioning is pure CSS flex centering, zero JS measurement). Purely
composed: `<Modal visible>` holds the overlay and the body lives in
`<Modal.Content>` with optional `<Modal.Title>` / `<Modal.Footer>`
around it; plain children and duplicated parts are compile errors.
Controlled only — no `defaultVisible`; the corner close button
(`showClose` default true), Escape and a backdrop click
(`closeOnMaskClick` default true) all speak through
`onVisibleChange(false)`. The strict focus trap keeps the keyboard
inside (`aria-modal`, Tab never escapes, `initialFocus` first or
container) and closing hands the focus back to whatever had it
before; the body scroll locks while open. The width tier is `size`
(sm / md / lg — the design-language 448 / 640 / 768px tokens, never
invented numbers) with a `width` escape hatch. Opaque `bg-default`
card, borderless, radius-lg, union drop-shadow; entrance fade+scale,
exit fade on the overlay's exit window.

The cdk gains the shared layer behind it: `cdk/overlay` (`Overlay`
carrier + `Backdrop` mask, reused by the coming Drawer),
`cdk/hooks` (`usePresence`, `useTrap`, `useScrollLock`) and
`cdk/utils/focusables`. Popover migrates its focus machine to the
shared `useTrap` (soft mode, behavior-equivalent — its test suite
passes unchanged), and the popover-local `focusables.ts` is promoted
to `cdk/utils`. Per-subpath entry `@colox/react/modal`, preview
stories, a docs page and the wiki component map updated in lockstep.
