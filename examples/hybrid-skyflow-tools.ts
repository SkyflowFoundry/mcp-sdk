/**
 * Example: Hybrid approach - pre-built Skyflow tools + custom protected tools
 *
 * Shows how to combine:
 * 1. registerSkyflowTools() - exposes deidentify/reidentify as MCP tools for LLM use
 * 2. Custom tools that use Skyflow internally for automatic PII protection
 *
 * Run with: npx tsx examples/hybrid-skyflow-tools.ts
 */

import * as express from "express";
import { randomUUID } from "crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import * as z from "zod/v4";
import { SkyflowMCP } from "../src/index.js";
import { registerSkyflowTools, type McpServerLike } from "../src/mcp/index.js";

const PORT = 3003;

async function main() {
  // Create a single Skyflow client to share across all tools
  const skyflow = new SkyflowMCP({
    vaultId: process.env.SKYFLOW_VAULT_ID!,
    vaultUrl: process.env.SKYFLOW_VAULT_URL!,
    credentials: { token: process.env.SKYFLOW_BEARER_TOKEN! },
  });

  const server = new McpServer({
    name: "hybrid-skyflow-example",
    version: "1.0.0",
  });

  // Register pre-built Skyflow tools
  // These expose deidentify/reidentify directly for the LLM to use
  await registerSkyflowTools(server as McpServerLike, skyflow, {
    toolNamePrefix: "skyflow_", // Results in 'skyflow_deidentify', 'skyflow_reidentify'
  });

  // Also add custom tools that use Skyflow internally
  // The LLM doesn't need to know about PII protection - it's handled automatically

  server.registerTool(
    "store-customer-note",
    {
      description:
        "Store a customer note. PII is automatically protected before storage.",
      inputSchema: {
        customerId: z.string().describe("Customer ID"),
        note: z.string().describe("Note content"),
      },
    },
    async ({ customerId, note }) => {
      // Automatically protect PII before "storing"
      const { processedText: protectedNote } = await skyflow.deidentify(note);

      // Simulate database storage
      console.log(`[DB] Storing for ${customerId}: ${protectedNote}`);

      return {
        content: [
          {
            type: "text",
            text: `Note stored for customer ${customerId}`,
          },
        ],
      };
    }
  );

  server.registerTool(
    "get-customer-note",
    {
      description:
        "Retrieve a customer note with original PII restored.",
      inputSchema: {
        customerId: z.string().describe("Customer ID"),
      },
    },
    async ({ customerId }) => {
      // Simulate retrieving from database (would contain tokens)
      const storedNote = `Customer ${customerId} said: Contact me at [EMAIL_ADDRESS_abc123]`;

      // Reidentify to restore original values
      const { processedText: originalNote } =
        await skyflow.reidentify(storedNote);

      return {
        content: [{ type: "text", text: originalNote }],
      };
    }
  );

  server.registerTool(
    "process-with-external-api",
    {
      description: "Process text through external API with PII protection",
      inputSchema: {
        text: z.string().describe("Text to process"),
      },
    },
    async ({ text }) => {
      // wrap() handles the full protect -> process -> restore flow
      const result = await skyflow.wrap(text, async (protectedText) => {
        // Simulated external API call
        return `External API processed: ${protectedText}`;
      });

      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

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
    console.log(`Hybrid MCP server running at http://localhost:${PORT}/mcp`);
    console.log("Available tools:");
    console.log("  - skyflow_deidentify (pre-built)");
    console.log("  - skyflow_reidentify (pre-built)");
    console.log("  - store-customer-note (custom)");
    console.log("  - get-customer-note (custom)");
    console.log("  - process-with-external-api (custom)");
  });
}

main().catch(console.error);
