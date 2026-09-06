---
'@colox/theme': minor
'@colox/theme-builder': minor
---

Split the theme package into a compile-time half and a runtime half
(user-approved design): the new `@colox/theme-builder` owns the Figma
token pipeline, the `colox` theme-compiler CLI, the JSON schema and the
default theme config; `@colox/theme` keeps the ColoxTheme runtime, the
`defaultBreakpoints` contract and the packaged stock theme CSS (its
build now compiles through the builder, which becomes a devDependency).
`colox theme build` is now driven by an optional `colox.theme.build.json`
contract (`meta`: full design-language compile from your own Figma
exports or `"stock"`; `theme`: custom config compile; required `outDir`),
with the legacy `-c colox.theme.json` behavior preserved when no
contract file exists. The split is output-neutral: the compiled css
suite and `cli-data.json` are byte-identical to the previous package.