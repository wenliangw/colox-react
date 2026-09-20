---
'@colox/react': minor
'@colox/wiki': minor
---

A field can override the form's validation policy: `Form.Field validateOn`
takes the same words as the form (`'submit' | 'blur' | 'change'` or a mix)
and replaces the form-wide policy for this field alone — the classic login
mix of the name checked on blur and the password on every change. `deps`
re-validation stays independent of any policy, as before. Preview story,
docs page and wiki module updated in lockstep.