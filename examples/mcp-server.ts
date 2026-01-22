/**
 * Example: Creating an MCP server with Skyflow tools
 *
 * This shows how to add Skyflow deidentify/reidentify tools
 * to an existing MCP server using StreamableHTTP transport.
 *
 * Run with: npx tsx examples/mcp-server.ts
 */

import * as express from "express";
import { randomUUID } from "crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  registerSkyflowTools,
  registerSkyflowToolsFromEnv,
  type McpServerLike,
} from "../src/mcp/index.js";

const PORT = 3000;

async function main() {
  // Create an MCP server
  const server = new McpServer({
    name: "my-ai-server",
    version: "1.0.0",
  });

  // Option 1: Register tools with explicit config
  await registerSkyflowTools(server as McpServerLike, {
    vaultId: process.env.SKYFLOW_VAULT_ID!,
    vaultUrl: process.env.SKYFLOW_VAULT_URL!,
    credentials: { token: process.env.SKYFLOW_BEARER_TOKEN! },
  });

  // Option 2: Register tools from environment variables
  // await registerSkyflowToolsFromEnv(server as McpServerLike);

  // Option 3: Customize which tools to register
  // await registerSkyflowTools(server, config, {
  //   includeDeidentify: true,
  //   includeReidentify: true,
  //   toolNamePrefix: 'skyflow_',  // Results in 'skyflow_deidentify'
  // });

  // Add your own custom tools
  // server.registerTool('my-tool', { ... }, handler);

  // Set up Express with StreamableHTTP transport
  const app = express.default();
  app.use(express.json());

  app.post("/mcp", async (req, res) => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  });

  app.get("/mcp", async (req, res) => {
    res.writeHead(405).end("Method not allowed. Use POST for MCP requests.");
  });

  app.delete("/mcp", async (req, res) => {
    res.writeHead(405).end("Method not allowed.");
  });

  app.listen(PORT, () => {
    console.log(`MCP server with Skyflow tools at http://localhost:${PORT}/mcp`);
  });
}

main().catch(console.error);
