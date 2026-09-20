---
'@colox/react': minor
'@colox/wiki': minor
---

Add the `labelAlign` axis to `Form` / `Form.Field`: the start-placement
label column's text alignment. `'start'` leads (the default, unchanged),
`'end'` sails the label against the control, and `'justify'` spreads the
line across the fixed column width — the two-to-four character Chinese
label trick for a tidy form (`text-align-last` included, since a
single-line label is all "last line"). Logical words, declared on the
form and overridable per field; the top placement has no column, so it
ignores the axis. Preview story, docs page and wiki module updated in
lockstep.