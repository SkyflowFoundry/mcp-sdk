import type { EntityType } from "../utils/entityMaps.js";

/**
 * Credential types supported by Skyflow
 */
export type SkyflowCredentials = { token: string } | { apiKey: string };

/**
 * Token types for deidentification output
 */
export type TokenType = "VAULT_TOKEN" | "ENTITY_UNIQUE_COUNTER" | "ENTITY_ONLY";

/**
 * Configuration for initializing SkyflowMCP client
 */
export interface SkyflowMCPConfig {
  /** Skyflow vault identifier */
  vaultId: string;

  /** Skyflow vault URL (e.g., https://abc123.vault.skyflowapis.com) */
  vaultUrl: string;

  /** Authentication credentials (bearer token or API key) */
  credentials: SkyflowCredentials;

  /** Optional account ID */
  accountId?: string;

  /** Optional workspace ID */
  workspaceId?: string;

  /** Advanced configuration options */
  options?: SkyflowMCPOptions;
}

/**
 * Advanced configuration options
 */
export interface SkyflowMCPOptions {
  /** Default token type for deidentification (default: VAULT_TOKEN) */
  defaultTokenType?: TokenType;

  /** Default entity types to detect (default: all) */
  defaultEntities?: EntityType[];
}

/**
 * Options for deidentify operation
 */
export interface DeidentifyOptions {
  /** Token type for this operation (overrides default) */
  tokenType?: TokenType;

  /** Entity types to detect (overrides default) */
  entities?: EntityType[];
}

/**
 * Information about a detected entity
 */
export interface EntityInfo {
  /** The token that replaced the sensitive value */
  token?: string;

  /** The original sensitive value (only in some modes) */
  value?: string;

  /** The type of entity detected */
  entity?: string;

  /** Position in original text */
  textIndex?: { start?: number; end?: number };

  /** Position in processed text */
  processedIndex?: { start?: number; end?: number };

  /** Confidence scores */
  scores?: Record<string, number>;
}

/**
 * Result of deidentification operation
 */
export interface DeidentifyResult {
  /** The processed text with sensitive data replaced */
  processedText: string;

  /** Information about detected entities */
  entities?: EntityInfo[];

  /** Word count of processed text */
  wordCount?: number;

  /** Character count of processed text */
  charCount?: number;
}

/**
 * Result of reidentification operation
 */
export interface ReidentifyResult {
  /** The restored text with original sensitive data */
  processedText: string;
}

/**
 * Options for the wrap utility function
 */
export interface WrapOptions extends DeidentifyOptions {
  /** Whether to reidentify the output (default: true) */
  reidentifyOutput?: boolean;
}
