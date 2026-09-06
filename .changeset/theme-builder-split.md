---
'@colox/theme': minor
'@colox/theme-builder': minor
---

Split the theme package into a compile-time half and a runtime half
(user-approved design): the new `@colox/theme-builder` owns the Figma
token pipeline, the `colox` theme-compiler CLI, the JSON schema, the
default theme config and the runtime token emission; `@colox/theme`
keeps the ColoxTheme runtime, the `defaultBreakpoints` contract and the
packaged builtin theme CSS (its build now compiles through the builder,
which becomes a devDependency). `colox theme build` is driven by an
optional `colox.theme.build.json` contract (`tokens`: full
design-language compile from your token sources; `theme`: custom config
compile; required `outDir`; optional `runtime` block emitting runtime
token artifacts such as breakpoints), with the legacy
`-c colox.theme.json` behavior preserved when no contract file exists.
The split is output-neutral: the compiled css suite and `cli-data.json`
are byte-identical to the previous package.