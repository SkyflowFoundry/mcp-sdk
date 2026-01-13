/**
 * Example: Creating an MCP server with Skyflow tools
 *
 * This shows how to add Skyflow deidentify/reidentify tools
 * to an existing MCP server.
 *
 * Run with: npx tsx examples/mcp-server.ts
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  registerSkyflowTools,
  registerSkyflowToolsFromEnv,
} from "../src/mcp/index.js";

async function main() {
  // Create an MCP server
  const server = new McpServer({
    name: "my-ai-server",
    version: "1.0.0",
  });

  // Option 1: Register tools with explicit config
  await registerSkyflowTools(server, {
    vaultId: process.env.SKYFLOW_VAULT_ID!,
    vaultUrl: process.env.SKYFLOW_VAULT_URL!,
    credentials: { token: process.env.SKYFLOW_BEARER_TOKEN! },
  });

  // Option 2: Register tools from environment variables
  // await registerSkyflowToolsFromEnv(server);

  // Option 3: Customize which tools to register
  // await registerSkyflowTools(server, config, {
  //   includeDeidentify: true,
  //   includeReidentify: true,
  //   toolNamePrefix: 'skyflow_',  // Results in 'skyflow_deidentify'
  // });

  // Add your own custom tools
  // server.registerTool('my-tool', { ... }, handler);

  // Connect via stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("MCP server running with Skyflow tools");
}

main().catch(console.error);
