---
'@colox/react': minor
'@colox/wiki': minor
---

Export the read-only subscriptions behind dependent fields, live summaries
and auto-save: `useFormWatch(store, name?)` re-renders along one field's
value (or the whole values map without a name) and
`useFormWatchError(store, name)` along one field's error — one line where
consumers used to hand-roll `subscribe` boilerplate. No new mechanism: they
are the store's subscription surface packaged as hooks. Preview story, docs
page and wiki module updated in lockstep.