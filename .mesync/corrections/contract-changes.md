# 公开契约变更（回调签名 / 事件载荷 / prop 词形）

改这里的：某个组件公开 prop 的契约——回调签名（`onChange` 载荷）、值词形、`Omit` 清单。改一处要顺着注入与文档链走完。

## 必须检查

- [ ] **`Omit` 清单同步**：自持 prop 必须先 `Omit` 掉原生同名，否则 TS 让原生类型静默接管（本轮 Checkbox/Radio/Switch 漏 `Omit<'onChange'>` 后，`onChange?.({...})` 报「Object literal may only specify known properties」，解构报 `Property 'onChange' does not exist`）。
- [ ] **宿主注入契约**：被别家 `cloneElement` 注入的组件（Input ← `AutoComplete.Target`）——注入方类型要跟着换（`TargetHandlers` / `AutoCompleteTargetRequiredProps` 的 `onChange` 签名），链式转发原样换（`host.onChange?.(payload)`）。
- [ ] **分清家族组件与私有裸控件**：跨组件 import 的调用点是「家族组件」（要换）还是「组件私有裸 `<input>`/`<textarea>`」（原生事件，不换）——Select search 的裸 control、DatePicker 的裸 input 属后者。
- [ ] **barrel 导出**：新载荷类型进组件 barrel（根 `src/index.ts` 走 `export *`，只需组件 barrel 一行）。
- [ ] **三处文档同步**：docs mdx 的 props 表 + 「accepts all native attributes」句（自持后该句必须显式排除该 prop）、preview stories 用法、wiki 模块文档。
- [ ] **测试断言换形**：断言载荷字段（`payload.value`）而非原生（`event.target.value`）；`vi.fn<T>()` 的泛型是「函数签名」不是「载荷类型」（`vi.fn<(p: XPayload) => void>()`）。
- [ ] **公开面换形态 = 旧形态的辅助符号同步清扫**：flat 函数面 → 值对象面（cdk/date）这类公开形态重设计后，为旧形态而生的导出与内部 helper 必须**删除到底**——不只是改 index/barrel：`addDaysIso`/`addMonthsIso`、`local.ts`、`time.ts` 这类「为旧公开面服务、新形态已取代」的符号/模块，grep 零消费者就要删除（含测试与 types.ts 里的配套类型）。检查法：对每个被替换的旧符号 grep 消费侧，全零即删；旧的 Iso 后缀名要留在「组件引擎」里必须先证明该引擎真在吃它（`today` 仍被 date-picker 吃；`parseGranularIso` 已并入 `dateParts(source, null)` 兜底参数、`granularIsoOf` 已并入 `format(值, 档位pattern)`、`partsToGranularIso` 已并入 `iso(pattern)`、`formatIso` 已并入 `format`——配套私有符号 `parseValueWord`/`renderToken`/WEEKDAY 词表/`DateFormatToken` 类型随公开名的死亡一并验证零消费者后删除）。
- **为什么**：本轮表单叶子载荷统一（`{ event, value }` 全家族）一次触及 5 个叶子 + 1 个注入方 + 5 个 barrel + 3 处文档；漏一处 tsc 或测试就红，而其中的注入链（AutoComplete←Input）在测试里才现形。
- **为什么**：本轮公开面改值对象后，先只改了 barrel 别名，内部十函数原样留存；被用户指出「addDaysIso 等方法没有清理」——公开面换词形时，旧词形的中间态全部成了死代码，必须一并清除（含测试计数、wiki 模块文件清单随之更新）。
