#!/usr/bin/env node
import { createRequire } from 'node:module';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { WikiSource } from './doctrine.js';
import { buildServer } from './server.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

const source = WikiSource.fromPackage();
const server = buildServer(source, { name: 'colox', version });

// stdio uses stdin/stdout for the protocol; stderr stays free for logs.
console.error(`[colox-mcp] serving @colox/wiki from ${source.root}`);

const transport = new StdioServerTransport();
await server.connect(transport);
