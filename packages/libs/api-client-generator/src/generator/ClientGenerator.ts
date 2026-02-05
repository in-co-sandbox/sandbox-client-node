import * as fs from "fs";
import * as path from "path";
import Mustache from "mustache";
import { OpenAPIV3 } from "openapi-types";
import { pascalCase } from "change-case";

import { GeneratorConfig } from "../config/GeneratorConfig";
import { OperationParser } from "../parser/OperationParser";
import { CodegenOperationGroup } from "../models/CodegenOperation";
import { TemplateLoader } from "./templates/TemplateLoader";
import { OperationTransformer } from "../codegen/OperationTransformer";

/**
 * Client Generator for in-co-sandbox SDK
 * Generates client SDKs using mustache templates
 */
export class ClientGenerator {
	private config: GeneratorConfig;
	private operationParser: OperationParser;
	private operationTransformer: OperationTransformer;
	private templateLoader: TemplateLoader;

	constructor(config: GeneratorConfig, spec: OpenAPIV3.Document) {
		this.config = config;
		this.operationParser = new OperationParser(spec);
		this.operationTransformer = new OperationTransformer(spec);

		this.templateLoader = new TemplateLoader(this.config.getTemplateDir());
	}

	generate(): void {
		console.log("Starting Client SDK generation...\n");

		console.log("Parsing operations...");
		const operationGroups = this.operationParser.parseOperations();
		console.log(`Found ${operationGroups.length} operation groups\n`);

		if (operationGroups.length === 0) {
			console.warn("No operations found in the OpenAPI specification.");
			return;
		}

		for (const group of operationGroups) {
			this.generateClientForTag(group);
		}

		console.log("\n✓ Client SDK generation complete!");
	}

	private generateClientForTag(group: CodegenOperationGroup): void {
		const clientName = group.clientName;
		const outputDir = this.config.getOutputDir();

		console.log(`\nGenerating client: ${clientName} in path: ${group.tags.join("/")}`);

		// Create nested folder structure from tags: tags[0]/tags[1]/.../tags[n]
		// Client files go directly inside the tag path
		const clientDir = path.join(outputDir, ...group.tags);

		this.createDirectoryStructure(clientDir, group);
		this.generateClientFile(group, clientDir);
		this.generateTypesAndSchemas(group, clientDir);
		this.generateMainIndex(group, clientDir);

		// Generate test file if enabled
		if (this.config.shouldGenerateTests()) {
			this.generateTestFile(group, clientDir);
		}
	}

	private createDirectoryStructure(clientDir: string, group: CodegenOperationGroup): void {
		this.ensureDirectoryExists(clientDir);
		this.ensureDirectoryExists(path.join(clientDir, "client"));

		const hasRequestSchemas = group.operations.some((op) => op.requestBody);

		if (hasRequestSchemas) {
			this.ensureDirectoryExists(path.join(clientDir, "schemas"));
			this.ensureDirectoryExists(path.join(clientDir, "schemas", "request"));
		}
	}

	private generateClientFile(group: CodegenOperationGroup, clientDir: string): void {
		const clientData = this.operationTransformer.buildClientData(group);

		const template = this.templateLoader.getTemplate("client");
		if (template) {
			const content = Mustache.render(template, clientData);
			const fileName = `${group.clientName}Client.ts`;
			const filePath = path.join(clientDir, "client", fileName);
			fs.writeFileSync(filePath, content, "utf8");
			console.log(`  Generated: client/${fileName}`);
		}
	}

	private generateTypesAndSchemas(group: CodegenOperationGroup, clientDir: string): void {
		for (const operation of group.operations) {
			if (operation.requestBody) {
				this.generateRequestSchema(operation, clientDir);
			}
		}

		this.generateSchemaIndexFiles(group, clientDir);
	}

	private generateRequestSchema(operation: any, clientDir: string): void {
		const schemaData = this.operationTransformer.buildZodSchemaData(operation);
		if (!schemaData) return;

		const template = this.templateLoader.getTemplate("zodSchema");
		if (!template) {
			console.warn("  Warning: zodSchema template not found");
			return;
		}

		const content = Mustache.render(template, schemaData);
		const fileName = `${pascalCase(operation.operationId)}Request.ts`;
		const filePath = path.join(clientDir, "schemas", "request", fileName);
		fs.writeFileSync(filePath, content, "utf8");
		console.log(`  Generated: schemas/request/${fileName}`);
	}

	private generateSchemaIndexFiles(group: CodegenOperationGroup, clientDir: string): void {
		const requestOps = group.operations.filter((op) => op.requestBody);

		if (requestOps.length > 0) {
			// Generate schemas/request/index.ts
			const requestIndexTemplate = this.templateLoader.getTemplate("requestIndex");
			if (requestIndexTemplate) {
				const data = {
					operations: requestOps.map((op) => ({
						pascalOperationId: pascalCase(op.operationId),
					})),
				};
				const content = Mustache.render(requestIndexTemplate, data);
				fs.writeFileSync(path.join(clientDir, "schemas", "request", "index.ts"), content, "utf8");
				console.log(`  Generated: schemas/request/index.ts`);
			}

			// Generate schemas/index.ts
			const schemasIndexTemplate = this.templateLoader.getTemplate("schemasIndex");
			if (schemasIndexTemplate) {
				const content = Mustache.render(schemasIndexTemplate, {});
				fs.writeFileSync(path.join(clientDir, "schemas", "index.ts"), content, "utf8");
				console.log(`  Generated: schemas/index.ts`);
			}
		}
	}

	private generateMainIndex(group: CodegenOperationGroup, clientDir: string): void {
		const template = this.templateLoader.getTemplate("index");
		if (!template) return;

		const data = {
			clientName: group.clientName,
			hasSchemas: group.operations.some((op) => op.requestBody),
		};

		const content = Mustache.render(template, data);
		fs.writeFileSync(path.join(clientDir, "index.ts"), content, "utf8");
		console.log(`  Generated: index.ts`);
	}

	private generateTestFile(group: CodegenOperationGroup, clientDir: string): void {
		// Create tag path from tags array (e.g., "kyc/pan")
		const tagPath = group.tags.join("/");
		const testData = this.operationTransformer.buildTestData(group, tagPath);

		const template = this.templateLoader.getTemplate("test");
		if (template) {
			const content = Mustache.render(template, testData);
			const fileName = `${group.clientName}Client.test.ts`;

			// Create tests folder at the root output directory
			const outputDir = this.config.getOutputDir();
			const testsDir = path.join(outputDir, "tests");
			this.ensureDirectoryExists(testsDir);

			const filePath = path.join(testsDir, fileName);
			fs.writeFileSync(filePath, content, "utf8");
			console.log(`  Generated: tests/${fileName}`);
		}
	}

	private ensureDirectoryExists(dir: string): void {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir, { recursive: true });
		}
	}
}
