/**
 * Example: AI Agent with Skyflow PII protection
 *
 * Shows how to protect PII when calling external AI/LLM APIs from an MCP tool.
 * The pattern: deidentify user input -> call AI API -> reidentify response.
 *
 * Run with: npx tsx examples/ai-agent-with-skyflow.ts
 */

import * as express from "express";
import { randomUUID } from "crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import * as z from "zod/v4";
import { SkyflowMCP } from "../src/index.js";

const PORT = 3002;

// Simulated external AI API (replace with OpenAI, Anthropic, etc.)
async function callExternalAI(prompt: string): Promise<string> {
  console.log("[AI API] Processing protected prompt...");
  // In production, this would call an actual AI service
  return `AI Response: I've analyzed the text "${prompt}" and found it contains customer feedback.`;
}

async function main() {
  const skyflow = new SkyflowMCP({
    vaultId: process.env.SKYFLOW_VAULT_ID!,
    vaultUrl: process.env.SKYFLOW_VAULT_URL!,
    credentials: { token: process.env.SKYFLOW_BEARER_TOKEN! },
  });

  const server = new McpServer({
    name: "ai-agent-example",
    version: "1.0.0",
  });

  // Tool that sends user data to external AI while protecting PII
  server.registerTool(
    "analyze-feedback",
    {
      description:
        "Analyze customer feedback using AI. PII is protected before sending to the AI service.",
      inputSchema: {
        feedback: z.string().describe("Customer feedback text"),
        includeContact: z
          .boolean()
          .optional()
          .describe("Include contact info in analysis"),
      },
    },
    async ({ feedback, includeContact }) => {
      // Use wrap() to automatically protect PII during AI call
      const analysis = await skyflow.wrap(
        feedback,
        async (protectedFeedback) => {
          // PII is now tokenized - safe to send to external AI
          const prompt = `Analyze this customer feedback: ${protectedFeedback}`;
          return callExternalAI(prompt);
        },
        {
          // Optionally skip reidentification if you want to keep tokens
          reidentifyOutput: includeContact ?? true,
        }
      );

      return {
        content: [{ type: "text", text: analysis }],
      };
    }
  );

  // Tool demonstrating selective entity protection
  server.registerTool(
    "summarize-message",
    {
      description: "Summarize a message, protecting only email and phone",
      inputSchema: {
        message: z.string().describe("Message to summarize"),
      },
    },
    async ({ message }) => {
      // Only protect specific entity types
      const { processedText: protected_ } = await skyflow.deidentify(message, {
        entities: ["email_address", "phone_number"],
      });

      const summary = await callExternalAI(`Summarize: ${protected_}`);

      const { processedText: result } = await skyflow.reidentify(summary);

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
    console.log(`AI Agent MCP server running at http://localhost:${PORT}/mcp`);
  });
}

main().catch(console.error);
