import { globSync } from "glob";
import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import { nodeExternals } from "rollup-plugin-node-externals";

const getAllIndexAndSourceFiles = () => globSync("src/**/*.ts");

export default [
	{
		input: getAllIndexAndSourceFiles(),
		plugins: [
			nodeExternals({
				packagePath: "./package.json",
			}),
			esbuild({
				target: "esnext",
				minify: false,
			}),
		],
		output: {
			dir: "dist/",
			format: "esm",
			preserveModules: true,
		},
	},
	{
		input: getAllIndexAndSourceFiles(),
		plugins: [
			nodeExternals({
				packagePath: "./package.json",
			}),
			dts(),
		],
		output: {
			dir: "dist/",
			preserveModules: true,
		},
	},
];
