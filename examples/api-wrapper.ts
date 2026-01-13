/**
 * Example: Wrapping external API calls with deidentification
 *
 * This pattern is useful when you need to:
 * - Send user data to external AI/LLM APIs
 * - Store data in third-party services
 * - Process data through external pipelines
 *
 * Run with: npx tsx examples/api-wrapper.ts
 */

import { SkyflowMCP, wrapWithProtection } from "../src/index.js";

// Simulated external API
async function mockExternalAPI(text: string): Promise<string> {
  // This simulates an API that echoes back the text
  // In reality, this could be OpenAI, Claude, or any other service
  console.log("[API] Received:", text.substring(0, 50) + "...");
  return `Processed: ${text}`;
}

async function main() {
  const client = new SkyflowMCP({
    vaultId: process.env.SKYFLOW_VAULT_ID!,
    vaultUrl: process.env.SKYFLOW_VAULT_URL!,
    credentials: { token: process.env.SKYFLOW_BEARER_TOKEN! },
  });

  const userPrompt = "My name is Jane Doe and my email is jane@example.com. Please help me.";

  console.log("=== Using client.wrap() ===");
  console.log("Original prompt:", userPrompt);

  // Method 1: Using client.wrap() - simplest approach
  const result1 = await client.wrap(
    userPrompt,
    async (protectedPrompt) => {
      console.log("Protected prompt sent to API:", protectedPrompt);
      return mockExternalAPI(protectedPrompt);
    }
  );

  console.log("Restored response:", result1);

  console.log("\n=== Using wrapWithProtection() ===");

  // Method 2: Using standalone wrapWithProtection for more control
  const result2 = await wrapWithProtection(
    client,
    userPrompt,
    async (protectedPrompt) => mockExternalAPI(protectedPrompt),
    {
      entities: ["email_address", "name"], // Only protect these entities
      onDeidentify: (result) => {
        console.log("Deidentified:", result.entities?.length, "entities");
      },
      onReidentify: (text) => {
        console.log("Reidentified response length:", text.length);
      },
    }
  );

  console.log("Final result:", result2);

  console.log("\n=== Skip reidentification ===");

  // Method 3: Don't reidentify the output (keep tokens)
  const result3 = await client.wrap(
    userPrompt,
    async (protectedPrompt) => mockExternalAPI(protectedPrompt),
    { reidentifyOutput: false }
  );

  console.log("Result with tokens:", result3);
}

main().catch(console.error);
