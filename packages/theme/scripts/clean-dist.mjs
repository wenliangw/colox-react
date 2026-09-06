// Vite lib mode runs with emptyOutDir: false so the CSS artifacts that
// build:css placed into dist survive the JS build. As a trade-off the
// vite-owned outputs would accumulate stale files across structural
// refactors, so they are removed here before every build; the CSS
// artifacts are kept.
import { rmSync } from 'node:fs';

for (const dir of ['dist/es', 'dist/cjs', 'dist/types']) {
  rmSync(new URL(`../${dir}/`, import.meta.url), { recursive: true, force: true });
}
// cli-data.json is a @colox/theme-builder compile digest; it used to be
// emitted here before the split and would otherwise ship forever as a
// stale artifact (files: ["dist"]).
rmSync(new URL('../dist/cli-data.json', import.meta.url), { force: true });
