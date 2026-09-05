import { describe, expect, it } from 'vitest';
import { WikiSource } from '../src/doctrine.js';

// The doctrine tests run against the real @colox/wiki package content
// (symlinked into this workspace), so they fail when shipped content breaks.
const source = WikiSource.fromPackage();

describe('WikiSource against the real @colox/wiki package', () => {
  it('discovers the doctrine as bundles with references', async () => {
    await expect(source.listSkills()).resolves.toEqual(['doctrine', 'stack', 'style']);
    await expect(source.listRules()).resolves.toEqual(['global', 'stack']);
    await expect(source.referencesOf('stack')).resolves.toEqual(['component', 'rules']);
  });

  it('reads skill bodies and their references', async () => {
    const skill = await source.readSkill('stack');
    expect(skill?.body).toContain('# Composing layouts with Stack');
    expect(skill?.file).toBe('skills/stack/SKILL.md');

    const rules = await source.readReference('stack', 'rules');
    expect(rules?.body).toContain('[condition]');
    expect(rules?.file).toBe('skills/stack/references/rules.md');

    const component = await source.readReference('stack', 'component');
    expect(component?.body).toContain('Flexbox layout primitive');
  });

  it('serves rules via the global alias and bundle names', async () => {
    const global = await source.readRule('global');
    expect(global?.body).toContain('style.css');
    expect(global?.name).toBe('doctrine');

    const stack = await source.readRule('stack');
    expect(stack?.body).toContain('Stack.Item grow');
  });

  it('serves the component map and component references', async () => {
    const overview = await source.readComponent('overview');
    expect(overview?.body).toContain('Grid');
    expect(overview?.file).toBe('components.md');

    const stack = await source.readComponent('stack');
    expect(stack?.body).toContain('# Stack');
  });

  it('rejects names that look like path traversal', async () => {
    await expect(source.readSkill('../stack')).resolves.toBeUndefined();
    await expect(source.readSkill('Stack')).resolves.toBeUndefined();
    await expect(source.readReference('stack', '../rules')).resolves.toBeUndefined();
    await expect(source.readComponent('stack/../etc')).resolves.toBeUndefined();
  });

  it('ranks doctrine hits for a composite query', async () => {
    const hits = await source.search('Stack.Item grow', { limit: 5 });
    expect(hits.length).toBeGreaterThanOrEqual(2);
    expect(hits.some((hit) => hit.kind === 'rule' && hit.name === 'stack')).toBe(true);
    expect(hits.some((hit) => hit.kind === 'skill' && hit.name === 'stack')).toBe(true);
    expect(hits[0].snippet.length).toBeGreaterThan(0);
  });

  it('returns no hits for gibberish', async () => {
    await expect(source.search('zzqxvwmnb', { limit: 3 })).resolves.toEqual([]);
  });
});
