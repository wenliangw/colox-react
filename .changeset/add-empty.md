---
'@colox/react': minor
'@colox/wiki': minor
---

Add the `Empty` component: the empty-state block — a centered figure, a
title and a description (plus an optional action) that tell the reader a
region has nothing to show and what to do about it. `type`
(`empty`/`search`/`error`, `empty` by default) picks the built-in scene
figure — a rich, multi-color atmospheric illustration (a folder with
floating data pages, a magnifier over floating documents, a ringed
planet with its moon under a starfield) with its own ambient hue
palette per scene,
riding only theme tokens so light and dark adapt for free; `figure`
overrides it with a custom illustration. Static display: no events, no
state, not closable.