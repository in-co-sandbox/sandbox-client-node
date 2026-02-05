#!/usr/bin/env node

import * as path from "path";
import { GeneratorConfig } from "./config/GeneratorConfig";
import { Generator } from "./generator/Generator";

function printUsage(): void {
	console.log("Usage: openapi-to-client <openapi-spec> [-o <output-dir>] [--generate-tests]");
	console.log("");
	console.log("Arguments:");
	console.log("  <openapi-spec>    Path to the OpenAPI specification JSON file");
	console.log("");
	console.log("Options:");
	console.log("  -o, --output      Output directory (default: ./src)");
	console.log("  --generate-tests  Generate test files for the clients");
	console.log("  -h, --help        Show this help message");
}

function parseArgs(args: string[]): { inputSpec: string; outputDir: string; generateTests: boolean } | null {
	const cliArgs = args.slice(2);

	if (cliArgs.length === 0 || cliArgs.includes("-h") || cliArgs.includes("--help")) {
		printUsage();
		return null;
	}

	let inputSpec: string | undefined;
	let outputDir = path.resolve("src");
	let generateTests = false;

	for (let i = 0; i < cliArgs.length; i++) {
		const arg = cliArgs[i];
		if (arg === "-o" || arg === "--output") {
			i++;
			if (i >= cliArgs.length) {
				console.error("Error: --output requires a value");
				printUsage();
				return null;
			}
			outputDir = path.resolve(cliArgs[i]);
		} else if (arg === "--generate-tests") {
			generateTests = true;
		} else if (!arg.startsWith("-")) {
			inputSpec = path.resolve(arg);
		} else {
			console.error(`Error: Unknown option "${arg}"`);
			printUsage();
			return null;
		}
	}

	if (!inputSpec) {
		console.error("Error: OpenAPI specification file is required");
		printUsage();
		return null;
	}

	return { inputSpec, outputDir, generateTests };
}

function main() {
	const parsed = parseArgs(process.argv);
	if (!parsed) {
		process.exit(1);
	}

	try {
		const config = new GeneratorConfig({
			inputSpec: parsed.inputSpec,
			outputDir: parsed.outputDir,
			generateTests: parsed.generateTests,
		});
		const generator = new Generator(config);
		generator.generate();
	} catch (error) {
		console.error("Error during generation:", error);
		process.exit(1);
	}
}

main();
