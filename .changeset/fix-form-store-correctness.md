---
'@colox/react': patch
'@colox/wiki': patch
---

Fix the Form store's correctness corners. Async validation is now race-safe:
every rule run takes a per-field sequence number and only the latest run may
publish, so an older async verdict settling after a newer one can no longer
roll the error back to stale truth (fast typing with `validateOn="change"`,
overlapping dependency runs). `reset()` restores the first frame again —
fields neither the `useForm` initial values nor the explicit argument cover
return to the control's uncontrolled `defaultValue`/`defaultChecked` seed, so
the store and the controls show the same values instead of the store silently
dropping the seeds. Several `Form.Hint` lines now carry one unique id each
(before, they shared one) and the control's `aria-describedby` names them all.
The internal docs are brought in line with the implementation: the rule
execution order, the `setError` error-line note and the fragment wording in
the walker.