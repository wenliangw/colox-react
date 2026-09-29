# 构建/门禁工作流：并行与管道

Colox monorepo 构建竞态的防护清单（Textarea 交付期的实测，三种表现各踩过一次）。

## prettier --check 的空转与假凭据

- **改这里**：从子包 workdir 用仓库根相对路径跑 `prettier --check packages/components/src/textarea`。
- **必须检查**：
  - [ ] 路径必须相对**当前 workdir**（子包目录里用 `src/textarea`，根目录里才用 `packages/components/src/textarea`）——路径不存在时 prettier **不打任何 error 到 stdout、照样打印 `All matched files use Prettier code style!`，然后退出 2**（stderr 才有 `No files matching the pattern`）。「All matched」+ 没看 stderr + exit 被 tail 吞 = 空转检查当成了真实凭据（本项目踩坑：7 个文件的格式问题被瞒了整段时间）。
  - [ ] 结论：prettier 检查**必须看 stderr + raw exit code**（`>/dev/null 2>&1` 后用 `echo $?` 或 `&&`），且路径提前 `test -d` 或直接用 workdir 内相对路径。
- **为什么**：`tail -1` 只看 stdout 只见「All matched」，空转看起来像通过。

## 应用级构建会再生成 @colox/theme 的 token 产物

- **改这里**：并行跑多个「会 rebuild @colox/react / theme」的任务（apps/docs 的 `pnpm build`、apps/preview 的 `pnpm build-storybook`），或与 packages/components 的测试/typecheck 并行。
- **必须检查**：
  - [ ] 两个应用的构建链都含 `pnpm --filter @colox/theme run build`（token 发射：clean-dist → 重写 `src/styles/tokens` + dist）——docs ∥ storybook 会互相踩 clean/write，其一必败（`ERR_PNPM_RECURSIVE_RUN_FIRST_FAIL`）。
  - [ ] 组件测试/typecheck 与任一应用构建并行时，会读到写一半的 token 产物：表现为 vitest 收集期文件失败（`Test Files N failed`、Tests 只跑一部分）、tsc 报 `Type '"4"' is not assignable to IconButtonSize`（sizeKeys 联合类型瞬间缺键）。
  - [ ] 结论：应用构建之间**严格串行**；组件测试/typecheck 不与应用构建并行。先失败不要先归因代码——等构建落地复跑一遍，复跑即绿 = 竞态实锤。
- **为什么**：本 session 三次触发：docs ∥ storybook（react 构建失败）、preview typecheck ∥ docs（`size="4"` 报错）、full gate ∥ docs（2 个测试文件收集失败）；复跑全部变绿。

## `cmd | tail` 的管道会让链式门禁失真

- **改这里**：用 `pnpm lint 2>&1 | tail -1 && pnpm typecheck 2>&1 | tail -1 && echo GREEN` 这种「管道吞 exit code」的链子判门禁。
- **必须检查**：
  - [ ] 管道的 exit code 来自最后一个命令（tail），不是被 filter 的那个——eslint 失败时 tail 仍 exit 0，「GREEN」照样打印。
  - [ ] 结论：门禁链要么 `set -o pipefail`，要么拆分判定（`pnpm typecheck && echo TYPECHECK-OK; pnpm exec eslint src/textarea && echo LINT-OK`），echo 紧跟在真实命令后。
- **为什么**：错误链里 eslint 若失败会被 tail 吞掉，`FULL-GATE-GREEN` 不可信。
- **2026 复发（表单载荷统一轮）**：`pnpm exec eslint packages/components/src apps/preview/src | tail -15 && echo "ESLINT exit=$?"` 再次把 3 个 `no-unused-vars` 报成 exit 0（`$?` 是 tail 的），直到 husky 预提交才红。**核对过的写法**：`set -o pipefail; pnpm exec eslint … ; echo "EXIT=$?"`——pipefail 让管道整体返回失败者的状态；或 echo 紧跟真实命令、不接管道。

## story/docs 构建不查类型，接线错误会漏（Badge 前科）

- **改这里**：交付「组件 + story/docs」后只跑 `build-storybook` / `docusaurus build` 当全部门禁。
- **必须检查**：
  - [ ] 两个应用构建都不跑 tsc（vite/esbuild 剥类型、docusaurus 不查 story 类型）——story 给组件传不存在的 prop（前科：`<Badge.Group size="sm">`，size 只在根/Dot/Count/Item 上）构建照样绿，类型错误漏整段时间。
  - [ ] 门禁清单里显式加 `apps/preview` 与 `apps/docs` 的 `tsc -p tsconfig.json --noEmit`（apps 有 tsconfig）；组件包 typecheck 管不到 story 的 prop 接线。
  - [ ] story 报「prop 不存在」先核对真实 API 面再决定修哪边：size 属 Item 不属 Group → 修 story 接线（把 size 移进各 `Badge.Item`），**不动组件契约**；确为组件面缺失才进组件。
- **为什么**：构建绿 ≠ 类型绿；story 接线错误会把「组件没这 prop」留到 CI/用户在 demo 里撞见才暴露。
