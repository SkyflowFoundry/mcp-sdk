import { describe, it, expect } from "vitest";
import {
  SkyflowMCPError,
  ConfigurationError,
  AuthenticationError,
  DeidentifyError,
  ReidentifyError,
} from "../../../src/client/errors.js";

describe("SkyflowMCPError", () => {
  it("should create error with message and code", () => {
    const error = new SkyflowMCPError("Test error", "TEST_CODE");

    expect(error.message).toBe("Test error");
    expect(error.code).toBe("TEST_CODE");
    expect(error.name).toBe("SkyflowMCPError");
    expect(error instanceof Error).toBe(true);
  });

  it("should preserve cause", () => {
    const cause = new Error("Original error");
    const error = new SkyflowMCPError("Wrapped error", "WRAP_CODE", cause);

    expect(error.cause).toBe(cause);
  });
});

describe("ConfigurationError", () => {
  it("should have correct code and name", () => {
    const error = new ConfigurationError("Config invalid");

    expect(error.code).toBe("CONFIGURATION_ERROR");
    expect(error.name).toBe("ConfigurationError");
    expect(error instanceof SkyflowMCPError).toBe(true);
  });
});

describe("AuthenticationError", () => {
  it("should have correct code and name", () => {
    const error = new AuthenticationError("Auth failed");

    expect(error.code).toBe("AUTHENTICATION_ERROR");
    expect(error.name).toBe("AuthenticationError");
    expect(error instanceof SkyflowMCPError).toBe(true);
  });
});

describe("DeidentifyError", () => {
  it("should have correct code and name", () => {
    const error = new DeidentifyError("Deidentify failed");

    expect(error.code).toBe("DEIDENTIFY_ERROR");
    expect(error.name).toBe("DeidentifyError");
    expect(error instanceof SkyflowMCPError).toBe(true);
  });

  it("should include httpCode and details", () => {
    const error = new DeidentifyError("Failed", 401, { reason: "Unauthorized" });

    expect(error.httpCode).toBe(401);
    expect(error.details).toEqual({ reason: "Unauthorized" });
  });
});

describe("ReidentifyError", () => {
  it("should have correct code and name", () => {
    const error = new ReidentifyError("Reidentify failed");

    expect(error.code).toBe("REIDENTIFY_ERROR");
    expect(error.name).toBe("ReidentifyError");
    expect(error instanceof SkyflowMCPError).toBe(true);
  });

  it("should include httpCode and details", () => {
    const error = new ReidentifyError("Failed", 400, { reason: "Bad token" });

    expect(error.httpCode).toBe(400);
    expect(error.details).toEqual({ reason: "Bad token" });
  });
});
