# 测试书写类纠错清单

- **断言「某元素不出现」** → 禁止 `await waitFor(() => expect(screen.queryByXxx(...)).toBeNull())`：`waitFor` 在第一次同步检查成功时立即通过，而错误/元素常在微任务 + commit 后才落地——断言会抢在元素出现前「空跑通过」成 false negative。正确时序：先 `waitFor` 等待目标**出现**（`getBy*`/`findBy*`）确认真实状态，再断言其消失；或等待一个已知的触发事件后再查 `queryBy*` 为 null。
- 锚：Form deps 用例（form-rules.test.tsx「re-runs a field when one of its deps changes」）中「blur confirm 后无错误」的瞬间断言曾先于错误 commit 通过，而真实行为是 `两次输入不一致` 已出现——用例已修为「出现→消失→复现」完整时序，此锚为历史。**证明出现过，才能证明消失了。**
- 实测手段：怀疑断言竞态时，临时在规则内 `console.log` 参数值 + `queryAllByRole` 计数探针（跑完即删）——不要在拿不准断言对象时反复猜实现。
