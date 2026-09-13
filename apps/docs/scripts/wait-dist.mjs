// Docs dev startup gate: docusaurus's webpack resolves @colox/react
// through the exports field into packages/components/dist. The
// concurrently-launched react build:watch performs its own full
// initial build right after the pre-build, and (without this gate)
// webpack can resolve the package in the middle of that rebuild —
// "Package path . is exported ... but no valid target file was found".
// This script holds docusaurus back until the key dist targets exist
// AND their stat snapshots stop moving (a rebuild leaves mtimes
// bumping until it finishes), then exits and lets docusaurus start.
import { statSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const root = new URL('../../../', import.meta.url); // apps/docs/scripts -> repo root
const targets = [
  new URL('packages/components/dist/es/index.js', root),
  new URL('packages/components/dist/cjs/index.cjs', root),
  new URL('packages/components/dist/style.css', root),
];

const stablePolls = 4; // ~800ms of no stat movement
const pollEveryMs = 200;
const timeoutMs = 90_000;

const snap = (url) => {
  try {
    const stat = statSync(url);
    return { exists: true, size: stat.size, mtimeMs: stat.mtimeMs };
  } catch {
    return { exists: false, size: -1, mtimeMs: -1 };
  }
};

const keyOf = (snapshots) => JSON.stringify(snapshots);

const started = Date.now();

for (;;) {
  const snapshots = targets.map(snap);
  if (snapshots.every((entry) => entry.exists)) {
    let stable = true;
    for (let round = 0; round < stablePolls && stable; round += 1) {
      await sleep(pollEveryMs);
      const next = targets.map(snap);
      if (keyOf(next) !== keyOf(snapshots)) {
        stable = false;
      }
    }
    if (stable) {
      console.log('[wait-dist] dist targets stable, releasing docusaurus');
      process.exit(0);
    }
  } else if (Date.now() - started > timeoutMs) {
    console.error(
      '[wait-dist] timed out waiting for:',
      snapshots.map((s) => s.exists),
    );
    process.exit(1);
  } else {
    await sleep(pollEveryMs);
  }
}
