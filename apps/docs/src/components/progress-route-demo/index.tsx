import { useEffect, useState } from 'react';
import { Button, Progress, Stack, useProgressStrategy } from '@colox/react';

/**
 * The route-progress demo: the top-of-page loading bar wired end to
 * end. Mounting "enters the route" — the strategy starts its
 * fast-then-slow growth toward 99% and parks; a simulated load commit
 * fires `done()` 4s later, jumping the bar to 100. The replay button
 * re-runs the transition (`reset` + `start` in the same tick).
 */
export default function ProgressRouteDemo() {
  const { value, start, done, reset } = useProgressStrategy();
  const [run, setRun] = useState(0);

  useEffect(() => {
    reset();
    start();
    const commitTimer = setTimeout(done, 4000);
    return () => clearTimeout(commitTimer);
  }, [run, reset, start, done]);

  return (
    <Stack direction="column" gap="3" align="stretch">
      <Progress.Linear value={value} />
      <Stack direction="row" gap="2">
        <Button size="sm" variant="outline" onClick={() => setRun((n) => n + 1)}>
          Replay
        </Button>
      </Stack>
      <p>
        挂载即「进入路由」：进度条由快到慢自动爬到 99% 停驻，模拟加载完成时
        <code>done()</code> 提交到 100%。
      </p>
    </Stack>
  );
}
