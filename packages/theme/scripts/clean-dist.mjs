// Vite lib mode runs with emptyOutDir: false so the CSS artifacts that
// emit:themes placed into dist survive the JS build. As a trade-off the
// vite-owned outputs would accumulate stale files across structural
// refactors, so they are removed here before every build; the CSS
// artifacts are kept.
import { rmSync } from 'node:fs';

for (const dir of ['dist/es', 'dist/cjs', 'dist/types']) {
  rmSync(new URL(`../${dir}/`, import.meta.url), { recursive: true, force: true });
}
