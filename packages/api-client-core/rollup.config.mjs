/* eslint-disable import/no-extraneous-dependencies */
import { globSync } from "glob";
import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import { nodeExternals } from "rollup-plugin-node-externals";

// We are giving individual entry points for each index.ts file.
// Because there are files having same name in different folders.
// Giving a single entry point will only parse the first one and ignore the rest.
// Doing it this way ensures that all the files are parsed.
const getAllIndexFiles = () => globSync("{src/**/index.ts,generated/**/index.ts}");

// Main build configuration
const mainConfig = {
    input: getAllIndexFiles(),
    plugins: [
        nodeExternals({
            packagePath: "./package.json",
        }),
        esbuild({
            target: "esnext",
        }),
    ],
    output: {
        dir: "dist/",
        preserveModules: true,
        format: "esm",
    },
};

// TypeScript declaration files configuration
const dtsConfig = {
    input: getAllIndexFiles(),
    output: {
        dir: "dist/",
        preserveModules: true,
    },
    plugins: [
        nodeExternals({
            packagePath: "./package.json",
        }),
        dts(),
    ],
};

export default [mainConfig, dtsConfig];