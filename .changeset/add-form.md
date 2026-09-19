---
'@colox/react': minor
'@colox/wiki': minor
---

Add the Form layer: `Form` + `Form.Field` / `Form.Label` / `Form.Hint` /
`Form.Validate` + `useForm` / `useFormContext`. A native `<form>`
(native validation off) owns the values, the validation policy and the
submit lifecycle; its fields lay out as a column through `Stack` with a
token-keyed `gap`, so there is no second layout system — sections and
side-by-side rows compose with `Container`/`Grid` around the fields.

`Form.Field` renders the field container, wires the label to its
control (`htmlFor` for labelable controls, `aria-labelledby` for the
group-shaped ones), injects the controlled value plus the family
`{ event, value }` change channel into its single control child, and
registers the rules its `Form.Validate` leaves declare. The injected
word switches by domain — `checked` for the boolean leaves (Checkbox /
Switch / standalone Radio, whose `value` is a string form token),
`value` for every other leaf — judged by component identity, and the
field seeds the family's empty word per domain so a control is
controlled from its first render.

Rules are declared per leaf (required / pattern / min / max / minLength /
maxLength / custom sync-or-async `validate`, with `message` and `deps`)
and run on the form-wide `validateOn` policy; only the first failure
shows, on the leaf that owns it. The store exposes
`getValues`/`getErrors`/`isValid`/`setValue`/`setError`/`validate`/
`reset`/`subscribe`. Docs page, preview stories, the wiki doctrine digest
and the component map updated in lockstep.
