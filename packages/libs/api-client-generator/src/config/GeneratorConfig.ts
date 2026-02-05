import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface GeneratorConfigOptions {
	inputSpec: string;
	outputDir: string;
	generateTests?: boolean;
}

export class GeneratorConfig {
	private readonly inputSpec: string;
	private readonly outputDir: string;
	private readonly templateDir: string;
	private readonly generateTests: boolean;

	constructor(options: GeneratorConfigOptions) {
		this.inputSpec = options.inputSpec;
		this.outputDir = options.outputDir;
		this.templateDir = path.join(__dirname, "..", "..", "templates");
		this.generateTests = options.generateTests ?? false;
	}

	getInputSpec(): string {
		return this.inputSpec;
	}

	getOutputDir(): string {
		return this.outputDir;
	}

	getTemplateDir(): string {
		return this.templateDir;
	}

	shouldGenerateTests(): boolean {
		return this.generateTests;
	}
}
