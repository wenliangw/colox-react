# 结构类纠错清单

## cdk/date 分层契约

- 新增**公开能力词**（dateXxx / addXxx 等）→ 必须落 `src/cdk/date/index.ts` 薄层，功能本体进对应底层文件（calendar/parse/format），不在 index 里实现逻辑。
- 新增 `type` / `interface` → **必须**归 `src/cdk/date/types/<分域>.ts`（calendar 日历坐标·边界·测量 / format 词表·pattern / value 值词·坐标），桶 `types/index.ts` 统一出口；实现文件不顺手定义类型（私有的窄化别名也不行——归入 format.ts 同域成 `PatternTokenType` 由实现 import）。
- 教训锚：纯函数化首版把 `Granularity`/`DiffUnit`/`DiffResult` 定义在 calendar.ts、`ParseSource` 在 parse.ts，被用户点出「类型定义没有完全收敛到 types/ 下」；词的**语义同域**比实现就近更重要（types/ 是读者找词的第一站）。
- 同理警惕**同义双词**：`ParseSource` 与 `DateValue` 同构同义（string|Date|parts），一词一条规则——删别名、用共享词，不造第二个输入词。
- cdk 里任何 muck 型「实现刻的临时词」（如存量遗留的 `type TokenType` 幽灵别名）发现即清，不留给下一刀。
