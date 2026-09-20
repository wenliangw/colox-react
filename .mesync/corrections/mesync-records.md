# mesync 落盘纪律（防漏清单）

条目主干 = 「改这里 → 必须检查哪里」。错误经历不记录，只记防漏动作。

## remember 落盘前

- **remember 落盘前逐句校对 decision/rationale 全文 → 乱码、错词、残留片段（如从剪贴板/摘要混入的文本）发现即删改；已经落盘的脏节点立刻补一条修正节点并 `supersedes` 旧节点，wiki 里的节点引用同步改指向修正节点。**
  为什么：决策节点是 recall 面的历史文本，脏片段会污染未来检索与延续决策链的锚定（本次批 B 节点首版混入「reject 级」「story(value=…)」乱码，已用 9f39c5ea 修正并 supersedes）。

## wiki 引用决策节点

- **wiki/overview 引用决策节点时 → 先取得 remember 返回的真实 id 再写入；永远不用「见决策库」占位。**
  为什么：占位断掉 wiki↔决策链的指针，查者无法验证来源。
