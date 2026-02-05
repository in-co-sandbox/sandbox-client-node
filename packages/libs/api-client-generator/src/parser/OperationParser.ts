import { OpenAPIV3 } from "openapi-types";
import { camelCase, pascalCase } from "change-case";
import { CodegenOperation, CodegenOperationGroup, CodegenParameter, CodegenRequestBody, CodegenResponse, ParameterConstraints, SchemaIR } from "../models/CodegenOperation";
import { SchemaParser } from "./SchemaParser";

export class OperationParser {
	private spec: OpenAPIV3.Document;
	private schemaParser: SchemaParser;

	constructor(spec: OpenAPIV3.Document) {
		this.spec = spec;
		this.schemaParser = new SchemaParser(spec);
	}

	/**
	 * Parse all operations from the OpenAPI spec and group them by x-sandbox-client-name.
	 * Tags define the folder structure (nested directories based on tag order).
	 */
	parseOperations(): CodegenOperationGroup[] {
		const operationsByClientName: Map<string, { tags: string[]; operations: CodegenOperation[] }> = new Map();
		const paths = this.spec.paths || {};

		const methods = ["get", "post", "put", "patch", "delete"] as const;

		for (const [path, pathItem] of Object.entries(paths)) {
			if (!pathItem) continue;

			for (const method of methods) {
				const operation = pathItem[method] as OpenAPIV3.OperationObject | undefined;
				if (!operation) continue;

				// x-sandbox-client-name is now required
				const clientName = (operation as any)["x-sandbox-client-name"] as string | undefined;
				if (!clientName) {
					console.warn(`Operation ${operation.operationId || path} missing x-sandbox-client-name, skipping`);
					continue;
				}

				const codegenOp = this.parseOperation(path, method, operation);

				if (!operationsByClientName.has(clientName)) {
					operationsByClientName.set(clientName, {
						tags: codegenOp.tags,
						operations: [],
					});
				}
				operationsByClientName.get(clientName)!.operations.push(codegenOp);
			}
		}

		// Convert to operation groups
		const groups: CodegenOperationGroup[] = [];
		for (const [clientName, { tags, operations }] of operationsByClientName) {
			const imports = this.collectImports(operations);
			groups.push({
				clientName,
				className: `${pascalCase(clientName)}Api`,
				operations,
				imports,
				tags, // Tags for folder nesting
			});
		}

		return groups;
	}

	private parseOperation(path: string, method: "get" | "post" | "put" | "patch" | "delete", operation: OpenAPIV3.OperationObject): CodegenOperation {
		const operationId = operation.operationId || this.generateOperationId(path, method);
		const methodName = camelCase(operationId);

		// Parse parameters
		const parameters = (operation.parameters || []) as OpenAPIV3.ParameterObject[];
		const pathParams = this.parseParameters(parameters, "path");
		const queryParams = this.parseParameters(parameters, "query");
		const headerParams = this.parseParameters(parameters, "header");

		// Parse request body
		const requestBody = operation.requestBody ? this.parseRequestBody(operation.requestBody as OpenAPIV3.RequestBodyObject, operationId) : undefined;

		// Parse responses
		const responses = this.parseResponses(operation.responses || {}, operationId);

		// Generate type names
		const requestTypeName = requestBody ? `${pascalCase(operationId)}Request` : undefined;
		const responseTypeName = `${pascalCase(operationId)}Response`;

		return {
			operationId,
			summary: operation.summary,
			description: operation.description,
			tags: operation.tags || [],
			httpMethod: method,
			path,
			pathParams,
			queryParams,
			headerParams,
			requestBody,
			responses,
			methodName,
			requestTypeName,
			responseTypeName,
		};
	}

	private parseParameters(parameters: OpenAPIV3.ParameterObject[], location: "path" | "query" | "header" | "cookie"): CodegenParameter[] {
		return parameters.filter((p) => p.in === location).map((param) => this.parseParameter(param));
	}

	private parseParameter(param: OpenAPIV3.ParameterObject): CodegenParameter {
		const schema = param.schema as OpenAPIV3.SchemaObject | undefined;
		const constraints = this.extractParameterConstraints(schema);

		return {
			name: camelCase(param.name),
			baseName: param.name,
			description: param.description,
			required: param.required || false,
			in: param.in as "path" | "query" | "header" | "cookie",
			dataType: this.mapSchemaToType(schema),
			isEnum: !!schema?.enum,
			enumValues: schema?.enum as string[] | undefined,
			constraints,
		};
	}

	private extractParameterConstraints(schema?: OpenAPIV3.SchemaObject): ParameterConstraints {
		if (!schema) return {};

		return {
			pattern: schema.pattern,
			minLength: schema.minLength,
			maxLength: schema.maxLength,
			minimum: schema.minimum,
			maximum: schema.maximum,
			format: schema.format,
		};
	}

	private parseRequestBody(requestBody: OpenAPIV3.RequestBodyObject, operationId: string): CodegenRequestBody | undefined {
		const content = requestBody.content;
		if (!content) return undefined;

		// Prefer application/json
		const jsonContent = content["application/json"];
		if (jsonContent?.schema) {
			const schemaIR = this.schemaParser.parseSchema(jsonContent.schema as OpenAPIV3.SchemaObject, `${pascalCase(operationId)}Request`);
			return {
				required: requestBody.required || false,
				contentType: "application/json",
				schema: schemaIR,
			};
		}

		return undefined;
	}

	private parseResponses(responses: OpenAPIV3.ResponsesObject, operationId: string): CodegenResponse[] {
		const result: CodegenResponse[] = [];

		for (const [statusCode, response] of Object.entries(responses)) {
			if (this.isReferenceObject(response)) {
				// Handle $ref responses
				const refName = response.$ref.split("/").pop()!;
				const resolvedResponse = this.spec.components?.responses?.[refName] as OpenAPIV3.ResponseObject;
				if (resolvedResponse) {
					result.push(this.parseResponse(statusCode, resolvedResponse, operationId));
				}
			} else {
				result.push(this.parseResponse(statusCode, response, operationId));
			}
		}

		return result;
	}

	private parseResponse(statusCode: string, response: OpenAPIV3.ResponseObject, operationId: string): CodegenResponse {
		const jsonContent = response.content?.["application/json"];
		let schema: SchemaIR | undefined;

		if (jsonContent?.schema) {
			schema = this.schemaParser.parseSchema(jsonContent.schema as OpenAPIV3.SchemaObject, `${pascalCase(operationId)}Response${statusCode}`);
		}

		return {
			statusCode,
			description: response.description,
			contentType: jsonContent ? "application/json" : undefined,
			schema,
		};
	}

	private mapSchemaToType(schema?: OpenAPIV3.SchemaObject): string {
		if (!schema) return "any";

		if (schema.enum) {
			return schema.enum.map((v) => `'${v}'`).join(" | ");
		}

		const typeMap: Record<string, string> = {
			string: "string",
			number: "number",
			integer: "number",
			boolean: "boolean",
			array: "any[]",
			object: "Record<string, any>",
		};

		return typeMap[schema.type as string] || "any";
	}

	private generateOperationId(path: string, method: string): string {
		const cleanPath = path
			.replace(/\{([^}]+)\}/g, "By$1")
			.replace(/[^a-zA-Z0-9]/g, "_")
			.replace(/_+/g, "_")
			.replace(/^_|_$/g, "");
		return `${method}${pascalCase(cleanPath)}`;
	}

	private collectImports(operations: CodegenOperation[]): string[] {
		const imports = new Set<string>();

		for (const op of operations) {
			if (op.requestTypeName) {
				imports.add(op.requestTypeName);
			}
			imports.add(op.responseTypeName!);
		}

		return Array.from(imports);
	}

	private isReferenceObject(obj: any): obj is OpenAPIV3.ReferenceObject {
		return obj && typeof obj === "object" && "$ref" in obj;
	}
}
