import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { WikiSource, DoctrineDocument, SearchHit } from './doctrine.js';

export interface ServerMeta {
  name: string;
  version: string;
}

function renderDocument(doc: DoctrineDocument): string {
  return `${doc.file}\n\n${doc.body}`;
}

function renderHits(hits: SearchHit[], query: string): string {
  if (hits.length === 0) {
    return `No doctrine matches "${query}". Refine the keywords or list a kind with get_rule / get_skill / get_component without arguments.`;
  }
  return hits
    .map((hit, index) => {
      const label = hit.reference ? `"${hit.name}/${hit.reference}"` : `"${hit.name}"`;
      const howTo =
        hit.kind === 'skill'
          ? `get_skill with name "${hit.name}"`
          : hit.kind === 'rule'
            ? `get_rule with name "${hit.name === 'doctrine' ? 'global' : hit.name}"`
            : hit.kind === 'component'
              ? hit.name === 'overview'
                ? 'get_component without a name'
                : `get_component with name "${hit.name}"`
              : `get_skill with name "${hit.name}" and reference "${hit.reference}"`;
      return `## ${index + 1}. ${hit.kind} ${label} (score ${hit.score})\n${hit.snippet}\n\nRead it: ${howTo}`;
    })
    .join('\n\n');
}

function renderList(kind: string, names: string[]): string {
  return names.length === 0
    ? `No ${kind}s are shipped yet.`
    : `Shipped ${kind}s:\n${names.map((name) => `- ${name}`).join('\n')}`;
}

/**
 * The Colox doctrine server: four deterministic tools over the local
 * @colox/wiki Markdown bundles (SKILL.md bodies + on-demand references).
 * No network, no mutable state — the wiki dependency IS the knowledge version.
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
        'Read the conditional usage rules for a topic ("stack") or the global rules ("global"). ' +
        'Rules are the authoritative must/avoid list in [condition] → action + why form. ' +
        'Without a name, lists the shipped rule sets. Call before coding against a component.',
      inputSchema: {
        name: z
          .string()
          .optional()
          .describe('Rule set name, e.g. "stack" or "global". Omit to list.'),
      },
    },
    async ({ name }) => {
      if (name === undefined) {
        return {
          content: [
            { type: 'text' as const, text: renderList('rule set', await source.listRules()) },
          ],
        };
      }
      const doc = await source.readRule(name);
      return {
        content: [
          {
            type: 'text' as const,
            text: doc ? renderDocument(doc) : `No rule set named "${name}".`,
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
        'Read a skill bundle: its procedural recipe in SKILL.md, or with a reference argument ' +
        'one of its on-demand references ("rules" = the must/avoid list, "component" = the API ' +
        'reference). Without a name, lists the shipped skills and their references.',
      inputSchema: {
        name: z.string().optional().describe('Skill name, e.g. "stack". Omit to list.'),
        reference: z
          .string()
          .min(1)
          .optional()
          .describe('Reference file name, e.g. "rules" or "component". Requires a skill name.'),
      },
    },
    async ({ name, reference }) => {
      if (name === undefined) {
        if (reference !== undefined) {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'The reference argument requires a skill name: get_skill with name and reference together.',
              },
            ],
          };
        }
        const lines = [];
        for (const skill of await source.listSkills()) {
          const refs = await source.referencesOf(skill);
          lines.push(
            refs.length > 0 ? `- ${skill} (references: ${refs.join(', ')})` : `- ${skill}`,
          );
        }
        return {
          content: [
            {
              type: 'text' as const,
              text:
                `Shipped skills:\n${lines.join('\n')}\n\n` +
                'Read a skill body with get_skill; append a reference (e.g. reference: "rules") for its details.',
            },
          ],
        };
      }
      if (reference !== undefined) {
        const doc = await source.readReference(name, reference);
        return {
          content: [
            {
              type: 'text' as const,
              text: doc ? renderDocument(doc) : `No reference "${reference}" in skill "${name}".`,
            },
          ],
        };
      }
      const doc = await source.readSkill(name);
      return {
        content: [
          {
            type: 'text' as const,
            text: doc ? renderDocument(doc) : `No skill named "${name}".`,
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
        'returns the component map (responsibility + status of every primitive).',
      inputSchema: {
        name: z
          .string()
          .optional()
          .describe('Component name, e.g. "stack". Omit for the component map.'),
      },
    },
    async ({ name }) => {
      if (name === undefined) {
        const overview = await source.readComponent('overview');
        return {
          content: [
            {
              type: 'text' as const,
              text: overview ? renderDocument(overview) : 'No component map is shipped yet.',
            },
          ],
        };
      }
      const doc = await source.readComponent(name);
      return {
        content: [
          {
            type: 'text' as const,
            text: doc ? renderDocument(doc) : `No component named "${name}".`,
          },
        ],
      };
    },
  );

  return server;
}
