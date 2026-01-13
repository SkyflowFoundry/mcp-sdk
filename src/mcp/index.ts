/**
 * MCP-specific exports for @skyflow/mcp-sdk
 *
 * Import from '@skyflow/mcp-sdk/mcp' to use these
 */

export {
  registerSkyflowTools,
  registerSkyflowToolsFromEnv,
  type RegisterToolsOptions,
} from "./register.js";

export {
  createDeidentifyTool,
  createReidentifyTool,
  type DeidentifyToolDefinition,
  type ReidentifyToolDefinition,
} from "./tools/index.js";

export {
  createDeidentifyInputSchema,
  createDeidentifyOutputSchema,
  createReidentifyInputSchema,
  createReidentifyOutputSchema,
} from "./schemas.js";
