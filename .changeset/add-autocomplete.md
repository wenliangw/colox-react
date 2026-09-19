---
'@colox/react': minor
'@colox/wiki': minor
---

Add AutoComplete: the free-text combobox built as a compositional
shell that injects the combobox contract into a single host element —
the Input family keeps every static prop (`size`/`invalid`/
`clearable`/…), AutoComplete owns the value and the mechanism. The
tree is semantic: `<AutoComplete.Target>` holds the exactly-one
component-typed host (receiving `value`/`onChange`/`aria-*` via
cloneElement, everything else stays the author's), `<AutoComplete.
Suggestions>` is the member region, and `<AutoComplete.Option>` is
the family option leaf (`value` + `text`, optional `disabled` and
rich children). The value is plain text, so every edit is a legal
commit and the suggestions are a convenience, never a constraint:
focus/click opens the full list, typing filters case-insensitively
over the text and the value (zero matches close, `filterOption`
overrides), and Escape/blur/pick close. The popup is a portal listbox
on the new `cdk/combobox` kernel (compiled record + default matcher,
shared with Select's search body) riding the existing cdk floating
keyboard: the ARIA 1.2 editable-combobox model keeps focus in the
host, arrows walk rows via `aria-activedescendant` (disabled skipped,
Home/End jump, Enter picks, Space types through). Every commit fires
the uniform `{ event, value }` payload — the family-wide event shape
this round installs — and picks additionally fire
`{ event, value, option }` on `onSelect`. The panel matches the host
width and its rows stay at the fixed md tier with no persistent
selection state: the fill is the selection. Per-subpath entry
`@colox/react/autocomplete`, preview stories, a docs page and the
wiki component map updated in lockstep.