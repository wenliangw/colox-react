import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { describe, expect, it } from 'vitest';
import { WikiSource } from '../src/doctrine.js';
import { buildServer } from '../src/server.js';

function textOf(result: { content: Array<{ type: string; text?: string }> }): string {
  return result.content.map((part) => part.text ?? '').join('\n');
}

describe('colox MCP server over an in-memory transport', () => {
  it('serves the four doctrine tools end to end', async () => {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = buildServer(WikiSource.fromPackage(), { name: 'colox', version: 'test' });
    await server.connect(serverTransport);
    const client = new Client({ name: 'test-client', version: '1.0.0' });
    await client.connect(clientTransport);

    const tools = await client.listTools();
    expect(tools.tools.map((tool) => tool.name).sort()).toEqual([
      'get_component',
      'get_rule',
      'get_skill',
      'search_doctrine',
    ]);

    const map = await client.callTool({ name: 'get_component', arguments: {} });
    expect(textOf(map)).toContain('Grid');

    const component = await client.callTool({
      name: 'get_component',
      arguments: { name: 'stack' },
    });
    expect(textOf(component)).toContain('Flexbox layout primitive');

    const missingComponent = await client.callTool({
      name: 'get_component',
      arguments: { name: 'nope' },
    });
    expect(textOf(missingComponent)).toContain('No component named');

    const ruleList = await client.callTool({ name: 'get_rule', arguments: {} });
    const ruleListText = textOf(ruleList);
    expect(ruleListText).toContain('global');
    expect(ruleListText).toContain('stack');

    const globalRule = await client.callTool({ name: 'get_rule', arguments: { name: 'global' } });
    expect(textOf(globalRule)).toContain('style.css');

    const stackRule = await client.callTool({ name: 'get_rule', arguments: { name: 'stack' } });
    expect(textOf(stackRule)).toContain('Stack.Item grow');

    const skill = await client.callTool({ name: 'get_skill', arguments: { name: 'stack' } });
    expect(textOf(skill)).toContain('## Reference files');

    const skillRules = await client.callTool({
      name: 'get_skill',
      arguments: { name: 'stack', reference: 'rules' },
    });
    expect(textOf(skillRules)).toContain('[condition]');

    const skillMissingRef = await client.callTool({
      name: 'get_skill',
      arguments: { name: 'stack', reference: 'nope' },
    });
    expect(textOf(skillMissingRef)).toContain('No reference "nope"');

    const skillList = await client.callTool({ name: 'get_skill', arguments: {} });
    expect(textOf(skillList)).toContain('(references:');

    const search = await client.callTool({
      name: 'search_doctrine',
      arguments: { query: 'responsive gap', limit: 3 },
    });
    expect(textOf(search)).toContain('stack');

    await client.close();
    await server.close();
  });
});
