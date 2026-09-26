# 滚轮圈循环 / 平滑滑行：加 scrollTop 写入前必查

- 原生滚动列上的**任何 scrollTop 写入**（圈重锚 / 滑行帧写 / 定位）→ 必须同任务同步 `setSlotIndex` 追窗（虚拟窗口），否则下一帧旧窗口画到新偏移——整列闪空（TimePicker 前科：静止期重锚只写 scrollTop 漏追窗）。**离散步进滑行不用 UA smooth**——飞行中任何写入都取消它、而跨缝 wrap 必须写（互斥）；用 **rAF 直写**（每帧 `wrap(top + travel·ease)`：wrap 折进写入、落点恒在带内），与滚轮同一条 scroll-handler 通道，滚轮输入随时取消滑行。chevron 步进入口套 **leading 节流 throttle**（`cdk/utils/throttle`，窗口 = GLIDE_MS = 滑行时长）——滑行结束前重复点击被吸收，**窗口内步进钮必须置灰**（`--locked` + aria-disabled）：吸收了就要看起来被吸收；motion 门控下免闸免灰。**命令门锁用节流（首击即发 + 窗口吸收），输入结算才用防抖（trailing 停稳补发）**——防抖会让离散步进滞后半拍、连点排队追尾（「滚轮没问题、箭头也应一样」的机制就是让箭头复用滚轮的通道）。
- 相对步进（chevron/keyboard ±n）的归位目标 → 取**三圈中离当前视位最近的同值座**（`canonical ± lap` 最近者），不要恒取中圈 canonical——后者在跨 23↔00 缝时从反方向回滚（向下按钮变向上滚），方向反转反直觉（TimePicker 用户报告前科）。点选可见格的同样处理顺带修掉同类问题。
- 给滚动容器/选项加 pointer-events 抑制 → 挂**选项格**不挂滚动容器（页面滚劫前科）；圈跳分支必须同帧同步虚拟窗口（快滚跨缝闪空前科）。
