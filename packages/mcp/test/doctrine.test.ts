import { describe, expect, it } from 'vitest';
import { WikiSource } from '../src/doctrine.js';

// The doctrine tests run against the real @colox/wiki package content
// (symlinked into this workspace), so they fail when shipped content breaks.
const source = WikiSource.fromPackage();

describe('WikiSource against the real @colox/wiki package', () => {
  it('discovers the stack doctrine across all three layers', async () => {
    const entries = await source.entries();
    const byKind = (kind: string) =>
      entries
        .filter((entry) => entry.kind === kind)
        .map((entry) => entry.name)
        .sort();
    expect(byKind('component')).toEqual(['stack']);
    expect(byKind('rule')).toEqual(['global', 'stack']);
    expect(byKind('skill')).toEqual(['stack']);
  });

  it('reads a component reference', async () => {
    const entry = await source.read('component', 'stack');
    expect(entry?.body).toContain('# Stack');
    expect(entry?.body).toContain('Stack.Item');
    expect(entry?.file).toBe('components/stack.md');
  });

  it('reads a skill bundle and a rule', async () => {
    const skill = await source.read('skill', 'stack');
    expect(skill?.body).toContain('## Recipes');
    const rule = await source.read('rule', 'global');
    expect(rule?.body).toContain('[condition]');
  });

  it('rejects names that look like path traversal', async () => {
    await expect(source.read('component', '../stack')).resolves.toBeUndefined();
    await expect(source.read('component', 'Stack')).resolves.toBeUndefined();
    await expect(source.read('component', 'stack/../etc')).resolves.toBeUndefined();
  });

  it('ranks doctrine hits for a composite query', async () => {
    const hits = await source.search('Stack.Item grow', { limit: 5 });
    expect(hits.length).toBeGreaterThanOrEqual(2);
    expect(hits[0].name).toBe('stack');
    expect(hits[0].snippet.length).toBeGreaterThan(0);
    expect(hits.some((hit) => hit.kind === 'rule')).toBe(true);
    expect(hits.some((hit) => hit.kind === 'skill')).toBe(true);
  });

  it('returns no hits for gibberish', async () => {
    await expect(source.search('zzqxvwmnb', { limit: 3 })).resolves.toEqual([]);
  });
});
