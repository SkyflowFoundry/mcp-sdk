import { SkyflowMCP, createFromEnv } from "../client/SkyflowMCP.js";
import type { SkyflowMCPConfig } from "../client/types.js";
import { createDeidentifyTool } from "./tools/deidentify.js";
import { createReidentifyTool } from "./tools/reidentify.js";

/**
 * Options for registering Skyflow tools
 */
export interface RegisterToolsOptions {
  /** Include deidentify tool (default: true) */
  includeDeidentify?: boolean;

  /** Include reidentify tool (default: true) */
  includeReidentify?: boolean;

  /** Prefix for tool names (e.g., "skyflow_") */
  toolNamePrefix?: string;
}

/**
 * MCP Server interface (minimal subset we need)
 * This allows us to work with any MCP server implementation
 */
interface McpServerLike {
  registerTool(
    name: string,
    definition: {
      title: string;
      description: string;
      inputSchema: Record<string, unknown>;
      outputSchema: Record<string, unknown>;
    },
    handler: (args: Record<string, unknown>) => Promise<unknown>
  ): void;
}

/**
 * Register Skyflow deidentify/reidentify tools on an MCP server
 *
 * @param server - The MCP server instance
 * @param clientOrConfig - Either a SkyflowMCP client or configuration to create one
 * @param options - Registration options
 *
 * @example
 * ```typescript
 * import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
 * import { registerSkyflowTools } from '@skyflow/mcp-sdk/mcp';
 *
 * const server = new McpServer({ name: 'my-server', version: '1.0.0' });
 *
 * await registerSkyflowTools(server, {
 *   vaultId: 'vault-id',
 *   vaultUrl: 'https://abc123.vault.skyflowapis.com',
 *   credentials: { token: 'bearer-token' },
 * });
 * ```
 */
export async function registerSkyflowTools(
  server: McpServerLike,
  clientOrConfig: SkyflowMCP | SkyflowMCPConfig,
  options: RegisterToolsOptions = {}
): Promise<void> {
  const {
    includeDeidentify = true,
    includeReidentify = true,
    toolNamePrefix = "",
  } = options;

  // Get or create client
  const client =
    clientOrConfig instanceof SkyflowMCP
      ? clientOrConfig
      : new SkyflowMCP(clientOrConfig);

  // Register deidentify tool
  if (includeDeidentify) {
    const deidentifyTool = await createDeidentifyTool(client, toolNamePrefix);
    server.registerTool(
      deidentifyTool.name,
      {
        title: deidentifyTool.title,
        description: deidentifyTool.description,
        inputSchema: deidentifyTool.inputSchema,
        outputSchema: deidentifyTool.outputSchema,
      },
      deidentifyTool.handler as (
        args: Record<string, unknown>
      ) => Promise<unknown>
    );
  }

  // Register reidentify tool
  if (includeReidentify) {
    const reidentifyTool = await createReidentifyTool(client, toolNamePrefix);
    server.registerTool(
      reidentifyTool.name,
      {
        title: reidentifyTool.title,
        description: reidentifyTool.description,
        inputSchema: reidentifyTool.inputSchema,
        outputSchema: reidentifyTool.outputSchema,
      },
      reidentifyTool.handler as (
        args: Record<string, unknown>
      ) => Promise<unknown>
    );
  }
}

/**
 * Register Skyflow tools using environment variables for configuration
 *
 * @param server - The MCP server instance
 * @param options - Registration options
 *
 * @example
 * ```typescript
 * // Requires SKYFLOW_VAULT_ID, SKYFLOW_VAULT_URL, and
 * // SKYFLOW_API_KEY or SKYFLOW_BEARER_TOKEN environment variables
 *
 * await registerSkyflowToolsFromEnv(server);
 * ```
 */
export async function registerSkyflowToolsFromEnv(
  server: McpServerLike,
  options: RegisterToolsOptions = {}
): Promise<void> {
  const client = createFromEnv();
  await registerSkyflowTools(server, client, options);
}
