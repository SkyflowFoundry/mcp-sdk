# @skyflow/mcp-sdk

Simple PII/PHI deidentification for MCP (Model Context Protocol) applications.

This SDK wraps the [Skyflow](https://www.skyflow.com/) deidentification APIs to provide an easy-to-use interface for protecting sensitive data in AI/LLM applications.

## Installation

```bash
npm install @skyflow/mcp-sdk
# or
pnpm add @skyflow/mcp-sdk
```

## Quick Start

```typescript
import { SkyflowMCP } from '@skyflow/mcp-sdk';

// Initialize the client
const client = new SkyflowMCP({
  vaultId: 'your-vault-id',
  vaultUrl: 'https://abc123.vault.skyflowapis.com',
  credentials: { token: 'your-bearer-token' },
});

// Deidentify sensitive data
const { processedText } = await client.deidentify("My email is john@example.com");
// processedText: "My email is [EMAIL_ADDRESS_abc123]"

// Restore original data
const { processedText: restored } = await client.reidentify(processedText);
// restored: "My email is john@example.com"
```

## Common Use Cases

### Wrap API Calls

Protect sensitive data before sending to external APIs:

```typescript
const result = await client.wrap(
  "My SSN is 123-45-6789",
  async (protectedText) => {
    const response = await fetch('https://api.example.com/process', {
      method: 'POST',
      body: JSON.stringify({ text: protectedText }),
    });
    return response.json().then(r => r.output);
  }
);
// Result is automatically reidentified with original SSN
```

### Database Operations

Store protected data, retrieve with original values:

```typescript
// Before saving to database
const { processedText: protectedEmail } = await client.deidentify(userEmail);
await db.users.create({ email: protectedEmail });

// When retrieving from database
const user = await db.users.findById(userId);
const { processedText: originalEmail } = await client.reidentify(user.email);
```

## MCP Server Integration

Add pre-built Skyflow tools to your MCP server:

```typescript
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSkyflowTools } from '@skyflow/mcp-sdk/mcp';

const server = new McpServer({ name: 'my-server', version: '1.0.0' });

await registerSkyflowTools(server, {
  vaultId: 'vault-id',
  vaultUrl: 'https://abc123.vault.skyflowapis.com',
  credentials: { token: 'bearer-token' },
});

// Server now has 'deidentify' and 'reidentify' tools available
```

## Configuration

### Required Parameters

| Parameter | Description |
|-----------|-------------|
| `vaultId` | Your Skyflow vault identifier |
| `vaultUrl` | Vault URL (e.g., `https://abc123.vault.skyflowapis.com`) |
| `credentials` | Either `{ token: 'bearer-token' }` or `{ apiKey: 'api-key' }` |

### Optional Parameters

| Parameter | Description |
|-----------|-------------|
| `accountId` | Skyflow account ID |
| `workspaceId` | Skyflow workspace ID |
| `options.defaultTokenType` | Default token format: `'VAULT_TOKEN'`, `'ENTITY_UNIQUE_COUNTER'`, or `'ENTITY_ONLY'` |
| `options.defaultEntities` | Default entity types to detect (e.g., `['email_address', 'ssn']`) |

### Environment Variables

Use `createFromEnv()` to configure from environment:

```typescript
import { createFromEnv } from '@skyflow/mcp-sdk';

// Reads from:
// - SKYFLOW_VAULT_ID
// - SKYFLOW_VAULT_URL
// - SKYFLOW_BEARER_TOKEN or SKYFLOW_API_KEY
// - SKYFLOW_ACCOUNT_ID (optional)
// - SKYFLOW_WORKSPACE_ID (optional)

const client = createFromEnv();
```

## API Reference

### `SkyflowMCP`

Main client class.

#### `deidentify(text, options?)`

Replace sensitive data with vault tokens.

```typescript
const result = await client.deidentify("Contact me at john@example.com", {
  tokenType: 'VAULT_TOKEN',  // optional
  entities: ['email_address', 'phone_number'],  // optional
});

// Result:
// {
//   processedText: "Contact me at [EMAIL_ADDRESS_abc123]",
//   entities: [...],
//   wordCount: 4,
//   charCount: 35
// }
```

#### `reidentify(text)`

Restore vault tokens to original values.

```typescript
const result = await client.reidentify("Contact me at [EMAIL_ADDRESS_abc123]");
// Result: { processedText: "Contact me at john@example.com" }
```

#### `wrap(input, operation, options?)`

Convenience method for deidentify → operation → reidentify pattern.

```typescript
const result = await client.wrap(
  inputText,
  async (protectedText) => callExternalAPI(protectedText),
  { reidentifyOutput: true }  // default
);
```

### Error Handling

```typescript
import { DeidentifyError, ReidentifyError, ConfigurationError } from '@skyflow/mcp-sdk';

try {
  await client.deidentify(text);
} catch (error) {
  if (error instanceof DeidentifyError) {
    console.error('Deidentify failed:', error.message);
    console.error('HTTP code:', error.httpCode);
    console.error('Details:', error.details);
  }
}
```

## Supported Entity Types

The SDK supports 67 entity types including:

- Personal: `name`, `email_address`, `phone_number`, `ssn`, `dob`
- Financial: `credit_card`, `bank_account`, `cvv`, `routing_number`
- Medical: `medical_code`, `drug`, `condition`, `blood_type`
- Location: `location`, `location_address`, `location_city`, `location_country`
- Identity: `driver_license`, `passport_number`, `healthcare_number`

See `ENTITY_TYPES` export for the full list.

## Requirements

- Node.js >= 18.0.0
- Skyflow vault with deidentification enabled

## License

MIT
