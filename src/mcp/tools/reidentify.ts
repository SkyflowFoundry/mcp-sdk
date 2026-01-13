import type { SkyflowMCP } from "../../client/SkyflowMCP.js";
import {
  createReidentifyInputSchema,
  createReidentifyOutputSchema,
} from "../schemas.js";

/**
 * Tool definition for reidentify operation
 */
export interface ReidentifyToolDefinition {
  name: string;
  title: string;
  description: string;
  inputSchema: Awaited<ReturnType<typeof createReidentifyInputSchema>>;
  outputSchema: Awaited<ReturnType<typeof createReidentifyOutputSchema>>;
  handler: (args: { inputString: string }) => Promise<{
    content: Array<{ type: "text"; text: string }>;
    structuredContent: {
      processedText: string;
    };
  }>;
}

/**
 * Create the reidentify MCP tool definition
 *
 * @param client - SkyflowMCP client instance
 * @param namePrefix - Optional prefix for tool name (e.g., "skyflow_")
 * @returns Tool definition ready for MCP registration
 */
export async function createReidentifyTool(
  client: SkyflowMCP,
  namePrefix = ""
): Promise<ReidentifyToolDefinition> {
  const inputSchema = await createReidentifyInputSchema();
  const outputSchema = await createReidentifyOutputSchema();

  return {
    name: `${namePrefix}reidentify`,
    title: "Skyflow Reidentify Tool",
    description: `Restore previously deidentified text using Skyflow.
Replaces vault tokens with their original sensitive values.
Example: "My email is [EMAIL_ADDRESS_abc123]" → "My email is john@example.com"`,
    inputSchema,
    outputSchema,
    handler: async ({ inputString }) => {
      const result = await client.reidentify(inputString);

      const output = {
        processedText: result.processedText,
      };

      return {
        content: [{ type: "text" as const, text: JSON.stringify(output) }],
        structuredContent: output,
      };
    },
  };
}
