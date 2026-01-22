/**
 * Example: Custom MCP tool with Skyflow PII protection
 *
 * Shows how to use Skyflow deidentify/reidentify within your own MCP tools
 * to protect sensitive data before processing.
 *
 * Run with: npx tsx examples/custom-tool-with-skyflow.ts
 */

import * as express from "express";
import { randomUUID } from "crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import * as z from "zod/v4";
import { SkyflowMCP } from "../src/index.js";

const PORT = 3001;

async function main() {
  // Create Skyflow client for PII protection
  const skyflow = new SkyflowMCP({
    vaultId: process.env.SKYFLOW_VAULT_ID!,
    vaultUrl: process.env.SKYFLOW_VAULT_URL!,
    credentials: { token: process.env.SKYFLOW_BEARER_TOKEN! },
  });

  // Create MCP server
  const server = new McpServer({
    name: "custom-tool-example",
    version: "1.0.0",
  });

  // Pattern 1: Manual deidentify/reidentify
  // Use when you need fine-grained control over the protection flow
  server.registerTool(
    "process-customer-request",
    {
      description: "Process a customer request while protecting PII",
      inputSchema: {
        request: z.string().describe("Customer request text"),
      },
    },
    async ({ request }) => {
      // Step 1: Deidentify the input
      const { processedText: protectedRequest } =
        await skyflow.deidentify(request);

      // Step 2: Process the protected data (simulated)
      const processedResult = `Processed: ${protectedRequest}`;

      // Step 3: Reidentify the output
      const { processedText: finalResult } =
        await skyflow.reidentify(processedResult);

      return {
        content: [{ type: "text", text: finalResult }],
      };
    }
  );

  // Pattern 2: Using wrap() for cleaner code
  // Use when you want automatic deidentify -> process -> reidentify
  server.registerTool(
    "analyze-message",
    {
      description: "Analyze a message while protecting sensitive data",
      inputSchema: {
        message: z.string().describe("Message to analyze"),
      },
    },
    async ({ message }) => {
      const result = await skyflow.wrap(message, async (protectedMessage) => {
        // Your processing logic here - PII is already protected
        return `Analysis of: ${protectedMessage}`;
      });

      return {
        content: [{ type: "text", text: result }],
      };
    }
  );

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
    console.log(`MCP server running at http://localhost:${PORT}/mcp`);
  });
}

main().catch(console.error);
