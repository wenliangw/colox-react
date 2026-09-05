# @colox/wiki

The Colox AI doctrine: usage rules, composition skills and component reference
for AI agents, in plain Markdown.

- `AGENTS.md` — compact doctrine digest (auto-read by dsh / Codex / Cursor;
  Claude reads `CLAUDE.md` — point it here or copy)
- `rules/<name>.rule.md` — conditional rules: `[condition] → action. Why: reason.`
- `skills/<name>/SKILL.md` — procedural composition recipes (Claude / Codex / dsh
  all auto-discover the SKILL.md format)
- `components/<name>.md` — per-component reference

Versioning: `@colox/wiki` releases are linked to `@colox/react` — the doctrine
version always identifies the component version it documents.

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
