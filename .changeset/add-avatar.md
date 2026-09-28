---
'@colox/react': minor
'@colox/wiki': minor
---

Add Avatar: the portrait primitive — a round footprint (circle by default,
`shape` also offers `rounded`/`square`) carrying one of three content forms
in priority order: `children` (the rich slot, always wins), `src` (the
picture avatar, falling back on failure), `name` (auto-derived initials —
CJK first character, Latin first letters). `size` takes the form-family
preset tiers (xs/sm/md/lg, same-name same-block as Button/Input) or any
theme size-token key; the text tier follows the footprint proportionally.
A picture avatar whose image fails to load fires `onError` once and falls
back to the `fallback` escape hatch, then to the `name` initials, then to
the `alt` initials — `fallback` is the image-failure escape hatch only, a
missing `src` never shows it; `alt` is required on the picture avatar
(missing warns), the derived text avatar is `role="img"` named by
`aria-label`, then the `name`, then the `alt`, and author-supplied
`children`/`fallback` nodes own their own naming. `variant`
(plain/subtle/solid/outline, default plain) sets the text-avatar surface
strength — plain is the quiet neutral muted surface (palette-independent),
subtle the palette tint fill, solid the full palette fill with inverse
text, outline a palette ring on a transparent fill; `palette` (the six
design-language families, default gray) colors the subtle/solid/outline
surfaces. The picture avatar ignores both axes — the image is the content.
The Avatar+Badge combo forms naturally when Badge lands.
