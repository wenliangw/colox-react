import { readFile, readdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import type { Dirent } from 'node:fs';

export type DoctrineKind = 'skill' | 'rule' | 'component' | 'reference';

/** Kebab-case bundle/reference/branch names: no slashes, no traversal. */
const NAME_PATTERN = /^[a-z][a-z0-9-]*$/;

const SKILLS_DIR = 'skills';
const SKILL_FILE = 'SKILL.md';
const REFERENCES_DIR = 'references';
const OVERVIEW_FILE = 'components.md';

const RULES_REFERENCE = 'rules';
const COMPONENT_REFERENCE = 'component';

/** Rule names are readable topic names; storage always speaks bundle names. */
const RULE_BUNDLES: Record<string, string> = { global: 'doctrine' };

/**
 * One doctrine document: a skill body, one of its reference files, or the
 * root component overview. Rules and component references found as
 * references/rules.md and references/component.md in a bundle surface as
 * first-class kinds; other reference files stay generic references.
 */
export interface DoctrineDocument {
  kind: DoctrineKind;
  /** Bundle name the document belongs to; 'global' for the doctrine rules; 'overview' for the component map. */
  name: string;
  /** Reference file stem, present on reference-origin documents (incl. rules/component). */
  reference?: string;
  /** Path relative to the wiki package root (display only). */
  file: string;
  absPath: string;
  body: string;
}

export interface SearchHit {
  kind: DoctrineKind;
  name: string;
  reference?: string;
  file: string;
  snippet: string;
  score: number;
}

export interface SearchOptions {
  /** Max hits, clamped to 1-10. Defaults to 5. */
  limit?: number;
}

/** Display name of a rule document: the doctrine bundle reads as 'global'. */
export function ruleName(bundle: string): string {
  return bundle === 'doctrine' ? 'global' : bundle;
}

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
 * Local Markdown source of the Colox doctrine: one bundle per topic under
 * skills/, each carrying SKILL.md plus on-demand references/. Reads the
 * installed @colox/wiki package (symlinked into the workspace during
 * development), so the dependency version IS the doctrine version.
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

  /** Every doctrine document: the overview, skill bodies, their references. */
  async documents(): Promise<DoctrineDocument[]> {
    const result: DoctrineDocument[] = [];
    const overviewBody = await readMarkdown(path.join(this.root, OVERVIEW_FILE));
    if (overviewBody !== undefined) {
      result.push({
        kind: 'component',
        name: 'overview',
        file: OVERVIEW_FILE,
        absPath: path.join(this.root, OVERVIEW_FILE),
        body: overviewBody,
      });
    }
    const skillsRoot = path.join(this.root, SKILLS_DIR);
    for (const bundle of await listDirs(skillsRoot)) {
      if (!NAME_PATTERN.test(bundle.name)) {
        continue;
      }
      const bundleDir = path.join(skillsRoot, bundle.name);
      const skillBody = await readMarkdown(path.join(bundleDir, SKILL_FILE));
      if (skillBody !== undefined) {
        result.push({
          kind: 'skill',
          name: bundle.name,
          file: `${SKILLS_DIR}/${bundle.name}/${SKILL_FILE}`,
          absPath: path.join(bundleDir, SKILL_FILE),
          body: skillBody,
        });
      }
      const refsDir = path.join(bundleDir, REFERENCES_DIR);
      for (const ref of await listMarkdownFiles(refsDir)) {
        const reference = ref.name.replace(/\.md$/, '');
        if (!NAME_PATTERN.test(reference)) {
          continue;
        }
        const body = await readMarkdown(path.join(refsDir, ref.name));
        if (body === undefined) {
          continue;
        }
        result.push({
          kind:
            reference === RULES_REFERENCE
              ? 'rule'
              : reference === COMPONENT_REFERENCE
                ? 'component'
                : 'reference',
          name: bundle.name,
          reference,
          file: `${SKILLS_DIR}/${bundle.name}/${REFERENCES_DIR}/${ref.name}`,
          absPath: path.join(refsDir, ref.name),
          body,
        });
      }
    }
    return result;
  }

  async listSkills(): Promise<string[]> {
    const docs = await this.documents();
    return docs
      .filter((doc) => doc.kind === 'skill')
      .map((doc) => doc.name)
      .sort();
  }

  async referencesOf(bundle: string): Promise<string[]> {
    const docs = await this.documents();
    return docs
      .filter((doc) => doc.reference !== undefined && doc.name === bundle)
      .map((doc) => doc.reference as string)
      .sort();
  }

  async readSkill(name: string): Promise<DoctrineDocument | undefined> {
    if (!NAME_PATTERN.test(name)) {
      return undefined;
    }
    const docs = await this.documents();
    return docs.find((doc) => doc.kind === 'skill' && doc.name === name);
  }

  async readReference(name: string, reference: string): Promise<DoctrineDocument | undefined> {
    if (!NAME_PATTERN.test(name) || !NAME_PATTERN.test(reference)) {
      return undefined;
    }
    const docs = await this.documents();
    return docs.find((doc) => doc.reference === reference && doc.name === name);
  }

  async listRules(): Promise<string[]> {
    const docs = await this.documents();
    return docs
      .filter((doc) => doc.kind === 'rule')
      .map((doc) => ruleName(doc.name))
      .sort();
  }

  async readRule(name: string): Promise<DoctrineDocument | undefined> {
    if (!NAME_PATTERN.test(name)) {
      return undefined;
    }
    const bundle = RULE_BUNDLES[name] ?? name;
    const docs = await this.documents();
    return docs.find((doc) => doc.kind === 'rule' && doc.name === bundle);
  }

  async readComponent(name: string): Promise<DoctrineDocument | undefined> {
    if (!NAME_PATTERN.test(name)) {
      return undefined;
    }
    const docs = await this.documents();
    return docs.find((doc) => doc.kind === 'component' && doc.name === name);
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
    const docs = await this.documents();
    const hits: SearchHit[] = [];
    for (const doc of docs) {
      const name = doc.name.toLowerCase();
      const title = firstHeading(doc.body).toLowerCase();
      const body = doc.body.toLowerCase();
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
          kind: doc.kind,
          name: doc.name,
          reference: doc.reference,
          file: doc.file,
          snippet: buildSnippet(doc.body, terms),
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
