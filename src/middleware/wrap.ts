import type { SkyflowMCP } from "../client/SkyflowMCP.js";
import type { DeidentifyOptions, DeidentifyResult } from "../client/types.js";

/**
 * Options for wrapWithProtection utility
 */
export interface WrapWithProtectionOptions extends DeidentifyOptions {
  /** Whether to reidentify the output (default: true) */
  reidentifyOutput?: boolean;

  /** For object responses, which field to reidentify */
  reidentifyField?: string;

  /** Callback after deidentification */
  onDeidentify?: (result: DeidentifyResult) => void;

  /** Callback after reidentification */
  onReidentify?: (processedText: string) => void;
}

/**
 * Wrap an async operation with deidentify/reidentify
 *
 * This is a standalone function for more control than client.wrap()
 *
 * @param client - SkyflowMCP client instance
 * @param input - The input text containing sensitive information
 * @param operation - Your async operation that processes the protected text
 * @param options - Configuration options
 * @returns Promise resolving to the operation result
 *
 * @example
 * ```typescript
 * import { SkyflowMCP } from '@skyflow/mcp-sdk';
 * import { wrapWithProtection } from '@skyflow/mcp-sdk/middleware';
 *
 * const client = new SkyflowMCP({ ... });
 *
 * // String response - automatically reidentified
 * const result = await wrapWithProtection(
 *   client,
 *   "My email is john@example.com",
 *   async (protectedText) => {
 *     const response = await fetch('/api/echo', {
 *       method: 'POST',
 *       body: JSON.stringify({ text: protectedText }),
 *     });
 *     return response.text();
 *   }
 * );
 *
 * // Object response - reidentify specific field
 * const result = await wrapWithProtection(
 *   client,
 *   "My email is john@example.com",
 *   async (protectedText) => {
 *     const response = await fetch('/api/process', {
 *       method: 'POST',
 *       body: JSON.stringify({ text: protectedText }),
 *     });
 *     return response.json();
 *   },
 *   { reidentifyField: 'output' }
 * );
 * ```
 */
export async function wrapWithProtection<T>(
  client: SkyflowMCP,
  input: string,
  operation: (protectedInput: string) => Promise<T>,
  options: WrapWithProtectionOptions = {}
): Promise<T> {
  const {
    reidentifyOutput = true,
    reidentifyField,
    onDeidentify,
    onReidentify,
    ...deidentifyOptions
  } = options;

  // Deidentify input
  const deidentifyResult = await client.deidentify(input, deidentifyOptions);
  onDeidentify?.(deidentifyResult);

  // Execute operation with protected input
  const result = await operation(deidentifyResult.processedText);

  // Skip reidentification if disabled
  if (!reidentifyOutput) {
    return result;
  }

  // Reidentify string output
  if (typeof result === "string") {
    const { processedText } = await client.reidentify(result);
    onReidentify?.(processedText);
    return processedText as T;
  }

  // Reidentify specific field in object output
  if (reidentifyField && typeof result === "object" && result !== null) {
    const fieldValue = (result as Record<string, unknown>)[reidentifyField];
    if (typeof fieldValue === "string") {
      const { processedText } = await client.reidentify(fieldValue);
      onReidentify?.(processedText);
      return {
        ...result,
        [reidentifyField]: processedText,
      } as T;
    }
  }

  return result;
}

/**
 * Create a reusable wrapper function bound to a client
 *
 * @param client - SkyflowMCP client instance
 * @returns A wrapper function that can be reused
 *
 * @example
 * ```typescript
 * const protectedFetch = createProtectedWrapper(client);
 *
 * const result1 = await protectedFetch(
 *   "My SSN is 123-45-6789",
 *   (text) => fetch('/api/1', { body: text }).then(r => r.text())
 * );
 *
 * const result2 = await protectedFetch(
 *   "My email is john@example.com",
 *   (text) => fetch('/api/2', { body: text }).then(r => r.text())
 * );
 * ```
 */
export function createProtectedWrapper(client: SkyflowMCP) {
  return function protectedWrapper<T>(
    input: string,
    operation: (protectedInput: string) => Promise<T>,
    options?: WrapWithProtectionOptions
  ): Promise<T> {
    return wrapWithProtection(client, input, operation, options);
  };
}
