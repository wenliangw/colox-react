---
'@colox/react': minor
'@colox/wiki': minor
---

Optimize the message system (Toast / Notify) with three axes to fight
viewport pollution:

- **palette + variant on both kinds** — the design language's six
  family colors (`gray` / `primary` / `info` / `success` / `warning` /
  `error`, defaulting to the mode) and a four-rung surface strength
  (`plain` default / `subtle` / `solid` / `outline`). The mode still
  picks the semantic icon glyph; the palette drives its color and the
  variant paint. The cdk kind discriminator (`toast` / `notify`) is
  renamed from `MessageVariant` to `MessageFace` to free `variant` for
  the visual axis (pre-release, no public break).
- **strategy: single vs stack** — Toast defaults to `single` (a
  lightweight centered hint; a new toast replaces the current one in
  its slot IN PLACE — same node, no re-mount, no position shift, one
  toast per position whatever its palette/variant), Notify defaults to
  `stack` (titled cards can coexist). Per-call override on both kinds.
- **in-place replacement zoom** — a same-node replacement lands
  instantly and the content node re-mounts (its React key is the
  entry's contentVersion) with a zoom-in entrance (scale + fade, the
  normal motion token) — the same shape as an update. The opacity dip
  is gone from updates AND replacements: no trough, no container
  transition — the zoom on the landed words is the whole swap
  feedback. The countdown restarts for the fresh payload. Invisible
  patches (duration/key only) apply instantly without blinking.
- **notify deck** — a slot that accumulates more than three notify
  cards collapses into a stacked deck: the newest card fully visible,
  two behind it peeking as clipped strips, the rest folded into a
  `+N` count chip. Clicking the deck (or the chip) expands it into
  the full newest-first stack; the collapse chip folds it back. Cards
  keep their timers and interactions in both states.
- **toast chrome** — `showIcon: false` drops the mode icon,
  `closeable: false` drops the corner ✕ (both default on). Chrome is
  renderer-owned, structural state: it toggles eagerly and never
  rides the payload — only the words re-mount (with the zoom) on a
  visible payload change. The Notify card honors the same chrome
  flags and adds the shared lifecycle axes — its call options align
  with Toast's full surface (`showIcon` / `closeable` / `data` /
  `onClose`).
- **both kinds drop the `action` slot** — the message system is
  purely informational (report, don't ask): a 3s transient hint
  solicits no decision, and the titled Notify card reports and closes
  too — decision-tier interactions (undo/retry) are a dialog's job.
  The base `MessageAction` type and `MessageOptions.action` are
  removed with their last consumer. Custom interactive content rides
  the `content` node / `Toast.custom` / `Notify.custom` (any
  ReactNode). The data-shaped `{ label, onClick }` was the slot's
  only defensible form — a ReactNode slot would just be `content`
  again.
- **update zoom entrance** — a visible `update(key, patch)` no longer
  dips the container's opacity: the new payload lands instantly and
  the content node re-mounts (its React key is the entry's
  contentVersion) with a zoom-in entrance (scale + fade, the normal
  motion token). Replacements land the exact same instant way (see
  above) — no dip anywhere.
- **data + onClose** — `data` is an opaque pass-through the store
  keeps untouched; `onClose` fires once per add call's payload end
  (dismissed / auto-expired / cleared / replaced in place) with
  `{ id, data }`. An `update` continues the same payload, so it never
  fires.
- **outline surface** — the `outline` variant keeps the opaque
  bg-default card (same as `plain`) and draws the 1px family border on
  it, instead of a transparent card.
- **design-language depth + Toast kind renames** — the message pills
  take their shadow from the design language (`box-shadow:
  var(--colox-shadow-md)`, the float-surface tier the popup family
  shares) instead of a hand-rolled drop-shadow. The Toast kind's type
  layer is renamed to match its shape: the call options interface
  becomes `ToastOptions` (previously `ToastCallOptions` — note the
  public `ToastOptions` name previously aliased `MessageOptions`, the
  update patch shape, and that alias is dropped; patches stay typed
  as `MessageOptions`) and the method namespace interface becomes
  `ToastActions` (previously `ToastNamespace`); the kind module
  `toast/api.ts` is now `toast/factory.ts`. Pre-release breaks only,
  the imperative `Toast` namespace value is unchanged.
- **Notify kind renames + structure** — the Notify kind follows the
  same conventions: the call options interface becomes `NotifyOptions`
  (previously `NotifyCallOptions`), the method namespace interface
  becomes `NotifyActions` (previously `NotifyNamespace`), and the
  kind module `notify/api.ts` is now `notify/factory.ts` with the
  standard `constants/defaults.ts` + `types/api.ts` + `types/index.ts`
  folders. Pre-release renames.
- **naming that says the shape** — the message kinds' discriminator
  registered at the store is `type: MessageType` (`toast` | `notify`,
  previously `face: MessageFace`); the old `type` option (the semantic
  mode info/success/warning/error) is now `mode: MessageMode`
  (previously `MessageTone`) — so the imperative payloads move their
  tone field too (`NotifyPayload.type` → `mode`, an internal
  `MessageEntry` carries `type` + `mode`). The shared item wrapper is
  `MessageBox` (previously `MessageItemShell`), and cdk/message is
  organized into the repo's standard folders — `types/`, `stores/`,
  `constants/` — with `box.tsx` for the box. Pre-release renames.

Story, docs pages, the wiki component map and the ROADMAP M4 paragraph
updated in lockstep.
