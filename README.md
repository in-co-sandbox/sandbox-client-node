# Sandbox Client Node

The official Node.js libraries for the [Sandbox API](https://sandbox.co.in).

## Packages

| Package | Version | What it does |
|---|---|---|
| [`@in-co-sandbox/api-endpoints`](packages/libs/api-endpoints) | 2.0.0 | The API's base URLs, picked per API key |
| [`@in-co-sandbox/api-client-core`](packages/libs/api-client-core) | 2.0.0 | Authentication, sessions and the HTTP client every Sandbox client builds on |
| [`@in-co-sandbox/kyc-api-client`](packages/clients/kyc) | 1.0.0 | Clients for Aadhaar, bank, PAN, MCA, DigiLocker and EntityLocker |
| [`@in-co-sandbox/api-client-generator`](packages/libs/api-client-generator) | 1.0.0 | Generates clients like the KYC one from an OpenAPI document |

All packages are ESM-only and need Node.js 22 or later.

## Usage

```bash
npm install @in-co-sandbox/api-client-core
```

```ts
import { ApiClient, ApiClientBuilder, ApiUserCredentials } from '@in-co-sandbox/api-client-core';
import { Endpoint } from '@in-co-sandbox/api-endpoints';

const credentials = new ApiUserCredentials(process.env.SANDBOX_API_KEY!, process.env.SANDBOX_API_SECRET!);
const client = new ApiClientBuilder().withCredentials(credentials).build(ApiClient);

// Signs in on the first request, then reuses the access token until it expires.
const response = await client.get(`${Endpoint.get(credentials.getApiKey())}/some/path`);
```

### Which host is called

`Endpoint.get(apiKey)` picks the host: `https://test-api.sandbox.co.in` for `key_test_…` keys, and `https://api.sandbox.co.in` for any other key. Clients sign in at and call that host. The libraries read no environment variables.

### Authentication

Every client signs in at its host with its API key and secret on the first request, caches the access token, and signs in again once it expires. To send a token you already have, such as an end user's, set the `Authorization` header on the call.

`withRequestInterceptors([...])` adds interceptors that run after authentication.

## Development

The repository is a [pnpm](https://pnpm.io) workspace built with [Turborepo](https://turborepo.com). Shared TypeScript, Rollup, Vitest, Oxlint and Oxfmt settings live in `tooling/`.

```bash
pnpm install
pnpm build    # every package
pnpm verify   # package boundaries, formatting, typecheck, lint and tests
pnpm format   # format everything
```

To work on one package, filter by its name:

```bash
pnpm exec turbo run test --filter=@in-co-sandbox/api-client-core
```

The KYC client's tests call the live API. Run them on demand with API keys set:

```bash
pnpm --filter @in-co-sandbox/kyc-api-client test:integration
```

## Releasing

To release a package, bump its `version` and merge to `main`. The **Publish to npm** workflow verifies the workspace and runs `pnpm -r publish` with provenance:

- packages marked `"private": true` (everything in `tooling/`) are never published
- a package whose version is already on npm is skipped, so only bumped packages go out

It needs an `NPM_TOKEN` secret that can publish to the `@in-co-sandbox` scope.

### Internal builds

Sandbox's own services use builds of `api-endpoints` and `api-client-core` pinned to an internal API host, versioned like `2.0.0-dev` and `2.0.0-uat`. They go to the internal registry, by hand, never to npm:

```bash
pnpm install
node scripts/publish-internal.mjs 2.0.0-dev <dev api host> <internal registry>
```

`api-client-core` depends on its exact `api-endpoints` version, so `api-client-core@2.0.0-dev` always calls the dev host. To call two environments from one process, install both under aliases:

```json
"@in-co-sandbox/api-client-core": "2.0.0",
"@in-co-sandbox/api-client-core-dev": "npm:@in-co-sandbox/api-client-core@2.0.0-dev"
```

## License

ISC
