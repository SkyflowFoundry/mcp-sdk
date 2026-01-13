import {
  Skyflow,
  DeidentifyTextOptions,
  DeidentifyTextRequest,
  ReidentifyTextRequest,
  TokenFormat,
  TokenType as SkyflowTokenType,
  SkyflowError,
} from "skyflow-node";

import type {
  SkyflowMCPConfig,
  DeidentifyOptions,
  DeidentifyResult,
  ReidentifyResult,
  WrapOptions,
  TokenType,
} from "./types.js";
import {
  ConfigurationError,
  DeidentifyError,
  ReidentifyError,
} from "./errors.js";
import { validateVaultConfig } from "../utils/validation.js";
import { getEntityEnum, type EntityType } from "../utils/entityMaps.js";

/**
 * Map SDK token type strings to Skyflow SDK enum values
 */
const TOKEN_TYPE_MAP: Record<TokenType, SkyflowTokenType> = {
  VAULT_TOKEN: SkyflowTokenType.VAULT_TOKEN,
  ENTITY_UNIQUE_COUNTER: SkyflowTokenType.ENTITY_UNIQUE_COUNTER,
  ENTITY_ONLY: SkyflowTokenType.ENTITY_ONLY,
};

/**
 * SkyflowMCP - Simple PII/PHI deidentification for MCP applications
 *
 * @example
 * ```typescript
 * const client = new SkyflowMCP({
 *   vaultId: 'your-vault-id',
 *   vaultUrl: 'https://abc123.vault.skyflowapis.com',
 *   credentials: { token: 'bearer-token' },
 * });
 *
 * const { processedText } = await client.deidentify("My email is john@example.com");
 * // processedText: "My email is [EMAIL_ADDRESS_abc123]"
 *
 * const { processedText: restored } = await client.reidentify(processedText);
 * // restored: "My email is john@example.com"
 * ```
 */
export class SkyflowMCP {
  private skyflow: Skyflow;
  private vaultId: string;
  private config: SkyflowMCPConfig;

  /**
   * Create a new SkyflowMCP client
   *
   * @param config - Configuration options
   * @throws {ConfigurationError} If configuration is invalid
   */
  constructor(config: SkyflowMCPConfig) {
    this.config = config;

    // Validate configuration
    const validation = validateVaultConfig({
      vaultId: config.vaultId,
      vaultUrl: config.vaultUrl,
      accountId: config.accountId,
      workspaceId: config.workspaceId,
    });

    if (!validation.isValid || !validation.config) {
      throw new ConfigurationError(validation.error || "Invalid configuration");
    }

    this.vaultId = validation.config.vaultId;

    // Initialize Skyflow SDK
    try {
      this.skyflow = new Skyflow({
        vaultConfigs: [
          {
            vaultId: validation.config.vaultId,
            clusterId: validation.config.clusterId,
            credentials: config.credentials,
          },
        ],
      });
    } catch (error) {
      throw new ConfigurationError(
        "Failed to initialize Skyflow SDK",
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Deidentify sensitive information in text
   *
   * Replaces PII/PHI with vault tokens that can be reversed using reidentify()
   *
   * @param text - The text containing sensitive information
   * @param options - Optional configuration for this operation
   * @returns Promise resolving to deidentification result
   * @throws {DeidentifyError} If deidentification fails
   *
   * @example
   * ```typescript
   * const result = await client.deidentify("My SSN is 123-45-6789");
   * console.log(result.processedText);
   * // "My SSN is [SSN_abc123]"
   * ```
   */
  async deidentify(
    text: string,
    options?: DeidentifyOptions
  ): Promise<DeidentifyResult> {
    try {
      // Determine token type (per-call > default > VAULT_TOKEN)
      const tokenType =
        options?.tokenType ||
        this.config.options?.defaultTokenType ||
        "VAULT_TOKEN";

      // Configure token format
      const tokenFormat = new TokenFormat();
      tokenFormat.setDefault(TOKEN_TYPE_MAP[tokenType]);

      // Configure options
      const deidentifyOptions = new DeidentifyTextOptions();
      deidentifyOptions.setTokenFormat(tokenFormat);

      // Set entities if specified
      const entities =
        options?.entities || this.config.options?.defaultEntities;
      if (entities && entities.length > 0) {
        const entityEnums = entities.map((e) => getEntityEnum(e as EntityType));
        deidentifyOptions.setEntities(entityEnums);
      }

      // Execute deidentification
      const response = await this.skyflow
        .detect()
        .deidentifyText(new DeidentifyTextRequest(text), deidentifyOptions);

      // Build result
      const result: DeidentifyResult = {
        processedText: response.processedText,
      };

      // Add optional fields if present - cast entities to our type
      if (response.entities) {
        result.entities = response.entities as DeidentifyResult["entities"];
      }
      if (response.wordCount !== undefined) {
        result.wordCount = response.wordCount;
      }
      if (response.charCount !== undefined) {
        result.charCount = response.charCount;
      }

      return result;
    } catch (error) {
      if (error instanceof SkyflowError) {
        const httpCode = error.error?.http_code;
        throw new DeidentifyError(
          error.message,
          typeof httpCode === "number" ? httpCode : undefined,
          error.error?.details,
          error
        );
      }
      throw new DeidentifyError(
        error instanceof Error ? error.message : "Unknown deidentify error",
        undefined,
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Reidentify previously deidentified text
   *
   * Restores vault tokens back to their original sensitive values
   *
   * @param text - The text containing vault tokens
   * @returns Promise resolving to reidentification result
   * @throws {ReidentifyError} If reidentification fails
   *
   * @example
   * ```typescript
   * const result = await client.reidentify("My SSN is [SSN_abc123]");
   * console.log(result.processedText);
   * // "My SSN is 123-45-6789"
   * ```
   */
  async reidentify(text: string): Promise<ReidentifyResult> {
    try {
      const response = await this.skyflow
        .detect()
        .reidentifyText(new ReidentifyTextRequest(text));

      return {
        processedText: response.processedText,
      };
    } catch (error) {
      if (error instanceof SkyflowError) {
        const httpCode = error.error?.http_code;
        throw new ReidentifyError(
          error.message,
          typeof httpCode === "number" ? httpCode : undefined,
          error.error?.details,
          error
        );
      }
      throw new ReidentifyError(
        error instanceof Error ? error.message : "Unknown reidentify error",
        undefined,
        undefined,
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Wrap an async operation with deidentify/reidentify
   *
   * Convenience method that:
   * 1. Deidentifies the input
   * 2. Executes your operation with the protected input
   * 3. Optionally reidentifies the output
   *
   * @param input - The input text containing sensitive information
   * @param operation - Your async operation that processes the protected text
   * @param options - Optional configuration
   * @returns Promise resolving to the operation result (reidentified if string)
   *
   * @example
   * ```typescript
   * const result = await client.wrap(
   *   "My email is john@example.com",
   *   async (protectedText) => {
   *     const response = await fetch('/api/process', {
   *       method: 'POST',
   *       body: JSON.stringify({ text: protectedText }),
   *     });
   *     return response.json().then(r => r.output);
   *   }
   * );
   * // result contains original email restored
   * ```
   */
  async wrap<T>(
    input: string,
    operation: (protectedInput: string) => Promise<T>,
    options?: WrapOptions
  ): Promise<T> {
    // Deidentify input
    const { processedText: protectedInput } = await this.deidentify(
      input,
      options
    );

    // Execute operation
    const result = await operation(protectedInput);

    // Reidentify output if it's a string and reidentification is enabled
    const shouldReidentify = options?.reidentifyOutput !== false;
    if (shouldReidentify && typeof result === "string") {
      const { processedText } = await this.reidentify(result);
      return processedText as T;
    }

    return result;
  }

  /**
   * Get the underlying Skyflow SDK instance
   *
   * Use this for advanced operations not covered by this SDK
   *
   * @returns The Skyflow SDK instance
   */
  getSkyflowInstance(): Skyflow {
    return this.skyflow;
  }

  /**
   * Get the vault ID
   */
  getVaultId(): string {
    return this.vaultId;
  }
}

/**
 * Create a SkyflowMCP client from environment variables
 *
 * Reads configuration from:
 * - SKYFLOW_VAULT_ID
 * - SKYFLOW_VAULT_URL
 * - SKYFLOW_API_KEY or SKYFLOW_BEARER_TOKEN
 * - SKYFLOW_ACCOUNT_ID (optional)
 * - SKYFLOW_WORKSPACE_ID (optional)
 *
 * @param overrides - Optional configuration overrides
 * @returns Configured SkyflowMCP client
 * @throws {ConfigurationError} If required environment variables are missing
 */
export function createFromEnv(
  overrides?: Partial<SkyflowMCPConfig>
): SkyflowMCP {
  const vaultId = overrides?.vaultId || process.env.SKYFLOW_VAULT_ID;
  const vaultUrl = overrides?.vaultUrl || process.env.SKYFLOW_VAULT_URL;
  const apiKey = process.env.SKYFLOW_API_KEY;
  const bearerToken = process.env.SKYFLOW_BEARER_TOKEN;

  if (!vaultId) {
    throw new ConfigurationError(
      "SKYFLOW_VAULT_ID environment variable is required"
    );
  }

  if (!vaultUrl) {
    throw new ConfigurationError(
      "SKYFLOW_VAULT_URL environment variable is required"
    );
  }

  // Determine credentials (bearer token takes precedence)
  let credentials = overrides?.credentials;
  if (!credentials) {
    if (bearerToken) {
      credentials = { token: bearerToken };
    } else if (apiKey) {
      credentials = { apiKey };
    } else {
      throw new ConfigurationError(
        "Either SKYFLOW_BEARER_TOKEN or SKYFLOW_API_KEY environment variable is required"
      );
    }
  }

  return new SkyflowMCP({
    vaultId,
    vaultUrl,
    credentials,
    accountId: overrides?.accountId || process.env.SKYFLOW_ACCOUNT_ID,
    workspaceId: overrides?.workspaceId || process.env.SKYFLOW_WORKSPACE_ID,
    options: overrides?.options,
  });
}
