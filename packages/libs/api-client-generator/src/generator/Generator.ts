import * as fs from "fs";
import { OpenAPIV3 } from "openapi-types";
import { GeneratorConfig } from "../config/GeneratorConfig";
import { ClientGenerator } from "./ClientGenerator";

export class Generator {
	private config: GeneratorConfig;
	private spec: OpenAPIV3.Document;

	constructor(config: GeneratorConfig) {
		this.config = config;

		const specContent = fs.readFileSync(config.getInputSpec(), "utf8");
		this.spec = JSON.parse(specContent) as OpenAPIV3.Document;
	}

	generate(): void {
		console.log("=".repeat(60));
		console.log("OpenAPI Client SDK Generator");
		console.log("=".repeat(60));
		console.log(`Input: ${this.config.getInputSpec()}`);
		console.log(`Output: ${this.config.getOutputDir()}`);
		console.log("");

		const clientGenerator = new ClientGenerator(this.config, this.spec);
		clientGenerator.generate();

		console.log("\n" + "=".repeat(60));
		console.log("Generation complete!");
		console.log("=".repeat(60));
	}
}
