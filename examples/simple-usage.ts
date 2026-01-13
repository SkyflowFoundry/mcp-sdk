/**
 * Simple usage example for @skyflow/mcp-sdk
 *
 * Run with: npx tsx examples/simple-usage.ts
 */

import { SkyflowMCP, createFromEnv } from "../src/index.js";

async function main() {
  // Option 1: Create client with explicit config
  const client = new SkyflowMCP({
    vaultId: process.env.SKYFLOW_VAULT_ID!,
    vaultUrl: process.env.SKYFLOW_VAULT_URL!,
    credentials: { token: process.env.SKYFLOW_BEARER_TOKEN! },
  });

  // Option 2: Create client from environment variables
  // const client = createFromEnv();

  // Example text with sensitive data
  const inputText = `
    Customer: John Smith
    Email: john.smith@example.com
    SSN: 123-45-6789
    Phone: (555) 123-4567
    Credit Card: 4111-1111-1111-1111
  `;

  console.log("=== Original Text ===");
  console.log(inputText);

  // Deidentify the text
  const deidentified = await client.deidentify(inputText);

  console.log("\n=== Deidentified Text ===");
  console.log(deidentified.processedText);
  console.log("\nStats:", {
    wordCount: deidentified.wordCount,
    charCount: deidentified.charCount,
    entitiesFound: deidentified.entities?.length,
  });

  // Reidentify to restore original values
  const reidentified = await client.reidentify(deidentified.processedText);

  console.log("\n=== Reidentified Text ===");
  console.log(reidentified.processedText);
}

main().catch(console.error);
