# Sandbox Client Node

The official repository of SDKs to communicate with Sandbox APIs. This is a monorepo containing multiple TypeScript packages for interacting with various Sandbox services including KYC, OCR, and other API clients.

## 📦 Packages

This monorepo contains the following packages:

- **`@in.co.sandbox/api-client-core`** - Core functionality for API clients including authentication, session management, and base client implementations
- **`@in.co.sandbox/api-endpoints`** - Endpoint definitions and builders
- **`@in.co.sandbox/kyc-api-client`** - KYC (Know Your Customer) SDK with support for:
  - Aadhaar verification
  - Bank account verification
  - PAN verification
  - MCA (Ministry of Corporate Affairs) verification
  - Digilocker and EntityLocker integrations

## 🏗️ Monorepo Structure

This project uses [Turborepo](https://turbo.build/repo) to manage the monorepo, which handles building packages in the correct order and caches builds for faster execution.

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

### API Client Core

Provides authentication, base client implementations, and error handling.

### KYC API Client

Provides clients for various KYC services including Aadhaar, Bank, PAN, MCA verification, and Digilocker/EntityLocker integrations.

## 🔧 Configuration

Each package uses TypeScript 5.9+ with Rollup for bundling and ESBuild for compilation.

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

1. Make your changes in the appropriate package
2. Run `npm run format` to format your code
3. Run `npm run lint:check` to check for linting issues
4. Run `npm test` to ensure all tests pass
5. Run `npm run build` to verify the build succeeds

## 📄 License

ISC

## 🔗 Links

- [Homepage](https://sandbox.co.in)
- [Turborepo Documentation](https://turbo.build/repo/docs)