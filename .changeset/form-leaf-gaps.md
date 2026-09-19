---
'@colox/react': minor
'@colox/wiki': minor
---

Close the form-integration gaps the Form audit surfaced. `Slider` gains
`invalid` (the red channel paints the untraveled fabric and the thumb
ring, while the traveled stripe keeps its palette — the same priority a
checked Switch applies), and `Checkbox.Group` / `Radio.Group` gain a
group-level `invalid` that every member inherits unless it sets its own
(the group root carries no `aria-invalid`: the ARIA group role does not
support it, so the members announce it themselves). The two inheritance
resolvers now state their split explicitly: `size` / `invalid` are
member-first state (`??`), `disabled` is sticky (`||` — a disabled group
cannot be opted out of).

`AutoComplete` forwards the control words a form layer injects — `id`,
`name`, `invalid`, `disabled`, `readOnly` and the `aria-describedby` /
`aria-labelledby` / `aria-required` channel — to the injected host input
via cloneElement (the root wins over the host's own flag), so label
association and description wiring reach the focusable control instead of
the anchor div; static words (`size` / `placeholder` / `clearable`) stay
the author's on the host element. `Select` does the same for its
`aria-describedby` / `aria-labelledby` / `aria-required` trio: they land
on the combobox control, not the shell. Docs pages, preview stories and
the wiki module notes updated in lockstep.
