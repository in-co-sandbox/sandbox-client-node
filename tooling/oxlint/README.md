# Sandbox Oxlint configuration

Import the default export from `@in-co-sandbox/oxlint-config` into the
workspace's `oxlint.config.ts`. Export the complete object, or spread it
when adding repository-owned ignore patterns. Oxlint's `extends` does not
inherit every config field.

The package includes the local-binding naming rule through its `./plugin`
export. Its plugin path resolves inside the installed package. External
payload property names remain unchanged.

Runtime JavaScript ships in `src`; `pnpm build` generates declarations.
Oxlint and its type-aware checker are peer dependencies.
