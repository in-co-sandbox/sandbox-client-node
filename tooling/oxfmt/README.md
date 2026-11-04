# Sandbox Oxfmt configuration

Import the default export from `@in-co-sandbox/oxfmt-config` into the
workspace's `oxfmt.config.ts`. Repository-owned exclusions can extend
`ignorePatterns`. The preset uses four spaces, 150 columns and import sorting.

Runtime JavaScript ships in `src`; `pnpm build` generates declarations.
Oxfmt is a peer dependency.
