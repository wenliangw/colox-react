---
'@colox/react': minor
'@colox/wiki': minor
---

The edit-form data loop lands: `Form initialValues` seeds the form-owned
store (a form with no external store can now declare its initial values;
the prop is ignored when a `form` store is passed). `FormStore.setValues`
backfills a fetched record — it merges the given keys only, runs no
validation and stays off the report channel, so loading a record never
shocks the rules. `Form onValuesChange` fires for every user edit with
`{ name, value, values }` (post-change snapshot) — the echo of an
interaction, never of a load, so auto-save can watch it without saving
what it just fetched. Preview story, docs page and wiki module updated in
lockstep.