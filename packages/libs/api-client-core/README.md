# @in-co-sandbox/api-client-core

Core library providing foundational classes and utilities for Sandbox API clients. This package includes authentication management, base HTTP client implementations, error handling, and common utilities used across all Sandbox API client packages.

## Features

- **ApiClient** - Base HTTP client with automatic authentication token management
- **ApiClientBuilder** - Fluent builder pattern for configuring API clients
- **Authentication** - Automatic API key/secret authentication and token refresh
- **Session Management** - API user sessions and resource owner sessions
- **Error Handling** - Structured exception handling with `SandboxException`
- **Response Handling** - Typed `ApiResponse` wrapper for consistent API responses
- **Request Interceptors** - Support for custom request/response interceptors
- **Endpoint Utilities** - URL building with path and query parameter substitution

## Installation

```bash
npm install @in-co-sandbox/api-client-core
```

## Prerequisites

- Node.js >= 18.0.0

## Core Exports

### Client Classes

- `ApiClient` - Base HTTP client for making API requests
- `ApiClientBuilder` - Builder for configuring and creating clients
- `OcrApiClient` - Specialized client for OCR operations

### Authentication

- `ApiUserCredentials` - Container for API key and secret
- `ApiUserCredentialProvider` - Manages credential provisioning
- `Credentials` (interface) - Base credentials interface
- `CredentialProvider` (interface) - Base credential provider interface
- `AuthEndpoint` - Authentication endpoint definitions

### Session Management

- `ApiUserSession` - Session for API user access tokens
- `ResourceOwnerSession` - Session for resource owner tokens
- `Session` - Base session class

### Response/Request Objects

- `ApiResponse` - Wrapper for API responses with helper methods
- `Entity` - Base class for request/response entities

### Error Handling

- `SandboxException` - Custom exception for API errors

### Utilities

- `EndpointBuilder` - Builds URLs with parameter substitution

## Usage

### Basic Client Setup

```typescript
import {
  ApiUserCredentials,
  ApiClientBuilder,
  ApiClient
} from '@in-co-sandbox/api-client-core';

// Create credentials
const credentials = new ApiUserCredentials(
  'your-api-key',
  'your-api-secret'
);

// Build client using fluent API
const client = new ApiClientBuilder()
  .withCredentials(credentials)
  .withTimeout(30)  // Optional: timeout in seconds (default: 30)
  .withLogging(true)  // Optional: enable request/response logging
  .build(ApiClient);
```

### Making API Requests

The `ApiClient` provides methods for all HTTP verbs:

#### POST Request with Response

```typescript
import { Entity, ApiResponse } from '@in-co-sandbox/api-client-core';

const requestBody = new Entity({
  field1: 'value1',
  field2: 'value2'
});

const response: ApiResponse = await client.postForGet(
  'https://api.sandbox.co.in/endpoint',
  requestBody,
  { 'Custom-Header': 'value' },  // Optional additional headers
  { pathParam: 'value' },          // Optional path parameters
  { queryParam: 'value' }          // Optional query parameters
);

// Access response data
const data = response.getData();
const statusCode = response.getCode();
const message = response.getMessage();
```

#### GET Request

```typescript
const response: ApiResponse = await client.get(
  'https://api.sandbox.co.in/endpoint/{id}',
  { 'Custom-Header': 'value' },    // Optional headers
  { id: '123' },                    // Path parameters
  { filter: 'active', limit: '10' } // Query parameters
);
```

#### Other HTTP Methods

```typescript
// POST (no response expected)
await client.post(url, body, headers, pathParams, queryParams);

// PATCH
await client.patch(url, body, headers, pathParams, queryParams);

// PUT
await client.put(url, body, headers, pathParams, queryParams);

// DELETE
await client.delete(url, headers, pathParams, queryParams);

// GET all records
const response = await client.getAll(url, headers, pathParams, queryParams);
```

### Working with Credentials

```typescript
import { ApiUserCredentials } from '@in-co-sandbox/api-client-core';

const credentials = new ApiUserCredentials('api-key', 'api-secret');

// Access credential values
const apiKey = credentials.getApiKey();
const apiSecret = credentials.getApiSecret();
const username = credentials.getUsername();  // Returns apiKey
const password = credentials.getPassword();  // Returns apiSecret
```

### Authentication and Sessions

The SDK automatically handles authentication:

1. **Initial Authentication**: On first request, authenticates using API key/secret
2. **Token Management**: Stores access token in session
3. **Auto-Refresh**: Checks token expiry and refreshes before each request
4. **Authorization Header**: Automatically adds token to request headers

```typescript
import { ApiUserSession } from '@in-co-sandbox/api-client-core';

// Sessions are managed internally, but you can work with them:
const session = new ApiUserSession('api-key')
  .withAccessToken('your-access-token');

const token = session.getAccessToken();
```

### Custom Request Interceptors

Add custom logic to requests:

```typescript
import { ApiClientBuilder } from '@in-co-sandbox/api-client-core';
import { InternalAxiosRequestConfig } from 'axios';

const requestInterceptor = async (
  config: InternalAxiosRequestConfig
): Promise<InternalAxiosRequestConfig> => {
  // Add custom headers, modify config, etc.
  config.headers['X-Custom-Header'] = 'custom-value';
  console.log('Request:', config.url);
  return config;
};

const client = new ApiClientBuilder()
  .withCredentials(credentials)
  .withRequestInterceptors([requestInterceptor])
  .build(ApiClient);
```

### Error Handling

```typescript
import { SandboxException } from '@in-co-sandbox/api-client-core';

try {
  const response = await client.get('/some/endpoint');
  console.log('Success:', response.getData());
} catch (error) {
  if (error instanceof SandboxException) {
    // Handle Sandbox API errors
    console.error('Error Message:', error.getMessage());
    console.error('Status Code:', error.getCode());
    console.error('Transaction ID:', error.getTransactionId());
    console.error('Timestamp:', error.getTimestamp());
    console.error('Additional Error:', error.getError());
  } else {
    // Handle other errors
    console.error('Unexpected error:', error);
  }
}
```

### Working with API Responses

```typescript
import { ApiResponse } from '@in-co-sandbox/api-client-core';

const response: ApiResponse = await client.get('/endpoint');

// Extract data
const data = response.getData();             // Response payload
const code = response.getCode();             // HTTP status code
const message = response.getMessage();       // Response message
const transactionId = response.getTransactionId(); // Transaction ID
const timestamp = response.getTimestamp();   // Response timestamp
```

### Endpoint Building

```typescript
import { EndpointBuilder } from '@in-co-sandbox/api-client-core';

// Build URL with path and query parameters
const url = EndpointBuilder.build(
  'https://api.sandbox.co.in/users/{userId}/posts/{postId}',
  { userId: '123', postId: '456' },           // Path parameters
  { include: 'comments', limit: '10' }        // Query parameters
);

// Result: https://api.sandbox.co.in/users/123/posts/456?include=comments&limit=10
```

### Configuration Options

The `ApiClientBuilder` supports the following configuration:

```typescript
const client = new ApiClientBuilder()
  .withCredentials(credentials)        // Required: API credentials
  .withTimeout(60)                     // Optional: timeout in seconds (max 30)
  .withLogging(true)                   // Optional: enable debug logging
  .withRequestInterceptors([...])      // Optional: custom interceptors
  .build(ApiClient);                   // Build and return client instance
```

## Advanced Usage

### Creating Custom Clients

Extend `ApiClient` for custom functionality:

```typescript
import { ApiClient, ApiUserCredentials } from '@in-co-sandbox/api-client-core';

class CustomClient extends ApiClient {
  constructor(
    credentials: ApiUserCredentials,
    timeout: number,
    enableDebugging: boolean,
    requestInterceptors: any[]
  ) {
    super(credentials, timeout, enableDebugging, requestInterceptors);
  }

  async customMethod(data: any) {
    return this.postForGet('/custom/endpoint', new Entity(data));
  }
}

// Use with builder
const client = new ApiClientBuilder()
  .withCredentials(credentials)
  .build(CustomClient);
```

### Working with Entities

```typescript
import { Entity } from '@in-co-sandbox/api-client-core';

// Create entity from object
const entity = new Entity({
  name: 'John Doe',
  email: 'john@example.com'
});

// Get underlying data
const data = entity.getData();

// Use in requests
await client.postForGet('/endpoint', entity);
```

## API Reference

### ApiClient

Main HTTP client with authentication handling.

**Methods:**
- `postForGet(url, body, headers?, pathParams?, queryParams?)` - POST with response
- `post(url, body, headers?, pathParams?, queryParams?)` - POST without response
- `get(url, headers?, pathParams?, queryParams?)` - GET request
- `getAll(url, headers?, pathParams?, queryParams?)` - GET all records
- `patch(url, body, headers?, pathParams?, queryParams?)` - PATCH request
- `put(url, body, headers?, pathParams?, queryParams?)` - PUT request
- `delete(url, headers?, pathParams?, queryParams?)` - DELETE request

### ApiClientBuilder

Fluent builder for creating configured API clients.

**Methods:**
- `withCredentials(credentials)` - Set API credentials (required)
- `withTimeout(seconds)` - Set request timeout
- `withLogging(enabled)` - Enable/disable debug logging
- `withRequestInterceptors(interceptors)` - Add custom interceptors
- `build(classType)` - Build and return client instance

### ApiUserCredentials

Container for API authentication credentials.

**Methods:**
- `getApiKey()` - Get API key
- `getApiSecret()` - Get API secret
- `getUsername()` - Get username (returns API key)
- `getPassword()` - Get password (returns API secret)

### ApiResponse

Wrapper for API responses.

**Methods:**
- `getData()` - Get response data
- `getCode()` - Get HTTP status code
- `getMessage()` - Get response message
- `getTransactionId()` - Get transaction ID
- `getTimestamp()` - Get response timestamp

### SandboxException

Custom exception for API errors.

**Methods:**
- `getMessage()` - Get error message
- `getCode()` - Get error code
- `getTransactionId()` - Get transaction ID
- `getTimestamp()` - Get error timestamp
- `getError()` - Get additional error details
- `setError(error)` - Set additional error details

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

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

## Dependencies

This package depends on:

- **axios** - HTTP client
- **class-transformer** - Object transformation utilities
- **form-data** - Multipart form data support
- **jwt-decode** - JWT token decoding
- [@in-co-sandbox/api-endpoints](../api-endpoints) - Endpoint definitions

## Related Packages

- [@in-co-sandbox/kyc-api-client](../../clients/kyc) - KYC API client built on this core
- [@in-co-sandbox/api-endpoints](../api-endpoints) - API endpoint definitions
- [@in-co-sandbox/api-client-generator](../api-client-generator) - OpenAPI code generator

## Documentation & Support

### Documentation
- **Developer Portal**: [https://developer.sandbox.co.in/](https://developer.sandbox.co.in/)
- **API Reference**: [https://developer.sandbox.co.in/api-reference/kyc/overview](https://developer.sandbox.co.in/api-reference/kyc/overview)

### Get Help
- **Email**: [help@sandbox.co.in](mailto:help@sandbox.co.in)
- **Website**: [https://sandbox.co.in](https://sandbox.co.in)

## License

ISC
