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

const credentials = new ApiUserCredentials(process.env.SANDBOX_API_KEY!, process.env.SANDBOX_API_SECRET!);
const client = new ApiClientBuilder().withCredentials(credentials).build(ApiClient);

// Signs in on the first request, then reuses the access token until it expires.
const response = await client.get(`${client.getBaseUrl()}/some/path`);
```

### Which host is called

Each client picks its host when it's built, and signs in at and calls that host:

1. `withHost(host)` on the builder, when given.
2. Otherwise `SANDBOX_API_HOST`, when that environment variable is set.
3. Otherwise `https://test-api.sandbox.co.in` for `key_test_…` keys, and `https://api.sandbox.co.in` for any other key.

`client.getBaseUrl()` returns it; build request URLs from it. To call two environments from one process, build one client per environment:

```ts
import { Endpoint } from '@in-co-sandbox/api-endpoints';

const uat = new ApiClientBuilder().withCredentials(uatKeys).build(ApiClient); // follows SANDBOX_API_HOST
const prod = new ApiClientBuilder().withCredentials(prodKeys).withHost(Endpoint.live()).build(ApiClient);
```

### Authentication

`ApiClient` authenticates every request with an `AuthRequestInterceptor` built from its credentials. To change that:

```ts
new ApiClientBuilder().withCredentials(credentials).withAuth(myInterceptor).build(ApiClient); // your own
new ApiClientBuilder().withCredentials(credentials).withAuth(false).build(ApiClient); // none
```

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

Bump a library's `version` and merge to `main`. The **Publish libraries to npm** workflow verifies the workspace and publishes any version that isn't on npm yet, with provenance. It needs an `NPM_TOKEN` secret that can publish to the `@in-co-sandbox` scope.

## License

ISC
