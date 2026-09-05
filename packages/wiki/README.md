# @colox/wiki

The Colox AI doctrine: usage rules, composition skills and component reference
for AI agents, in plain Markdown.

- `AGENTS.md` — compact doctrine digest (auto-read by dsh / Codex / Cursor;
  Claude reads `CLAUDE.md` — point it here or copy)
- `components.md` — component map (responsibility + status)
- `skills/<name>/SKILL.md` — one bundle per topic: recipe in the body,
  `references/rules.md` (must/avoid) and `references/component.md` (API) read
  on demand; the SKILL.md format is auto-discovered by Claude / Codex / dsh
  skill catalogs
- `skills/doctrine/` — read order + global rules

Versioning: `@colox/wiki` keeps its major.minor in lockstep with
`@colox/react` — a component API change ships its doctrine update under the
same first two digits. The patch digit belongs to component bugfixes alone:
wiki does not change unless the API does, so `@colox/react` 0.1.3 and
`@colox/wiki` 0.1.0 can coexist.

## Wire it up

### Option A — MCP (recommended)

Install the official local server (`@colox/mcp`) and register it with your harness:

```jsonc
// Claude: .mcp.json (project) · Cursor: .cursor/mcp.json
{ "mcpServers": { "colox": { "command": "npx", "args": ["-y", "@colox/mcp"] } } }
```

```toml
# Codex: ~/.codex/config.toml
[mcp_servers.colox]
command = "npx"
args = ["-y", "@colox/mcp"]
```

The server runs fully offline over local stdio and reads the wiki content from
this package — upgrade the dependency to upgrade the doctrine.

### Option B — files (no MCP)

Copy the skill folder into your harness's project skill directory
(`.claude/skills`, `.agents/skills`, `.dsh/skills` — any of them works) and add
`AGENTS.md` to your project root (as `CLAUDE.md` for Claude).
