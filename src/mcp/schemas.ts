/**
 * Zod schemas for MCP tool inputs and outputs
 *
 * Note: These schemas are only used if zod is installed as a peer dependency
 */

import { ENTITY_TYPES } from "../utils/entityMaps.js";

// Dynamic import check for zod
let z: typeof import("zod") | null = null;

async function getZod() {
  if (z) return z;
  try {
    z = await import("zod");
    return z;
  } catch {
    throw new Error(
      "zod is required for MCP tool schemas. Install it with: npm install zod"
    );
  }
}

/**
 * Create deidentify tool input schema
 */
export async function createDeidentifyInputSchema() {
  const { z } = await getZod();
  return {
    inputString: z.string().min(1).describe("The text to deidentify"),
    tokenType: z
      .enum(["VAULT_TOKEN", "ENTITY_UNIQUE_COUNTER", "ENTITY_ONLY"])
      .optional()
      .describe("Token format for replacements (default: VAULT_TOKEN)"),
    entities: z
      .array(z.enum(ENTITY_TYPES as unknown as [string, ...string[]]))
      .optional()
      .describe("Specific entity types to detect (default: all)"),
  };
}

/**
 * Create deidentify tool output schema
 */
export async function createDeidentifyOutputSchema() {
  const { z } = await getZod();
  return {
    processedText: z.string().describe("Text with sensitive data replaced"),
    wordCount: z.number().optional().describe("Word count of processed text"),
    charCount: z
      .number()
      .optional()
      .describe("Character count of processed text"),
    entitiesFound: z.number().optional().describe("Number of entities found"),
  };
}

/**
 * Create reidentify tool input schema
 */
export async function createReidentifyInputSchema() {
  const { z } = await getZod();
  return {
    inputString: z
      .string()
      .min(1)
      .describe("The text containing vault tokens to restore"),
  };
}

/**
 * Create reidentify tool output schema
 */
export async function createReidentifyOutputSchema() {
  const { z } = await getZod();
  return {
    processedText: z.string().describe("Text with original data restored"),
  };
}
