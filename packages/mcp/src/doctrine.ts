import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { Dirent } from 'node:fs';

export const DOCTRINE_KINDS = ['skill', 'rule', 'component'] as const;
export type DoctrineKind = (typeof DOCTRINE_KINDS)[number];

/** Kebab-case + dots (rule files carry a `.rule` suffix): no slashes, no traversal. */
const NAME_PATTERN = /^[a-z][a-z0-9.-]*$/;

export interface DoctrineEntry {
  kind: DoctrineKind;
  /** Kebab-case entry name (skill folder name, file stem for rules/components). */
  name: string;
  /** Path relative to the wiki package root (display only). */
  file: string;
  /** Absolute path of the markdown file. */
  absPath: string;
  body: string;
}

export interface SearchHit {
  kind: DoctrineKind;
  name: string;
  file: string;
  snippet: string;
  score: number;
}

export interface SearchOptions {
  /** Max hits, clamped to 1-10. Defaults to 5. */
  limit?: number;
}

const KIND_DIRS: Record<DoctrineKind, string> = {
  skill: 'skills',
  rule: 'rules',
  component: 'components',
};

function firstHeading(body: string): string {
  const line = body.split('\n').find((candidate) => candidate.startsWith('# '));
  return line ? line.slice(2).trim() : '';
}

function countOccurrences(haystack: string, needle: string): number {
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count += 1;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}

function buildSnippet(body: string, terms: string[]): string {
  const matching = body
    .split('\n')
    .filter((line) => terms.some((term) => line.toLowerCase().includes(term)))
    .slice(0, 2)
    .map((line) => {
      const trimmed = line.trim();
      return trimmed.length > 140 ? `${trimmed.slice(0, 137)}...` : trimmed;
    });
  return matching.join('\n');
}

/**
 * Local Markdown source of the Colox doctrine. Reads the installed
 * @colox/wiki package (symlinked into the workspace during development),
 * so dependencies pin the doctrine version, not network calls.
 */
export class WikiSource {
  readonly root: string;

  constructor(root: string) {
    this.root = root;
  }

  /** Resolve the installed @colox/wiki package root. */
  static fromPackage(): WikiSource {
    const require = createRequire(import.meta.url);
    const packageJson = require.resolve('@colox/wiki/package.json');
    return new WikiSource(path.dirname(packageJson));
  }

  async entries(): Promise<DoctrineEntry[]> {
    const result: DoctrineEntry[] = [];
    for (const kind of DOCTRINE_KINDS) {
      const base = path.join(this.root, KIND_DIRS[kind]);
      if (kind === 'skill') {
        const bundles = await listDirs(base);
        for (const bundle of bundles) {
          if (!NAME_PATTERN.test(bundle.name)) {
            continue;
          }
          const skillPath = path.join(base, bundle.name, 'SKILL.md');
          const body = await readMarkdown(skillPath);
          if (body !== undefined) {
            result.push({
              kind,
              name: bundle.name,
              file: `${KIND_DIRS[kind]}/${bundle.name}/SKILL.md`,
              absPath: skillPath,
              body,
            });
          }
        }
      } else {
        const files = await listMarkdownFiles(base);
        for (const file of files) {
          const bare = file.name.replace(/\.md$/, '');
          const name = kind === 'rule' ? bare.replace(/\.rule$/, '') : bare;
          if (!NAME_PATTERN.test(name)) {
            continue;
          }
          const body = await readMarkdown(path.join(base, file.name));
          if (body !== undefined) {
            result.push({
              kind,
              name,
              file: `${KIND_DIRS[kind]}/${file.name}`,
              absPath: path.join(base, file.name),
              body,
            });
          }
        }
      }
    }
    return result;
  }

  async read(kind: DoctrineKind, name: string): Promise<DoctrineEntry | undefined> {
    if (!NAME_PATTERN.test(name)) {
      return undefined;
    }
    const entries = await this.entries();
    return entries.find((entry) => entry.kind === kind && entry.name === name);
  }

  async search(query: string, options: SearchOptions = {}): Promise<SearchHit[]> {
    const limit = Math.min(Math.max(options.limit ?? 5, 1), 10);
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .map((part) => part.replace(/[^\p{L}\p{N}.-]+/gu, ''))
      .filter((part) => part.length > 1);
    if (terms.length === 0) {
      return [];
    }
    const entries = await this.entries();
    const hits: SearchHit[] = [];
    for (const entry of entries) {
      const name = entry.name.toLowerCase();
      const title = firstHeading(entry.body).toLowerCase();
      const body = entry.body.toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (name.includes(term)) {
          score += 6;
        }
        if (title.includes(term)) {
          score += 4;
        }
        score += Math.min(countOccurrences(body, term), 10);
      }
      if (score > 0) {
        hits.push({
          kind: entry.kind,
          name: entry.name,
          file: entry.file,
          snippet: buildSnippet(entry.body, terms),
          score,
        });
      }
    }
    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, limit);
  }
}

async function listDirs(dir: string): Promise<Dirent[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory());
  } catch {
    return [];
  }
}

async function listMarkdownFiles(dir: string): Promise<Dirent[]> {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries.filter((entry) => entry.isFile() && entry.name.endsWith('.md'));
  } catch {
    return [];
  }
}

async function readMarkdown(file: string): Promise<string | undefined> {
  try {
    return await readFile(file, 'utf8');
  } catch {
    return undefined;
  }
}
