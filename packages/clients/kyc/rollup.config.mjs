import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import { globSync } from "glob";
import { nodeExternals } from "rollup-plugin-node-externals";

// Get all index.ts files in the project
const getAllIndexFiles = () => globSync("src/**/index.ts");

// Get files for JS build (excluding interfaces) - interfaces are not needed
// in the output. i.e. we are excluding the interface folder since they do
// not emit the corresponding .js files.
const getJSBuildFiles = () =>
    globSync("src/**/index.ts", { ignore: "src/interface/**" });

// Main build configuration
export default [
    {
        input: getJSBuildFiles(),
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
            format: "esm",
            preserveModules: true,
            preserveModulesRoot: "",
        },
    },
    {
        input: getAllIndexFiles(),
        plugins: [
            nodeExternals({
                packagePath: "./package.json",
            }),
            dts(),
        ],
        output: {
            dir: "dist/",
            preserveModules: true,
            preserveModulesRoot: "",
        },
    },
];