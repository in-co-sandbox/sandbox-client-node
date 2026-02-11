# @in-co-sandbox/api-client-generator

OpenAPI-based TypeScript client SDK generator for Sandbox APIs. This tool automatically generates type-safe API clients, request/response schemas with Zod validation, and test files from OpenAPI 3.x specifications.

## Features

- **Auto-Generated Clients** - Creates typed client classes with methods for each API endpoint
- **Zod Schema Validation** - Generates runtime validation schemas for all requests and responses
- **TypeScript Support** - Full type definitions for request/response objects
- **Test Generation** - Optionally generates test files with examples for each endpoint
- **Mustache Templates** - Customizable code generation using Mustache templating
- **OpenAPI 3.x Compatible** - Works with OpenAPI 3.0 and 3.1 specifications
- **Built-in Error Handling** - Generated clients include proper error handling
- **Tree-Shakeable Exports** - Generates optimized subpath exports for better bundling

## Installation

### As a Dev Dependency

```bash
npm install --save-dev @in-co-sandbox/api-client-generator
```

### Global Installation

```bash
npm install -g @in-co-sandbox/api-client-generator
```

## Usage

### Command Line Interface

The generator is available as a CLI tool via the `openapi-to-client` command.

#### Basic Usage

```bash
openapi-to-client <openapi-spec>
```

#### With Options

```bash
openapi-to-client ./spec/api.openapi.json -o ./src/generated --generate-tests
```

### CLI Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `<openapi-spec>` | - | Path to OpenAPI specification JSON file (required) | - |
| `--output` | `-o` | Output directory for generated code | `./src` |
| `--generate-tests` | - | Generate test files for the clients | `false` |
| `--help` | `-h` | Show help message | - |

### Examples

#### Generate Client Code

```bash
# Basic generation
openapi-to-client ./openapi-spec.json

# Custom output directory
openapi-to-client ./openapi-spec.json -o ./generated

# Generate with tests
openapi-to-client ./openapi-spec.json --generate-tests

# Complete example
openapi-to-client ./specs/kyc-api.openapi.json -o ./src/kyc --generate-tests
```

### Programmatic Usage

You can also use the generator programmatically in your Node.js code:

```typescript
import { Generator, GeneratorConfig } from '@in-co-sandbox/api-client-generator';

const config = new GeneratorConfig({
  inputSpec: './path/to/openapi.json',
  outputDir: './src/generated',
  generateTests: true
});

const generator = new Generator(config);
generator.generate();
```

## Generated Code Structure

The generator creates the following structure:

```
output-dir/
├── {service}/
│   ├── client/
│   │   └── {Service}Client.ts         # Generated client class
│   ├── schemas/
│   │   ├── request/
│   │   │   └── {Operation}Request.ts  # Request schemas with Zod validation
│   │   └── response/
│   │       └── {Operation}Response.ts # Response schemas with Zod validation
│   ├── tests/                         # (if --generate-tests)
│   │   └── {Service}Client.test.ts    # Generated test file
│   └── index.ts                       # Export file
```

### Example Generated Client

```typescript
/**
 * Example Client
 * Auto-generated - DO NOT EDIT
 */
import {
  ApiClient,
  ApiClientBuilder,
  ApiResponse,
  ApiUserCredentials,
  EndpointBuilder,
  SandboxException,
  Entity,
} from '@in-co-sandbox/api-client-core';
import { Endpoint as BaseEndpoint } from '@in-co-sandbox/api-endpoints';
import { ZodError } from 'zod';
import { CreateUserRequestSchema, type CreateUserRequest } from '../schemas/request/CreateUserRequest';

export class ExampleClient {
  private client: ApiClient;
  private credentials: ApiUserCredentials;

  constructor(credentials: ApiUserCredentials) {
    this.credentials = credentials;
    this.client = new ApiClientBuilder().withCredentials(credentials).build(ApiClient);
  }

  /**
   * Create a new user
   *
   * @param request - The request body
   * @returns Promise<ApiResponse>
   * @throws SandboxException if the API call fails or validation fails
   */
  public async createUser(request: CreateUserRequest): Promise<ApiResponse> {
    try {
      // Validate request using Zod schema
      CreateUserRequestSchema.parse(request);

      const endpoint = EndpointBuilder.build(
        BaseEndpoint.get(this.credentials.getApiKey()),
        '/users'
      );

      return await this.client.postForGet(endpoint, new Entity(request));
    } catch (error) {
      if (error instanceof SandboxException) {
        throw error;
      }
      if (error instanceof ZodError) {
        const validationException = new SandboxException(
          `Invalid request body: ${error.message}`,
          400
        );
        validationException.setError({ validationErrors: error.issues });
        throw validationException;
      }
      const unknownException = new SandboxException('Unexpected error occurred', 500);
      unknownException.setError({ error });
      throw unknownException;
    }
  }
}
```

### Example Generated Schema

```typescript
/**
 * CreateUserRequest
 * Auto-generated - DO NOT EDIT
 */
import { z } from 'zod';

export const CreateUserRequestSchema = z.object({
  '@entity': z.literal('com.example.user.request'),
  name: z.string(),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
```

### Example Generated Test

When `--generate-tests` is enabled:

```typescript
import { beforeEach, describe, expect, it } from 'vitest';
import { ApiUserCredentials } from '@in-co-sandbox/api-client-core';
import { ExampleClient } from '../src/client/ExampleClient';
import { CreateUserRequest } from '../src/schemas/request/CreateUserRequest';

describe('ExampleClient', () => {
  const API_KEY = '';
  const API_SECRET = '';

  let client: ExampleClient;

  beforeEach(() => {
    const credentials = new ApiUserCredentials(API_KEY, API_SECRET);
    client = new ExampleClient(credentials);
  });

  describe('createUser', () => {
    it('should create user and return defined result', async () => {
      const request: CreateUserRequest = {
        '@entity': 'com.example.user.request',
        name: 'John Doe',
        email: 'john@example.com',
        age: 30
      };

      const result = await client.createUser(request);

      expect(result).toBeDefined();
    }, 30000);
  });
});
```

## OpenAPI Specification Requirements

The generator expects OpenAPI 3.x specifications with the following structure:

### Required Components

- **paths** - API endpoints
- **components/schemas** - Request/response schemas
- **operationId** - Unique identifier for each operation (used for method names)

### Example OpenAPI Spec

```json
{
  "openapi": "3.0.0",
  "info": {
    "title": "Example API",
    "version": "1.0.0"
  },
  "paths": {
    "/users": {
      "post": {
        "operationId": "createUser",
        "summary": "Create a new user",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "$ref": "#/components/schemas/CreateUserRequest"
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "User created successfully",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateUserResponse"
                }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "CreateUserRequest": {
        "type": "object",
        "required": ["name", "email"],
        "properties": {
          "@entity": {
            "type": "string",
            "const": "com.example.user.request"
          },
          "name": { "type": "string" },
          "email": { "type": "string", "format": "email" },
          "age": { "type": "integer", "minimum": 0 }
        }
      },
      "CreateUserResponse": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "name": { "type": "string" }
        }
      }
    }
  }
}
```

## Integration with Monorepo

This generator is used within the monorepo to generate client code for API packages:

### In package.json

```json
{
  "scripts": {
    "generate": "openapi-to-client ./resources/json/api-spec.openapi.json -o src/generated --generate-tests"
  },
  "devDependencies": {
    "@in-co-sandbox/api-client-generator": "1.0.0"
  }
}
```

### Workflow

1. Update OpenAPI specification file
2. Run `npm run generate`
3. Generated code appears in output directory
4. Build and use the generated client

## Customization

### Templates

The generator uses Mustache templates located in `templates/node-ts/`:

- `client/*.mustache` - Client class templates
- `schema/*.mustache` - Schema templates
- `tests/*.mustache` - Test file templates
- `index.mustache` - Export file template

To customize generation, you can modify these templates or extend the generator.

## Development

### Building the Generator

```bash
npm run build
```

The build process:
1. Cleans previous build artifacts
2. Runs format and lint checks
3. Compiles TypeScript with Rollup
4. Copies templates to dist directory

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

### Runtime Dependencies

- **change-case** - String case conversion utilities
- **json-schema-faker** - Generate fake data from JSON schemas
- **json-schema-to-zod** - Convert JSON schemas to Zod schemas
- **mustache** - Logic-less template engine

### Dev Dependencies

- **openapi-types** - TypeScript types for OpenAPI specifications
- **@types/mustache** - TypeScript types for Mustache

## Generated Code Dependencies

Code generated by this tool requires:

- `@in-co-sandbox/api-client-core` - Core client functionality
- `@in-co-sandbox/api-endpoints` - Endpoint definitions
- `zod` - Runtime validation library

## Related Packages

- [@in-co-sandbox/api-client-core](../api-client-core) - Core API client library
- [@in-co-sandbox/api-endpoints](../api-endpoints) - API endpoint definitions
- [@in-co-sandbox/kyc-api-client](../../clients/kyc) - Example of generated client

## Troubleshooting

### Common Issues

**Error: OpenAPI specification file is required**
- Ensure you provide a valid path to the OpenAPI JSON file

**Error: Cannot read property 'paths' of undefined**
- Verify your OpenAPI specification is valid JSON
- Check that the file contains the required `paths` section

**Generated code has TypeScript errors**
- Ensure you have all required dependencies installed
- Run `npm install` to install peer dependencies
- Check that the OpenAPI schema is valid

### Getting Help

For issues, questions, or feature requests:
- **Email**: [help@sandbox.co.in](mailto:help@sandbox.co.in)
- **Issues**: Submit issues on the repository
- **Documentation**: [https://developer.sandbox.co.in/](https://developer.sandbox.co.in/)

## Documentation & Support

- **Developer Portal**: [https://developer.sandbox.co.in/](https://developer.sandbox.co.in/)
- **API Reference**: [https://developer.sandbox.co.in/api-reference/kyc/overview](https://developer.sandbox.co.in/api-reference/kyc/overview)
- **Website**: [https://sandbox.co.in](https://sandbox.co.in)

## License

ISC
