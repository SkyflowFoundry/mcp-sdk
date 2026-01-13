import { describe, it, expect } from "vitest";
import {
  extractClusterId,
  validateVaultConfig,
} from "../../../src/utils/validation.js";

describe("extractClusterId", () => {
  it("should extract clusterId from full URL with https", () => {
    expect(extractClusterId("https://abc123.vault.skyflowapis.com")).toBe(
      "abc123"
    );
  });

  it("should extract clusterId from URL without protocol", () => {
    expect(extractClusterId("abc123.vault.skyflowapis.com")).toBe("abc123");
  });

  it("should extract clusterId from URL with http", () => {
    expect(extractClusterId("http://abc123.vault.skyflowapis.com")).toBe(
      "abc123"
    );
  });

  it("should return null for invalid URL format", () => {
    expect(extractClusterId("https://invalid.com")).toBeNull();
    expect(extractClusterId("invalid")).toBeNull();
    expect(extractClusterId("")).toBeNull();
  });

  it("should handle complex cluster IDs", () => {
    expect(extractClusterId("https://ebfc9bee4242.vault.skyflowapis.com")).toBe(
      "ebfc9bee4242"
    );
  });
});

describe("validateVaultConfig", () => {
  it("should validate complete config", () => {
    const result = validateVaultConfig({
      vaultId: "vault-123",
      vaultUrl: "https://abc123.vault.skyflowapis.com",
    });

    expect(result.isValid).toBe(true);
    expect(result.config).toEqual({
      vaultId: "vault-123",
      vaultUrl: "https://abc123.vault.skyflowapis.com",
      clusterId: "abc123",
      accountId: undefined,
      workspaceId: undefined,
    });
  });

  it("should include optional fields when provided", () => {
    const result = validateVaultConfig({
      vaultId: "vault-123",
      vaultUrl: "https://abc123.vault.skyflowapis.com",
      accountId: "account-456",
      workspaceId: "workspace-789",
    });

    expect(result.isValid).toBe(true);
    expect(result.config?.accountId).toBe("account-456");
    expect(result.config?.workspaceId).toBe("workspace-789");
  });

  it("should fail when vaultId is missing", () => {
    const result = validateVaultConfig({
      vaultUrl: "https://abc123.vault.skyflowapis.com",
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toContain("vaultId is required");
  });

  it("should fail when vaultUrl is missing", () => {
    const result = validateVaultConfig({
      vaultId: "vault-123",
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toContain("vaultUrl is required");
  });

  it("should fail when vaultUrl format is invalid", () => {
    const result = validateVaultConfig({
      vaultId: "vault-123",
      vaultUrl: "https://invalid.com",
    });

    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Invalid vaultUrl format");
  });
});
