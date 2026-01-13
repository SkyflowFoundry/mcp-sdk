import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { SkyflowMCP, createFromEnv } from "../../../src/client/SkyflowMCP.js";
import { ConfigurationError } from "../../../src/client/errors.js";

// Mock skyflow-node
vi.mock("skyflow-node", () => {
  const mockDeidentifyText = vi.fn().mockResolvedValue({
    processedText: "My email is [EMAIL_ADDRESS_abc123]",
    entities: [{ token: "EMAIL_ADDRESS_abc123", entity: "email_address" }],
    wordCount: 4,
    charCount: 35,
  });

  const mockReidentifyText = vi.fn().mockResolvedValue({
    processedText: "My email is john@example.com",
  });

  const mockDetect = vi.fn().mockReturnValue({
    deidentifyText: mockDeidentifyText,
    reidentifyText: mockReidentifyText,
  });

  // Use a proper class for Skyflow mock
  class MockSkyflow {
    detect = mockDetect;
  }

  // Use proper classes for Options and Request mocks
  class MockTokenFormat {
    setDefault = vi.fn();
  }

  class MockDeidentifyTextOptions {
    setTokenFormat = vi.fn();
    setEntities = vi.fn();
  }

  class MockDeidentifyTextRequest {
    text: string;
    constructor(text: string) {
      this.text = text;
    }
  }

  class MockReidentifyTextRequest {
    text: string;
    constructor(text: string) {
      this.text = text;
    }
  }

  class MockSkyflowError extends Error {
    error?: { http_code?: number; details?: unknown };
  }

  return {
    Skyflow: MockSkyflow,
    TokenFormat: MockTokenFormat,
    TokenType: {
      VAULT_TOKEN: "VAULT_TOKEN",
      ENTITY_UNIQUE_COUNTER: "ENTITY_UNIQUE_COUNTER",
      ENTITY_ONLY: "ENTITY_ONLY",
    },
    DeidentifyTextOptions: MockDeidentifyTextOptions,
    DeidentifyTextRequest: MockDeidentifyTextRequest,
    ReidentifyTextRequest: MockReidentifyTextRequest,
    SkyflowError: MockSkyflowError,
    DetectEntities: {
      EMAIL_ADDRESS: "EMAIL_ADDRESS",
      SSN: "SSN",
      CREDIT_CARD: "CREDIT_CARD",
    },
  };
});

describe("SkyflowMCP", () => {
  const validConfig = {
    vaultId: "vault-123",
    vaultUrl: "https://abc123.vault.skyflowapis.com",
    credentials: { token: "test-bearer-token" },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create instance with valid config", () => {
      const client = new SkyflowMCP(validConfig);
      expect(client).toBeInstanceOf(SkyflowMCP);
    });

    it("should accept API key credentials", () => {
      const client = new SkyflowMCP({
        ...validConfig,
        credentials: { apiKey: "test-api-key" },
      });
      expect(client).toBeInstanceOf(SkyflowMCP);
    });

    it("should throw ConfigurationError for missing vaultId", () => {
      expect(
        () =>
          new SkyflowMCP({
            ...validConfig,
            vaultId: "",
          })
      ).toThrow(ConfigurationError);
    });

    it("should throw ConfigurationError for missing vaultUrl", () => {
      expect(
        () =>
          new SkyflowMCP({
            ...validConfig,
            vaultUrl: "",
          })
      ).toThrow(ConfigurationError);
    });

    it("should throw ConfigurationError for invalid vaultUrl format", () => {
      expect(
        () =>
          new SkyflowMCP({
            ...validConfig,
            vaultUrl: "https://invalid.com",
          })
      ).toThrow(ConfigurationError);
    });
  });

  describe("deidentify", () => {
    it("should deidentify text with default options", async () => {
      const client = new SkyflowMCP(validConfig);
      const result = await client.deidentify("My email is john@example.com");

      expect(result.processedText).toBe("My email is [EMAIL_ADDRESS_abc123]");
      expect(result.entities).toHaveLength(1);
      expect(result.wordCount).toBe(4);
      expect(result.charCount).toBe(35);
    });

    it("should deidentify text with custom token type", async () => {
      const client = new SkyflowMCP(validConfig);
      const result = await client.deidentify("My email is john@example.com", {
        tokenType: "ENTITY_ONLY",
      });

      expect(result.processedText).toBeDefined();
    });

    it("should deidentify text with specific entities", async () => {
      const client = new SkyflowMCP(validConfig);
      const result = await client.deidentify("My email is john@example.com", {
        entities: ["email_address"],
      });

      expect(result.processedText).toBeDefined();
    });
  });

  describe("reidentify", () => {
    it("should reidentify text", async () => {
      const client = new SkyflowMCP(validConfig);
      const result = await client.reidentify(
        "My email is [EMAIL_ADDRESS_abc123]"
      );

      expect(result.processedText).toBe("My email is john@example.com");
    });
  });

  describe("wrap", () => {
    it("should wrap operation with deidentify/reidentify", async () => {
      const client = new SkyflowMCP(validConfig);

      const result = await client.wrap(
        "My email is john@example.com",
        async (protectedText) => {
          // Verify input is deidentified
          expect(protectedText).toBe("My email is [EMAIL_ADDRESS_abc123]");
          return protectedText; // Echo back for reidentification
        }
      );

      expect(result).toBe("My email is john@example.com");
    });

    it("should skip reidentification when disabled", async () => {
      const client = new SkyflowMCP(validConfig);

      const result = await client.wrap(
        "My email is john@example.com",
        async (protectedText) => protectedText,
        { reidentifyOutput: false }
      );

      expect(result).toBe("My email is [EMAIL_ADDRESS_abc123]");
    });

    it("should handle non-string results", async () => {
      const client = new SkyflowMCP(validConfig);

      const result = await client.wrap(
        "My email is john@example.com",
        async () => ({ success: true })
      );

      expect(result).toEqual({ success: true });
    });
  });

  describe("getSkyflowInstance", () => {
    it("should return the Skyflow instance", () => {
      const client = new SkyflowMCP(validConfig);
      const instance = client.getSkyflowInstance();
      expect(instance).toBeDefined();
    });
  });

  describe("getVaultId", () => {
    it("should return the vault ID", () => {
      const client = new SkyflowMCP(validConfig);
      expect(client.getVaultId()).toBe("vault-123");
    });
  });
});

describe("createFromEnv", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it("should create client from environment variables", () => {
    process.env.SKYFLOW_VAULT_ID = "env-vault-id";
    process.env.SKYFLOW_VAULT_URL = "https://envcluster.vault.skyflowapis.com";
    process.env.SKYFLOW_API_KEY = "env-api-key";

    const client = createFromEnv();
    expect(client).toBeInstanceOf(SkyflowMCP);
    expect(client.getVaultId()).toBe("env-vault-id");
  });

  it("should prefer bearer token over API key", () => {
    process.env.SKYFLOW_VAULT_ID = "env-vault-id";
    process.env.SKYFLOW_VAULT_URL = "https://envcluster.vault.skyflowapis.com";
    process.env.SKYFLOW_API_KEY = "env-api-key";
    process.env.SKYFLOW_BEARER_TOKEN = "env-bearer-token";

    const client = createFromEnv();
    expect(client).toBeInstanceOf(SkyflowMCP);
  });

  it("should throw for missing SKYFLOW_VAULT_ID", () => {
    process.env.SKYFLOW_VAULT_URL = "https://envcluster.vault.skyflowapis.com";
    process.env.SKYFLOW_API_KEY = "env-api-key";

    expect(() => createFromEnv()).toThrow(ConfigurationError);
  });

  it("should throw for missing SKYFLOW_VAULT_URL", () => {
    process.env.SKYFLOW_VAULT_ID = "env-vault-id";
    process.env.SKYFLOW_API_KEY = "env-api-key";

    expect(() => createFromEnv()).toThrow(ConfigurationError);
  });

  it("should throw for missing credentials", () => {
    process.env.SKYFLOW_VAULT_ID = "env-vault-id";
    process.env.SKYFLOW_VAULT_URL = "https://envcluster.vault.skyflowapis.com";

    expect(() => createFromEnv()).toThrow(ConfigurationError);
  });

  it("should allow overrides", () => {
    process.env.SKYFLOW_VAULT_ID = "env-vault-id";
    process.env.SKYFLOW_VAULT_URL = "https://envcluster.vault.skyflowapis.com";
    process.env.SKYFLOW_API_KEY = "env-api-key";

    const client = createFromEnv({
      vaultId: "override-vault-id",
    });

    expect(client.getVaultId()).toBe("override-vault-id");
  });
});
