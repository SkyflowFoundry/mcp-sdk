# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is `@skyflow/mcp-sdk`, a TypeScript SDK that wraps Skyflow's deidentification APIs to provide PII/PHI protection for MCP (Model Context Protocol) applications. It enables AI/LLM applications to tokenize sensitive data before processing and restore it afterward.

## Build & Development Commands

```bash
pnpm install          # Install dependencies
pnpm run build        # Build TypeScript to dist/
pnpm run dev          # Watch mode for development
pnpm run test         # Run all tests
pnpm run test:watch   # Run tests in watch mode
pnpm run test:coverage # Run tests with coverage
```

Run a single test file:
```bash
npx vitest run tests/unit/client/SkyflowMCP.test.ts
```

Run tests matching a pattern:
```bash
npx vitest run -t "deidentify"
```

## Architecture

### Entry Points

- Main SDK: `src/index.ts` → exports `SkyflowMCP` client and utilities
- MCP Integration: `src/mcp/index.ts` → exports `registerSkyflowTools` for MCP servers

### Core Components

**Client Layer** (`src/client/`)
- `SkyflowMCP.ts` - Main client class wrapping `skyflow-node` SDK. Handles deidentify/reidentify operations and the `wrap()` convenience method
- `types.ts` - TypeScript interfaces for config, options, and results
- `errors.ts` - Custom error classes: `ConfigurationError`, `DeidentifyError`, `ReidentifyError`

**MCP Tools** (`src/mcp/`)
- `register.ts` - `registerSkyflowTools()` function to add deidentify/reidentify tools to any MCP server
- `tools/deidentify.ts` and `tools/reidentify.ts` - Individual MCP tool definitions with Zod schemas
- `schemas.ts` - Zod schemas for MCP tool input/output validation

**Utilities** (`src/utils/`)
- `validation.ts` - Vault configuration validation, cluster ID extraction from URLs
- `entityMaps.ts` - Maps 67 entity type strings to Skyflow SDK enums

**Middleware** (`src/middleware/`)
- `wrap.ts` - `wrapWithProtection()` standalone utility and `createProtectedWrapper()` factory

### Key Patterns

1. **Token Types**: Three modes for deidentified output - `VAULT_TOKEN` (reversible), `ENTITY_UNIQUE_COUNTER`, `ENTITY_ONLY`

2. **Environment Configuration**: `createFromEnv()` reads `SKYFLOW_VAULT_ID`, `SKYFLOW_VAULT_URL`, and `SKYFLOW_BEARER_TOKEN`/`SKYFLOW_API_KEY`

3. **MCP Tool Registration**: Tools are registered with JSON schemas derived from Zod. The `McpServerLike` interface allows compatibility with any MCP server implementation

4. **Dual Export Structure**: Package exports both main SDK (`.`) and MCP-specific code (`./mcp`) as separate entry points

## Testing

Tests use Vitest with mocked `skyflow-node` SDK. Test files mirror source structure under `tests/unit/`. Configuration validation and entity mapping have dedicated test coverage.

## Dependencies

- `skyflow-node` - Core Skyflow SDK (required)
- `@modelcontextprotocol/sdk` and `zod` - Peer dependencies, optional (only needed for MCP tool registration)
