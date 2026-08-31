import { readFileSync } from 'node:fs';

// Open-source rule: commit messages must be written in English.
// Reject CJK characters so the git history stays readable for everyone.
const [file] = process.argv.slice(2);
const message = readFileSync(file, 'utf8');

if (/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/.test(message)) {
  console.error('[commit-msg] CJK characters detected — commit messages must be in English.');
  process.exit(1);
}
