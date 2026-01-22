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
 * Content block types for MCP tool results
 */
export interface TextContent {
  type: "text";
  text: string;
}

/**
 * MCP CallToolResult structure matching the official MCP SDK
 */
export interface CallToolResult {
  [x: string]: unknown;
  content: TextContent[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}

/**
 * Handler extra context provided by MCP server
 */
export interface RequestHandlerExtra {
  sessionId?: string;
}

/**
 * Tool handler function signature matching the MCP SDK.
 * When a tool has an inputSchema, the handler receives (args, extra).
 */
export type ToolHandler = (
  args: Record<string, unknown>,
  extra: RequestHandlerExtra
) => CallToolResult | Promise<CallToolResult>;

/**
 * MCP Server interface (minimal subset we need)
 * Compatible with @modelcontextprotocol/sdk McpServer
 *
 * Note: The actual McpServer has complex conditional callback types.
 * This interface uses a generic callback to match both zero-arg and with-arg patterns.
 */
export interface McpServerLike {
  registerTool<InputArgs = unknown>(
    name: string,
    definition: {
      title?: string;
      description?: string;
      inputSchema?: InputArgs;
      outputSchema?: unknown;
    },
    handler: InputArgs extends undefined
      ? (extra: RequestHandlerExtra) => CallToolResult | Promise<CallToolResult>
      : (
          args: Record<string, unknown>,
          extra: RequestHandlerExtra
        ) => CallToolResult | Promise<CallToolResult>
  ): unknown;
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
      (args: Record<string, unknown>) => deidentifyTool.handler(args as Parameters<typeof deidentifyTool.handler>[0])
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
      (args: Record<string, unknown>) => reidentifyTool.handler(args as Parameters<typeof reidentifyTool.handler>[0])
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
