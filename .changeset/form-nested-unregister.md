---
'@colox/react': minor
'@colox/wiki': minor
---

Field names become dotted paths: `name="user.name"` reads and writes the
`user.name` leaf while the store stays flat inside — every mechanism
(epochs, deps, registration) works on flat names — and every shape it
hands back rebuilds the nested tree: `getValues`, `getErrors`, the rule
inputs and the submitted payload all carry `{ user: { name } }`.
`initialValues`, `setValues` and `reset` accept both spellings (an object
literal or the dotted key); object literals alone expand, arrays and other
values stay field values. Dynamic forms get `unregister(name)`: the field's
registration, value and error all drop, while plain unmounting keeps values
as before. Preview story, docs page and wiki module updated in lockstep.