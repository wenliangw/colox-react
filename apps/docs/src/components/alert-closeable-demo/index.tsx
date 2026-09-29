import { useState } from 'react';
import { Alert } from '@colox/react';

/**
 * The Alert closeable demo — the controlled close + exit fade wired end
 * to end: clicking the ✕ stages the fade-out, `onClose` fires when the
 * fade ends, and the parent unmounts the alert there.
 */
export default function AlertCloseableDemo() {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <Alert
      type="warning"
      message="可关闭的提示"
      description="点击 ✕ 先淡出，动画结束后 onClose 才触发，父级此刻卸载。"
      closeable
      onClose={() => setOpen(false)}
    />
  );
}
