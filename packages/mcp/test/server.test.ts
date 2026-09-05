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

    const component = await client.callTool({
      name: 'get_component',
      arguments: { name: 'stack' },
    });
    expect(textOf(component)).toContain('Flexbox layout primitive');

    const ruleList = await client.callTool({ name: 'get_rule', arguments: {} });
    const ruleListText = textOf(ruleList);
    expect(ruleListText).toContain('stack');
    expect(ruleListText).toContain('global');

    const rule = await client.callTool({ name: 'get_rule', arguments: { name: 'stack' } });
    expect(textOf(rule)).toContain('Stack.Item grow');

    const skill = await client.callTool({ name: 'get_skill', arguments: { name: 'stack' } });
    expect(textOf(skill)).toContain('## Recipes');

    const search = await client.callTool({
      name: 'search_doctrine',
      arguments: { query: 'responsive gap', limit: 3 },
    });
    expect(textOf(search)).toContain('stack');

    const missing = await client.callTool({ name: 'get_component', arguments: { name: 'nope' } });
    expect(textOf(missing)).toContain('No component named');

    await client.close();
    await server.close();
  });
});
