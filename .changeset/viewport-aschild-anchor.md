---
'@colox/react': minor
'@colox/wiki': minor
---

`MessageViewport` replaces `positioning` with `asChild`: the scoped
container no longer renders its own absolutely-positioned box — which
depended on a `position: relative` parent that could be forgotten,
leaking the message layer to the page. `<MessageViewport scope="…"
asChild>` now merges the anchor onto the single element child (the
child becomes the positioning context, the slots render inside it as
absolute siblings) — no wrapper div, no contract on any ancestor.
Without `asChild` the viewport still renders the screen-wide fixed
layer. Anything but one element child is a hard error.