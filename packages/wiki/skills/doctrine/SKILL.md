---
name: doctrine
description: Navigate the Colox AI doctrine — the blessed usage patterns behind every @colox/react component.
whenToUse: When starting with @colox/react, before choosing components, or when unsure which usage rules apply to a task.
---

# Colox doctrine

Colox ships usage doctrine, not just an API. This bundle is the doctrine's own
manual. Read order for a new task:

1. `references/rules.md` (this bundle) — the global rules: token-only styling,
   single style import, provider discipline, mechanism selection.
2. `components.md` at the package root — the component map with status.
3. The relevant topic bundle (`stack`, `style`, ...) — recipe first, then its
   `references/rules.md` for component-level musts.

Blessed over convenient: when the doctrine and generic React habits conflict,
the doctrine wins — all three layers exist because working code can still
violate the library's contract.
