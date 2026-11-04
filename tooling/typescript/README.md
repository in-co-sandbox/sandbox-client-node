# Sandbox TypeScript configuration

Two presets cover the Node.js workspace:

| Preset       | Purpose                                                                 |
| ------------ | ----------------------------------------------------------------------- |
| `base.json`  | Shared checking rules, Node.js types and decorator settings. No output. |
| `build.json` | Production sources, source maps and declarations. Extends `base.json`.  |

Each package's `tsconfig.json` extends the base. Package-specific checking
settings, including test globals, stay in that file:

```json
{
    "extends": "@in-co-sandbox/typescript-config/base.json",
    "compilerOptions": {
        "types": ["node", "vitest/globals"]
    }
}
```

Libraries use this `tsconfig.build.json`:

```json
{
    "extends": ["./tsconfig.json", "@in-co-sandbox/typescript-config/build.json"]
}
```

The build preset comes last. It excludes tests and replaces test globals with
Node.js types. Local settings such as `noImplicitAny: false` remain in effect.
Libraries emit production JavaScript and declarations with `tsc -p tsconfig.build.json`,
then use [Rollup](../rollup/README.md) to package both into `dist`.

APIs and functions use the same build preset and turn off declarations:

```json
{
    "extends": ["./tsconfig.json", "@in-co-sandbox/typescript-config/build.json"],
    "compilerOptions": {
        "declaration": false,
        "declarationMap": false
    }
}
```

Their compiler writes JavaScript to `.build` before
[Rollup](../rollup/README.md) bundles it into `dist/index.mjs`.
Tooling packages also use the shared build preset, overriding `rootDir`,
`outDir` and `emitDeclarationOnly` to emit declarations for their JavaScript presets.

Shared paths use `${configDir}`, which TypeScript replaces with the consuming
config's directory. Local `include`, `exclude` and `types` arrays replace
inherited arrays. Legacy decorators remain enabled without automatic design
metadata. The configuration package ships JSON and needs no compilation.
