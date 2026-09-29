---
'@colox/react': minor
'@colox/wiki': minor
---

Add `Progress.Linear`: the horizontal progress bar — a track fabric with a
filled bar grown to the committed percent (0–100), or, without a `value`, an
indeterminate sweeping block that signals in-flight work without a number.
`palette` (six design-language families, default primary) picks the bar
paint, `size` (sm/md/lg) the stripe thickness, `showInfo` (default on,
determinate only) shows the trailing `n%` label and `format` rewrites it.
The shape is a namespace family (`Progress.Linear`), so sibling shapes join
the same entry later. Pure display: no events, no form integration.
`role="progressbar"` with `aria-valuenow` riding the determinate state only.

Add `useProgressStrategy`: the route-progress strategy hook — the classic
top-of-page loading bar. `start()` grows the value fast-then-slow toward a
cap (default 99) and parks; `done()` commits to 100; `reset()` re-arms for
the next route. A custom `strategy` plan (ascending `[marker, durationMs]`
checkpoints, e.g. `[['20%', 200], ['60%', 800], ['99%', 1800]]`) replaces
the default curve — markers are percent strings on the cap's scale, each
segment paced evenly over its duration, the last marker the parking spot;
`cap` always stays the ceiling (a marker beyond it clamps to it while its
duration still applies). The clock lives in the hook, the bar stays pure.