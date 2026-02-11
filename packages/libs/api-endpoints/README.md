# @in-co-sandbox/api-endpoints

Lightweight utility package for Sandbox API endpoint resolution. This package provides environment-aware endpoint management, automatically selecting the correct API base URL (production or test) based on the API key format.

## Features

- **Automatic Environment Detection** - Determines environment from API key format
- **Multi-Environment Support** - Supports both production and test environments
- **Type-Safe** - Full TypeScript support
- **Zero Dependencies** - Lightweight package with no external dependencies
- **Simple API** - Single static method for endpoint resolution

## Installation

```bash
npm install @in-co-sandbox/api-endpoints
```

## Usage

### Basic Usage

```typescript
import { Endpoint } from '@in-co-sandbox/api-endpoints';

// Get the appropriate base URL for an API key
const baseUrl = Endpoint.get('your-api-key');

console.log(baseUrl);
// For test environment: https://test-api.sandbox.co.in
// For production: https://api.sandbox.co.in
```

### Environment Detection

The `Endpoint` class automatically detects the environment based on the API key format:

```typescript
import { Endpoint } from '@in-co-sandbox/api-endpoints';

// Test environment API key (contains '_test')
const testKey = 'abc_test_xyz123';
const testUrl = Endpoint.get(testKey);
// Returns: https://test-api.sandbox.co.in

// Production environment API key (contains '_live')
const liveKey = 'abc_live_xyz123';
const liveUrl = Endpoint.get(liveKey);
// Returns: https://api.sandbox.co.in

// Default (fallback to production)
const genericKey = 'abc_xyz123';
const defaultUrl = Endpoint.get(genericKey);
// Returns: https://api.sandbox.co.in
```

### Integration with API Clients

This package is commonly used with `@in-co-sandbox/api-client-core`:

```typescript
import { Endpoint } from '@in-co-sandbox/api-endpoints';
import { EndpointBuilder } from '@in-co-sandbox/api-client-core';

const apiKey = 'your-api-key';
const baseUrl = Endpoint.get(apiKey);

// Build full endpoint URL
const fullUrl = EndpointBuilder.build(
  baseUrl,
  '/kyc/aadhaar/verify'
);

console.log(fullUrl);
// https://api.sandbox.co.in/kyc/aadhaar/verify
```

### Usage in Generated Clients

Generated client code automatically uses this package:

```typescript
import { Endpoint as BaseEndpoint } from '@in-co-sandbox/api-endpoints';
import { EndpointBuilder } from '@in-co-sandbox/api-client-core';

// Inside a generated client
const endpoint = EndpointBuilder.build(
  BaseEndpoint.get(this.credentials.getApiKey()),
  '/some/api/path'
);
```

## API Reference

### Endpoint

Static class for endpoint resolution.

#### Methods

##### `Endpoint.get(apiKey: string): string`

Determines the appropriate API base URL based on the API key.

**Parameters:**
- `apiKey` (string) - The API key to analyze

**Returns:**
- (string) - The base URL for the environment

**Logic:**
- If API key contains `_test`, returns test environment URL
- If API key contains `_live`, returns production environment URL
- Otherwise, defaults to production environment URL

**Supported Environments:**

| Environment | URL | API Key Format |
|-------------|-----|----------------|
| Production | `https://api.sandbox.co.in` | `*_live_*` or default |
| Test/UAT | `https://test-api.sandbox.co.in` | `*_test_*` |

## Environment URLs

### Production (Live)

- **Base URL**: `https://api.sandbox.co.in`
- **Usage**: Production workloads and real transactions
- **API Key Format**: Contains `_live_` segment

### Test/UAT

- **Base URL**: `https://test-api.sandbox.co.in`
- **Usage**: Development, testing, and UAT
- **API Key Format**: Contains `_test_` segment

## Examples

### Example 1: Simple Endpoint Resolution

```typescript
import { Endpoint } from '@in-co-sandbox/api-endpoints';

const apiKey = process.env.SANDBOX_API_KEY;
const baseUrl = Endpoint.get(apiKey);

console.log(`Using API at: ${baseUrl}`);
```

### Example 2: Building Complete URLs

```typescript
import { Endpoint } from '@in-co-sandbox/api-endpoints';

const apiKey = 'sandbox_test_abc123';
const baseUrl = Endpoint.get(apiKey);

// Manually construct URL
const verifyUrl = `${baseUrl}/kyc/pan/verify`;
console.log(verifyUrl);
// Output: https://test-api.sandbox.co.in/kyc/pan/verify
```

### Example 3: Environment-Specific Configuration

```typescript
import { Endpoint } from '@in-co-sandbox/api-endpoints';

function getApiConfig(apiKey: string) {
  const baseUrl = Endpoint.get(apiKey);
  const isProduction = baseUrl.includes('api.sandbox.co.in') &&
                       !baseUrl.includes('test');

  return {
    baseUrl,
    environment: isProduction ? 'production' : 'test',
    timeout: isProduction ? 30000 : 60000,
    retries: isProduction ? 3 : 1
  };
}

const config = getApiConfig('sandbox_test_xyz');
console.log(config);
// {
//   baseUrl: 'https://test-api.sandbox.co.in',
//   environment: 'test',
//   timeout: 60000,
//   retries: 1
// }
```

## TypeScript Support

This package is written in TypeScript and includes full type definitions:

```typescript
import { Endpoint } from '@in-co-sandbox/api-endpoints';

// Type inference works automatically
const url: string = Endpoint.get('my-api-key');

// TypeScript will ensure correct usage
// Endpoint.get(); // Error: Expected 1 argument
```

## Development

### Building

```bash
npm run build
```

Builds the package using Rollup and outputs to the `dist/` directory.

### Code Quality

```bash
# Lint and auto-fix
npm run lint

# Check linting
npm run lint:check

# Format code
npm run format

# Check formatting
npm run format:check
```

### Clean Build Artifacts

```bash
npm run clean
```

## Package Details

- **Type**: ES Module
- **Main Entry**: `dist/index.js`
- **Types**: `dist/src/index.d.ts`
- **License**: ISC
- **Node Version**: >= 18.0.0

## Dependencies

This package has **zero runtime dependencies**, making it extremely lightweight and suitable for any JavaScript/TypeScript project.

## Related Packages

- [@in-co-sandbox/api-client-core](../api-client-core) - Core API client library (uses this package)
- [@in-co-sandbox/kyc-api-client](../../clients/kyc) - KYC API client (uses this package)
- [@in-co-sandbox/api-client-generator](../api-client-generator) - Code generator (generates code using this package)

## Use Cases

### 1. Client Libraries

Used by API clients to automatically determine the correct base URL:

```typescript
import { Endpoint } from '@in-co-sandbox/api-endpoints';
import { ApiClient, ApiUserCredentials } from '@in-co-sandbox/api-client-core';

class MyClient {
  private baseUrl: string;

  constructor(apiKey: string) {
    this.baseUrl = Endpoint.get(apiKey);
  }
}
```

### 2. Manual HTTP Requests

For direct API calls without using client SDKs:

```typescript
import { Endpoint } from '@in-co-sandbox/api-endpoints';
import axios from 'axios';

const apiKey = process.env.API_KEY;
const baseUrl = Endpoint.get(apiKey);

const response = await axios.post(`${baseUrl}/kyc/pan/verify`, {
  pan_number: 'ABCDE1234F'
});
```

### 3. Configuration Management

For setting up environment-specific configurations:

```typescript
import { Endpoint } from '@in-co-sandbox/api-endpoints';

const config = {
  apiBaseUrl: Endpoint.get(process.env.SANDBOX_API_KEY),
  timeout: 30000,
  retryAttempts: 3
};
```

## Documentation & Support

### Documentation
- **Developer Portal**: [https://developer.sandbox.co.in/](https://developer.sandbox.co.in/)
- **API Reference**: [https://developer.sandbox.co.in/api-reference/kyc/overview](https://developer.sandbox.co.in/api-reference/kyc/overview)

### Get Help
- **Email**: [help@sandbox.co.in](mailto:help@sandbox.co.in)
- **Issues**: Submit issues on the repository
- **Website**: [https://sandbox.co.in](https://sandbox.co.in)

## License

ISC
