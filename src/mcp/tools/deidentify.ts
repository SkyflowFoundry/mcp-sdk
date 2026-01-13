import type { SkyflowMCP } from "../../client/SkyflowMCP.js";
import type { EntityType } from "../../utils/entityMaps.js";
import type { TokenType } from "../../client/types.js";
import {
  createDeidentifyInputSchema,
  createDeidentifyOutputSchema,
} from "../schemas.js";

/**
 * Tool definition for deidentify operation
 */
export interface DeidentifyToolDefinition {
  name: string;
  title: string;
  description: string;
  inputSchema: Awaited<ReturnType<typeof createDeidentifyInputSchema>>;
  outputSchema: Awaited<ReturnType<typeof createDeidentifyOutputSchema>>;
  handler: (args: {
    inputString: string;
    tokenType?: TokenType;
    entities?: EntityType[];
  }) => Promise<{
    content: Array<{ type: "text"; text: string }>;
    structuredContent: {
      processedText: string;
      wordCount?: number;
      charCount?: number;
      entitiesFound?: number;
    };
  }>;
}

/**
 * Create the deidentify MCP tool definition
 *
 * @param client - SkyflowMCP client instance
 * @param namePrefix - Optional prefix for tool name (e.g., "skyflow_")
 * @returns Tool definition ready for MCP registration
 */
export async function createDeidentifyTool(
  client: SkyflowMCP,
  namePrefix = ""
): Promise<DeidentifyToolDefinition> {
  const inputSchema = await createDeidentifyInputSchema();
  const outputSchema = await createDeidentifyOutputSchema();

  return {
    name: `${namePrefix}deidentify`,
    title: "Skyflow Deidentify Tool",
    description: `Deidentify sensitive information in text using Skyflow.
Replaces PII/PHI (emails, SSNs, credit cards, etc.) with vault tokens that can be reversed.
Example: "My email is john@example.com" → "My email is [EMAIL_ADDRESS_abc123]"`,
    inputSchema,
    outputSchema,
    handler: async ({ inputString, tokenType, entities }) => {
      const result = await client.deidentify(inputString, {
        tokenType,
        entities,
      });

      const output = {
        processedText: result.processedText,
        wordCount: result.wordCount,
        charCount: result.charCount,
        entitiesFound: result.entities?.length,
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(output) }],
        structuredContent: output,
      };
    },
  };
}
