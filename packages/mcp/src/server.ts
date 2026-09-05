import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { WikiSource, DoctrineEntry, SearchHit } from './doctrine.js';

export interface ServerMeta {
  name: string;
  version: string;
}

function renderEntry(entry: DoctrineEntry): string {
  return `${entry.file}\n\n${entry.body}`;
}

function renderHits(hits: SearchHit[], query: string): string {
  if (hits.length === 0) {
    return `No doctrine matches "${query}". Refine the keywords or list a kind with get_rule / get_skill / get_component without a name argument.`;
  }
  return hits
    .map(
      (hit, index) =>
        `## ${index + 1}. ${hit.kind} "${hit.name}" (score ${hit.score})\n${hit.snippet}\n\nRead it: get_${hit.kind} with name "${hit.name}"`,
    )
    .join('\n\n');
}

function renderList(kind: string, names: string[]): string {
  return names.length === 0
    ? `No ${kind}s are shipped yet.`
    : `Shipped ${kind}s:\n${names.map((name) => `- ${name}`).join('\n')}`;
}

/**
 * The Colox doctrine server: four deterministic tools over the local
 * @colox/wiki Markdown source. No network, no mutable state — the wiki
 * dependency version IS the knowledge version.
 */
export function buildServer(source: WikiSource, meta: ServerMeta): McpServer {
  const server = new McpServer({ name: meta.name, version: meta.version });

  server.registerTool(
    'search_doctrine',
    {
      title: 'Search the Colox usage doctrine',
      description:
        'Full-text search across the Colox usage doctrine (rules, skills, component reference). ' +
        'Call this BEFORE writing any @colox/react code: Colox has blessed usage patterns that ' +
        'differ from generic React conventions (e.g. Stack.Item instead of bare divs), and code ' +
        'that works may still violate them. Open the top hits from the result.',
      inputSchema: {
        query: z.string().min(1).describe('Keywords, e.g. "responsive gap" or "Stack.Item"'),
        limit: z.number().int().min(1).max(10).optional().describe('Max hits (default 5)'),
      },
    },
    async ({ query, limit }) => {
      const hits = await source.search(query, { limit });
      return {
        content: [{ type: 'text' as const, text: renderHits(hits, query) }],
      };
    },
  );

  server.registerTool(
    'get_rule',
    {
      title: 'Read usage rules',
      description:
        'Read the conditional usage rules for a topic ("stack", "global"). Rules are the ' +
        'authoritative must/avoid list in [condition] → action + why form. Without a name, lists ' +
        'the shipped rules. Call before coding against a component.',
      inputSchema: {
        name: z.string().optional().describe('Rule name, e.g. "stack". Omit to list.'),
      },
    },
    async ({ name }) => {
      if (name === undefined) {
        const entries = await source.entries();
        return {
          content: [
            {
              type: 'text' as const,
              text: renderList(
                'rule',
                entries.filter((entry) => entry.kind === 'rule').map((entry) => entry.name),
              ),
            },
          ],
        };
      }
      const entry = await source.read('rule', name);
      return {
        content: [
          {
            type: 'text' as const,
            text: entry ? renderEntry(entry) : `No rule named "${name}".`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'get_skill',
    {
      title: 'Read a composition recipe',
      description:
        'Read the procedural composition recipe for a task ("stack" covers rows, columns, ' +
        'toolbars, spacers, responsive gaps). Skills show the canonical form end to end. ' +
        'Without a name, lists the shipped skills.',
      inputSchema: {
        name: z.string().optional().describe('Skill name, e.g. "stack". Omit to list.'),
      },
    },
    async ({ name }) => {
      if (name === undefined) {
        const entries = await source.entries();
        return {
          content: [
            {
              type: 'text' as const,
              text: renderList(
                'skill',
                entries.filter((entry) => entry.kind === 'skill').map((entry) => entry.name),
              ),
            },
          ],
        };
      }
      const entry = await source.read('skill', name);
      return {
        content: [
          {
            type: 'text' as const,
            text: entry ? renderEntry(entry) : `No skill named "${name}".`,
          },
        ],
      };
    },
  );

  server.registerTool(
    'get_component',
    {
      title: 'Read a component reference',
      description:
        'Read the reference for a component ("stack"): full API, defaults, DOM classes and the ' +
        'mechanism behind it. Use after the rules/skill to confirm prop names. Without a name, ' +
        'lists the shipped components.',
      inputSchema: {
        name: z.string().optional().describe('Component name, e.g. "stack". Omit to list.'),
      },
    },
    async ({ name }) => {
      if (name === undefined) {
        const entries = await source.entries();
        return {
          content: [
            {
              type: 'text' as const,
              text: renderList(
                'component',
                entries.filter((entry) => entry.kind === 'component').map((entry) => entry.name),
              ),
            },
          ],
        };
      }
      const entry = await source.read('component', name);
      return {
        content: [
          {
            type: 'text' as const,
            text: entry ? renderEntry(entry) : `No component named "${name}".`,
          },
        ],
      };
    },
  );

  return server;
}
