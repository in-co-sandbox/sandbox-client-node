# Sandbox Vitest configuration

Import `createVitestConfig` from `@in-co-sandbox/vitest-config` and pass
package-owned setup files or overrides. The preset uses Node.js, isolated tests
and the same legacy decorator behavior as the compiler.

Runtime JavaScript ships in `src`; `pnpm build` generates declarations in
`dist`. Supported Vitest and Vite versions are peer dependencies.
