---
'@colox/react': minor
'@colox/wiki': minor
---

Add the required mark to `Form`: a field shows the red `*` on its
label while some `Form.Validate required` leaf declares it required —
derived from the rules, never declared twice. The mark's position is
`requiredMarkPosition` (`'start'` leads the text, the `*姓名` pattern;
`'end'` trails it like antd), declared on the form and overridable per
field, and a label hides its own with `showRequiredMark={false}`.

The star is visual decoration rendered through CSS content — the
label's text remains what the author wrote — and rides outside the
text slot so it travels with the text under every `labelAlign` word
(`justify` spreads the text alone while the mark hugs the line's
edge). Its programmatic twin is the `aria-required` the field injects
into required controls. Preview story, docs page and wiki module
updated in lockstep.