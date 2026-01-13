/**
 * @skyflow/mcp-sdk
 *
 * Simple PII/PHI deidentification for MCP applications
 *
 * @example
 * ```typescript
 * import { SkyflowMCP } from '@skyflow/mcp-sdk';
 *
 * const client = new SkyflowMCP({
 *   vaultId: 'your-vault-id',
 *   vaultUrl: 'https://abc123.vault.skyflowapis.com',
 *   credentials: { token: 'bearer-token' },
 * });
 *
 * // Deidentify sensitive data
 * const { processedText } = await client.deidentify("My email is john@example.com");
 * // processedText: "My email is [EMAIL_ADDRESS_abc123]"
 *
 * // Restore original data
 * const { processedText: restored } = await client.reidentify(processedText);
 * // restored: "My email is john@example.com"
 * ```
 *
 * @packageDocumentation
 */

// Main client
export { SkyflowMCP, createFromEnv } from "./client/SkyflowMCP.js";

// Types
export type {
  SkyflowMCPConfig,
  SkyflowMCPOptions,
  SkyflowCredentials,
  TokenType,
  DeidentifyOptions,
  DeidentifyResult,
  ReidentifyResult,
  EntityInfo,
  WrapOptions,
} from "./client/types.js";

// Errors
export {
  SkyflowMCPError,
  ConfigurationError,
  AuthenticationError,
  DeidentifyError,
  ReidentifyError,
} from "./client/errors.js";

// Utilities
export { validateVaultConfig, extractClusterId } from "./utils/validation.js";
export type { VaultConfig, ValidationResult } from "./utils/validation.js";

export { ENTITY_TYPES, ENTITY_MAP, isValidEntity } from "./utils/entityMaps.js";
export type { EntityType } from "./utils/entityMaps.js";

// Middleware utilities
export {
  wrapWithProtection,
  createProtectedWrapper,
} from "./middleware/wrap.js";
export type { WrapWithProtectionOptions } from "./middleware/wrap.js";
