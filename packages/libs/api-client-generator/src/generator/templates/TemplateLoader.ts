import * as fs from "fs";
import * as path from "path";

export class TemplateLoader {
	private templates: Map<string, string> = new Map();
	private templateDir: string;

	constructor(templateDir: string) {
		this.templateDir = templateDir;
		this.loadTemplates();
	}

	private loadTemplates(): void {
		const templateFiles = [
			// Client SDK templates (Node TypeScript)
			{ name: "client", path: "node-ts/client/client.mustache" },
			{ name: "zodSchema", path: "node-ts/schema/zodSchema.mustache" },
			{ name: "requestIndex", path: "node-ts/schema/requestIndex.mustache" },
			{ name: "schemasIndex", path: "node-ts/schema/schemasIndex.mustache" },
			{ name: "index", path: "node-ts/index.mustache" },
			{ name: "test", path: "node-ts/tests/test.mustache" },
		];

		for (const { name, path: templatePath } of templateFiles) {
			const fullPath = path.join(this.templateDir, templatePath);
			if (fs.existsSync(fullPath)) {
				const content = fs.readFileSync(fullPath, "utf8");
				this.templates.set(name, content);
			} else {
				console.warn(`Template not found: ${fullPath}`);
			}
		}
	}

	getTemplate(name: string): string | undefined {
		return this.templates.get(name);
	}

	hasTemplate(name: string): boolean {
		return this.templates.has(name);
	}
}
