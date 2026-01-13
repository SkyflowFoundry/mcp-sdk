/**
 * Custom error classes for @skyflow/mcp-sdk
 */

/**
 * Base error class for all SDK errors
 */
export class SkyflowMCPError extends Error {
  public readonly code: string;
  public readonly cause?: Error;

  constructor(message: string, code: string, cause?: Error) {
    super(message);
    this.name = "SkyflowMCPError";
    this.code = code;
    this.cause = cause;

    // Maintains proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when configuration is invalid
 */
export class ConfigurationError extends SkyflowMCPError {
  constructor(message: string, cause?: Error) {
    super(message, "CONFIGURATION_ERROR", cause);
    this.name = "ConfigurationError";
  }
}

/**
 * Error thrown when authentication fails
 */
export class AuthenticationError extends SkyflowMCPError {
  constructor(message: string, cause?: Error) {
    super(message, "AUTHENTICATION_ERROR", cause);
    this.name = "AuthenticationError";
  }
}

/**
 * Error thrown during deidentification operations
 */
export class DeidentifyError extends SkyflowMCPError {
  public readonly httpCode?: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    httpCode?: number,
    details?: unknown,
    cause?: Error
  ) {
    super(message, "DEIDENTIFY_ERROR", cause);
    this.name = "DeidentifyError";
    this.httpCode = httpCode;
    this.details = details;
  }
}

/**
 * Error thrown during reidentification operations
 */
export class ReidentifyError extends SkyflowMCPError {
  public readonly httpCode?: number;
  public readonly details?: unknown;

  constructor(
    message: string,
    httpCode?: number,
    details?: unknown,
    cause?: Error
  ) {
    super(message, "REIDENTIFY_ERROR", cause);
    this.name = "ReidentifyError";
    this.httpCode = httpCode;
    this.details = details;
  }
}
