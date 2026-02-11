# Sandbox Client Node

Official TypeScript/JavaScript SDKs for Sandbox APIs. This monorepo contains production-ready client libraries for interacting with Sandbox's KYC verification services, built with TypeScript for type safety and developer experience.

## 📦 Packages

### Client Libraries

- **[@in-co-sandbox/kyc-api-client](packages/clients/kyc)** - KYC (Know Your Customer) API client
  - Aadhaar verification (OTP-based offline e-KYC)
  - Bank account verification
  - PAN verification
  - MCA (Ministry of Corporate Affairs) company verification
  - Digilocker integration for document verification
  - EntityLocker integration for entity documents
  - Full TypeScript support with Zod validation
  - Auto-generated from OpenAPI specifications

### Core Libraries

- **[@in-co-sandbox/api-client-core](packages/libs/api-client-core)** - Core API client library
  - Base HTTP client with automatic authentication
  - Session management and token refresh
  - Request/response interceptors
  - Error handling with `SandboxException`
  - Builder pattern for client configuration

- **[@in-co-sandbox/api-endpoints](packages/libs/api-endpoints)** - Endpoint resolution utility
  - Automatic environment detection (production/test)
  - API key-based endpoint resolution
  - Zero dependencies

- **[@in-co-sandbox/api-client-generator](packages/libs/api-client-generator)** - OpenAPI code generator
  - Generates TypeScript clients from OpenAPI specs
  - Creates Zod validation schemas
  - Generates test files
  - CLI tool: `openapi-to-client`

## ✨ Quick Start

### Installation

Install the KYC client package:

```bash
npm install @in-co-sandbox/kyc-api-client
```

### Basic Usage

```typescript
import { ApiUserCredentials } from '@in-co-sandbox/api-client-core';
import { AadhaarClient } from '@in-co-sandbox/kyc-api-client/aadhaar';

// Initialize with your API credentials
const credentials = new ApiUserCredentials(
  'your-api-key',
  'your-api-secret'
);

// Create a client
const client = new AadhaarClient(credentials);

// Generate OTP for Aadhaar verification
const otpResponse = await client.generateOTP({
  '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.otp.request',
  aadhaar_number: '123456789012',
  consent: 'y',
  reason: 'KYC verification'
});

// Verify OTP
const verifyResponse = await client.verifyOTP({
  '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.request',
  reference_id: otpResponse.getData().reference_id,
  otp: '123456'
});

console.log('KYC Data:', verifyResponse.getData());
```

## 🏗️ Monorepo Structure

This project uses [Turborepo](https://turbo.build/repo) to manage the monorepo, which handles:
- Building packages in the correct dependency order
- Parallel execution for independent tasks
- Intelligent caching for faster builds
- Shared configuration across packages

```
sandbox-client-node/
├── packages/
│   ├── clients/          # API client implementations
│   │   └── kyc/          # KYC API client
│   └── libs/             # Shared libraries
│       ├── api-client-core/      # Core client functionality
│       ├── api-client-generator/ # OpenAPI code generator
│       └── api-endpoints/        # Endpoint resolution
├── package.json          # Root package configuration
├── turbo.json           # Turborepo configuration
└── tsconfig.json        # TypeScript configuration
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 11.6.2 (the project uses npm as the package manager)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd sandbox-client-node/main
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
   
   This will install dependencies for all packages in the monorepo using npm workspaces.

### Building the Project

Build all packages:

```bash
npm run build
```

### Development Workflow

#### Run tests across all packages:
```bash
npm test
```

#### Lint all packages:
```bash
npm run lint          # Auto-fix issues
npm run lint:check    # Check without fixing
```

#### Format code:
```bash
npm run format        # Format all files
npm run format:check  # Check formatting without fixing
```

#### Clean build artifacts:
```bash
npm run clean
```

### Working with Individual Packages

You can also work with individual packages by navigating to their directory:

```bash
cd packages/kyc
npm test              # Run tests for KYC package only
npm run build         # Build KYC package (and its dependencies)
```

## 📚 Package Details

### [@in-co-sandbox/kyc-api-client](packages/clients/kyc)

Full-featured KYC verification client with support for:
- **Aadhaar Verification**: OTP-based offline e-KYC
- **Bank Verification**: Account ownership validation
- **PAN Verification**: Permanent Account Number validation
- **MCA Verification**: Company details from Ministry of Corporate Affairs
- **Digilocker**: Document retrieval from India's digital locker
- **EntityLocker**: Entity document management

[📖 View Package Documentation](packages/clients/kyc/README.md)

### [@in-co-sandbox/api-client-core](packages/libs/api-client-core)

Core library providing:
- Base `ApiClient` with automatic authentication
- `ApiClientBuilder` for fluent configuration
- Session management with automatic token refresh
- HTTP methods (GET, POST, PATCH, PUT, DELETE)
- Custom request/response interceptors
- Structured error handling

[📖 View Package Documentation](packages/libs/api-client-core/README.md)

### [@in-co-sandbox/api-endpoints](packages/libs/api-endpoints)

Lightweight utility for:
- Automatic environment detection from API keys
- Production/Test endpoint resolution
- Zero runtime dependencies

[📖 View Package Documentation](packages/libs/api-endpoints/README.md)

### [@in-co-sandbox/api-client-generator](packages/libs/api-client-generator)

Code generation tool featuring:
- TypeScript client generation from OpenAPI 3.x specs
- Zod validation schema generation
- Test file generation
- CLI tool: `openapi-to-client`

[📖 View Package Documentation](packages/libs/api-client-generator/README.md)

## 🔧 Technology Stack

- **TypeScript 5.9+** - Full type safety and modern JavaScript features
- **Rollup** - Optimized bundling with tree-shaking
- **ESBuild** - Fast TypeScript compilation
- **Zod** - Runtime type validation
- **Axios** - HTTP client with interceptor support
- **Vitest/Jest** - Modern testing frameworks
- **Turborepo** - Monorepo build orchestration
- **Prettier & ESLint** - Code quality and consistency

## 🔑 Authentication

All API clients require Sandbox API credentials:

```typescript
import { ApiUserCredentials } from '@in-co-sandbox/api-client-core';

const credentials = new ApiUserCredentials(
  'your-api-key',      // Get from Sandbox dashboard
  'your-api-secret'    // Keep this secret!
);
```

### Getting API Credentials

1. Sign up at [Sandbox](https://sandbox.co.in)
2. Navigate to the API dashboard
3. Generate your API key and secret
4. Use test keys (`*_test_*`) for development
5. Use live keys (`*_live_*`) for production

## 🌍 Environments

The SDKs automatically detect the environment from your API key:

- **Test Environment**: `https://test-api.sandbox.co.in` (API keys containing `_test_`)
- **Production Environment**: `https://api.sandbox.co.in` (API keys containing `_live_`)

## 📝 Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run build` | Build all packages using Turborepo |
| `npm run clean` | Remove all build artifacts |
| `npm test` | Run tests across all packages |
| `npm run lint` | Lint and auto-fix all packages |
| `npm run lint:check` | Check linting without fixing |
| `npm run format` | Format all code with Prettier |
| `npm run format:check` | Check code formatting |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Choose the appropriate package** for your changes
2. **Format your code**: `npm run format`
3. **Check linting**: `npm run lint:check`
4. **Run tests**: `npm test`
5. **Verify build**: `npm run build`
6. **Submit a pull request** with a clear description

### Code Quality Standards

- Write TypeScript with strict type checking
- Add tests for new features
- Follow existing code patterns
- Update documentation as needed
- Ensure all CI checks pass

## 🐛 Troubleshooting

### Common Issues

**Authentication Errors**
- Verify your API key and secret are correct
- Check if you're using the right environment (test vs. live)
- Ensure your API key has the required permissions

**Module Not Found**
- Run `npm install` in the root directory
- Ensure all packages are built: `npm run build`
- Check that you're importing from the correct package path

**Build Failures**
- Clean build artifacts: `npm run clean`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Node.js version: `node --version` (should be >= 18.0.0)

## 📄 License

ISC

## 📞 Support & Resources

### Documentation
- **Developer Portal**: [https://developer.sandbox.co.in/](https://developer.sandbox.co.in/)
- **KYC API Reference**: [https://developer.sandbox.co.in/api-reference/kyc/overview](https://developer.sandbox.co.in/api-reference/kyc/overview)
- **Package Documentation**: See individual package README files

### Get Help
- **Email**: [help@sandbox.co.in](mailto:help@sandbox.co.in)
- **Website**: [https://sandbox.co.in](https://sandbox.co.in)
- **Issues**: Submit issues on this repository

### Additional Resources
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zod Documentation](https://zod.dev)