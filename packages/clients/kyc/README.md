# @in-co-sandbox/kyc-api-client

Official TypeScript/JavaScript SDK for Sandbox KYC (Know Your Customer) APIs. This package provides typed clients for various KYC verification services including Aadhaar, Bank accounts, PAN, MCA, and Digilocker/EntityLocker integrations.

## Features

- **Aadhaar Verification** - Verify Indian citizen identity using Aadhaar (OTP-based offline e-KYC)
- **Bank Account Verification** - Validate bank account details and ownership
- **PAN Verification** - Verify Permanent Account Numbers
- **MCA Verification** - Ministry of Corporate Affairs company verification
- **Digilocker Integration** - Access and verify documents from India's digital locker system
- **EntityLocker Integration** - Entity document verification and storage
- Full TypeScript support with auto-generated type definitions
- Runtime request validation using Zod schemas
- Built-in error handling and authentication management
- Auto-generated from OpenAPI specifications

## Installation

```bash
npm install @in-co-sandbox/kyc-api-client
```

## Prerequisites

- Node.js >= 18.0.0
- Valid Sandbox API credentials (API Key and API Secret)

## Quick Start

### Getting API Credentials

First, create your API credentials:

```typescript
import { ApiUserCredentials } from '@in-co-sandbox/api-client-core';

const credentials = new ApiUserCredentials(
  'your-api-key',
  'your-api-secret'
);
```

## Usage Examples

### Aadhaar Verification

```typescript
import { ApiUserCredentials } from '@in-co-sandbox/api-client-core';
import { AadhaarClient } from '@in-co-sandbox/kyc-api-client/aadhaar';

// Initialize credentials
const credentials = new ApiUserCredentials('your-api-key', 'your-api-secret');

// Create client
const aadhaarClient = new AadhaarClient(credentials);

// Step 1: Generate OTP
const otpRequest = {
  '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.otp.request',
  aadhaar_number: '123456789012',
  consent: 'y',
  reason: 'KYC verification'
};

const otpResponse = await aadhaarClient.generateOTP(otpRequest);
const referenceId = otpResponse.getData().reference_id;

// Step 2: Verify OTP
const verifyRequest = {
  '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.request',
  reference_id: referenceId,
  otp: '123456'
};

const verifyResponse = await aadhaarClient.verifyOTP(verifyRequest);
console.log('KYC Data:', verifyResponse.getData());
```

### Bank Account Verification

```typescript
import { ApiUserCredentials } from '@in-co-sandbox/api-client-core';
import { BankClient } from '@in-co-sandbox/kyc-api-client/bank';

const credentials = new ApiUserCredentials('your-api-key', 'your-api-secret');
const bankClient = new BankClient(credentials);

// Verify bank account
const request = {
  '@entity': 'in.co.sandbox.kyc.bank.request',
  account_number: '1234567890',
  ifsc_code: 'HDFC0001234',
  consent: 'y'
};

const response = await bankClient.verifyAccount(request);
console.log('Verification Result:', response.getData());
```

### PAN Verification

```typescript
import { ApiUserCredentials } from '@in-co-sandbox/api-client-core';
import { PANClient } from '@in-co-sandbox/kyc-api-client/pan';

const credentials = new ApiUserCredentials('your-api-key', 'your-api-secret');
const panClient = new PANClient(credentials);

// Verify PAN number
const request = {
  '@entity': 'in.co.sandbox.kyc.pan.request',
  pan_number: 'ABCDE1234F',
  consent: 'y'
};

const response = await panClient.verifyPAN(request);
console.log('PAN Details:', response.getData());
```

### MCA (Ministry of Corporate Affairs) Verification

```typescript
import { ApiUserCredentials } from '@in-co-sandbox/api-client-core';
import { MCAClient } from '@in-co-sandbox/kyc-api-client/mca';

const credentials = new ApiUserCredentials('your-api-key', 'your-api-secret');
const mcaClient = new MCAClient(credentials);

// Search company by CIN
const request = {
  '@entity': 'in.co.sandbox.kyc.mca.request',
  cin: 'U12345AB1234PLC123456'
};

const response = await mcaClient.searchCompany(request);
console.log('Company Details:', response.getData());
```

### Digilocker Integration

```typescript
import { ApiUserCredentials } from '@in-co-sandbox/api-client-core';
import { DigilockerClient } from '@in-co-sandbox/kyc-api-client/digilocker';

const credentials = new ApiUserCredentials('your-api-key', 'your-api-secret');
const digilockerClient = new DigilockerClient(credentials);

// Fetch documents from Digilocker
const response = await digilockerClient.fetchDocuments({
  '@entity': 'in.co.sandbox.kyc.digilocker.request',
  user_id: 'user-identifier'
});

console.log('Documents:', response.getData());
```

### EntityLocker Integration

```typescript
import { ApiUserCredentials } from '@in-co-sandbox/api-client-core';
import { EntityLockerClient } from '@in-co-sandbox/kyc-api-client/entitylocker';

const credentials = new ApiUserCredentials('your-api-key', 'your-api-secret');
const entityLockerClient = new EntityLockerClient(credentials);

// Access entity documents
const response = await entityLockerClient.getDocuments({
  '@entity': 'in.co.sandbox.kyc.entitylocker.request',
  entity_id: 'entity-identifier'
});

console.log('Entity Documents:', response.getData());
```

## Available Exports

The package provides the following subpath exports for tree-shaking optimization:

| Export Path | Description |
|-------------|-------------|
| `@in-co-sandbox/kyc-api-client/aadhaar` | Aadhaar verification client and schemas |
| `@in-co-sandbox/kyc-api-client/bank` | Bank account verification client and schemas |
| `@in-co-sandbox/kyc-api-client/pan` | PAN verification client and schemas |
| `@in-co-sandbox/kyc-api-client/mca` | MCA verification client and schemas |
| `@in-co-sandbox/kyc-api-client/digilocker` | Digilocker API client and schemas |
| `@in-co-sandbox/kyc-api-client/digilocker-sdk` | Digilocker SDK utilities |
| `@in-co-sandbox/kyc-api-client/entitylocker` | EntityLocker API client and schemas |
| `@in-co-sandbox/kyc-api-client/entitylocker-sdk` | EntityLocker SDK utilities |

## Error Handling

The SDK throws `SandboxException` for API errors:

```typescript
import { SandboxException } from '@in-co-sandbox/api-client-core';

try {
  const response = await aadhaarClient.generateOTP(request);
  console.log('Success:', response.getData());
} catch (error) {
  if (error instanceof SandboxException) {
    console.error('API Error:', error.getMessage());
    console.error('Status Code:', error.getCode());
    console.error('Transaction ID:', error.getTransactionId());
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Response Structure

All client methods return an `ApiResponse` object with the following methods:

```typescript
const response = await client.someMethod(request);

response.getData()          // Get response data
response.getCode()          // Get HTTP status code
response.getMessage()       // Get response message
response.getTransactionId() // Get transaction ID for tracking
response.getTimestamp()     // Get response timestamp
```

## Development

### Running Tests

```bash
npm test
```

Tests use Vitest for fast, modern testing with TypeScript support.

### Building

```bash
npm run build
```

Builds the package using Rollup and outputs to the `dist/` directory.

### Regenerating Client Code

This package uses an OpenAPI specification to auto-generate client code:

```bash
npm run generate
```

This reads the OpenAPI spec from `./resources/json/in-co-sandbox-kyc.openapi.json` and generates:
- Client classes with typed methods
- Zod validation schemas for requests/responses
- TypeScript type definitions
- Test files

### Code Quality

```bash
# Lint and auto-fix
npm run lint

# Check linting without fixing
npm run lint:check

# Format code with Prettier
npm run format

# Check formatting without modifying files
npm run format:check
```

### Clean Build Artifacts

```bash
npm run clean
```

## Dependencies

This package depends on:

- [@in-co-sandbox/api-client-core](../libs/api-client-core) - Core API client functionality, authentication, and base classes
- [@in-co-sandbox/api-endpoints](../libs/api-endpoints) - API endpoint definitions and builders

## API Documentation

For detailed API documentation and guides, visit:
- **Developer Portal**: [https://developer.sandbox.co.in/](https://developer.sandbox.co.in/)
- **KYC API Reference**: [https://developer.sandbox.co.in/api-reference/kyc/overview](https://developer.sandbox.co.in/api-reference/kyc/overview)

## Support

For issues, feature requests, or questions:
- **Email**: [help@sandbox.co.in](mailto:help@sandbox.co.in)
- **Issues**: Submit issues on the repository
- **Website**: [https://sandbox.co.in](https://sandbox.co.in)

## License

ISC
