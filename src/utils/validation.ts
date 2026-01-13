/**
 * Vault configuration validation utilities
 */

export interface VaultConfig {
  vaultId: string;
  vaultUrl: string;
  clusterId: string;
  accountId?: string;
  workspaceId?: string;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  config?: VaultConfig;
}

/**
 * Extract clusterId from vaultUrl
 *
 * @param vaultUrl - The vault URL (with or without https:// prefix)
 * @returns The cluster ID or null if invalid format
 *
 * @example
 * extractClusterId("https://abc123.vault.skyflowapis.com") // => "abc123"
 * extractClusterId("abc123.vault.skyflowapis.com") // => "abc123"
 * extractClusterId("https://invalid.com") // => null
 */
export function extractClusterId(vaultUrl: string): string | null {
  const match = vaultUrl.match(/(?:https?:\/\/)?([^.]+)\.vault/);
  return match?.[1] ?? null;
}

/**
 * Validate vault configuration parameters
 *
 * @param params - Vault configuration parameters
 * @returns ValidationResult with isValid, optional error, and optional config
 *
 * @example
 * validateVaultConfig({
 *   vaultId: "vault123",
 *   vaultUrl: "https://abc.vault.skyflowapis.com"
 * })
 * // => { isValid: true, config: { vaultId: "vault123", ... } }
 */
export function validateVaultConfig(params: {
  vaultId?: string;
  vaultUrl?: string;
  accountId?: string;
  workspaceId?: string;
}): ValidationResult {
  if (!params.vaultId) {
    return {
      isValid: false,
      error: "vaultId is required",
    };
  }

  if (!params.vaultUrl) {
    return {
      isValid: false,
      error: "vaultUrl is required",
    };
  }

  const clusterId = extractClusterId(params.vaultUrl);
  if (!clusterId) {
    return {
      isValid: false,
      error:
        "Invalid vaultUrl format. Expected format: https://<clusterId>.vault.skyflowapis.com",
    };
  }

  return {
    isValid: true,
    config: {
      vaultId: params.vaultId,
      vaultUrl: params.vaultUrl,
      clusterId,
      accountId: params.accountId,
      workspaceId: params.workspaceId,
    },
  };
}
