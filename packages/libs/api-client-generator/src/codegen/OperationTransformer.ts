import { pascalCase, camelCase } from "change-case";
import { jsonSchemaToZod } from "json-schema-to-zod";
import { CodegenOperation, CodegenOperationGroup, CodegenParameter } from "../models/CodegenOperation";
import { OpenAPIV3 } from "openapi-types";
import { JSONSchemaFaker } from "json-schema-faker";

export interface FunctionParam {
	name: string;
	type: string;
	optional: boolean;
	last: boolean;
}

export interface OperationData {
	operationId: string;
	pascalOperationId: string;
	summary?: string;
	description?: string;
	path: string;
	isGet: boolean;
	isPost: boolean;
	isPostForGet: boolean;
	isPut: boolean;
	isPatch: boolean;
	isDelete: boolean;
	pathParams: ParameterData[];
	queryParams: ParameterData[];
	headerParams: ParameterData[];
	hasRequestBody: boolean;
	hasPathParams: boolean;
	hasQueryParams: boolean;
	hasHeaderParams: boolean;
	functionParams: FunctionParam[];
}

export interface ParameterData {
	name: string;
	originalName: string;
	type: string;
	required: boolean;
	description?: string;
	last?: boolean;
}

export interface ClientData {
	tag: string;
	name?: string;
	operations: OperationData[];
	hasAnyRequestBody: boolean;
}

export interface ZodSchemaData {
	schemaName: string;
	zodSchema: string;
	typeName: string;
}

export interface TestTemplateData {
	clientName: string;
	clientPath: string;
	schemasPath: string;
	requestImports: RequestImport[];
	operations: OperationTestData[];
	testConstants: TestConstant[];
}

export interface RequestImport {
	typeName: string;
}

export interface OperationTestData {
	methodName: string;
	summary?: string;
	parameters: TestParameter[];
	testTimeout: number;
}

export interface TestParameter {
	name: string;
	type: string;
	isRequestBody: boolean;
	isOptional: boolean;
	exampleValue?: string;
	requestBodyProperties?: RequestBodyProperty[];
	last: boolean;
}

export interface RequestBodyProperty {
	propertyName: string;
	propertyValue: string;
	last: boolean;
}

export interface TestConstant {
	name: string;
	value: string;
}

export class OperationTransformer {
	private spec: OpenAPIV3.Document;

	constructor(spec: OpenAPIV3.Document) {
		this.spec = spec;
	}

	buildClientData(group: CodegenOperationGroup): ClientData {
		const name = this.extractClientName(group);
		const operations = group.operations.map((op) => this.transformOperation(op));

		return {
			tag: group.clientName,
			name,
			operations,
			hasAnyRequestBody: operations.some((op) => op.hasRequestBody),
		};
	}

	transformOperation(operation: CodegenOperation): OperationData {
		const method = operation.httpMethod;
		const isPost = method === "post";
		const hasResponseBody = operation.responses.some((r) => r.statusCode === "200" && r.schema);

		const pathParams = this.transformParameters(operation.pathParams);
		const queryParams = this.transformParameters(operation.queryParams);
		const headerParams = this.filterAndTransformHeaders(operation.headerParams);
		const hasRequestBody = !!operation.requestBody;

		// Build combined function parameters list
		const functionParams: FunctionParam[] = [];

		pathParams.forEach((p) => {
			functionParams.push({ name: p.name, type: p.type, optional: false, last: false });
		});

		queryParams.forEach((p) => {
			functionParams.push({ name: p.name, type: p.type, optional: !p.required, last: false });
		});

		if (hasRequestBody) {
			functionParams.push({
				name: "request",
				type: pascalCase(operation.operationId) + "Request",
				optional: false,
				last: false,
			});
		}

		headerParams.forEach((p) => {
			functionParams.push({ name: p.name, type: p.type, optional: !p.required, last: false });
		});

		// Mark the last parameter
		if (functionParams.length > 0) {
			functionParams[functionParams.length - 1].last = true;
		}

		return {
			operationId: operation.operationId,
			pascalOperationId: pascalCase(operation.operationId),
			summary: operation.summary,
			description: operation.description,
			path: operation.path,
			isGet: method === "get",
			isPost: isPost && !hasResponseBody,
			isPostForGet: isPost && hasResponseBody, // Rule 3: Use postForGet for POST with response body
			isPut: method === "put",
			isPatch: method === "patch",
			isDelete: method === "delete",
			pathParams,
			queryParams,
			headerParams,
			hasRequestBody,
			hasPathParams: pathParams.length > 0,
			hasQueryParams: queryParams.length > 0,
			hasHeaderParams: headerParams.length > 0,
			functionParams,
		};
	}

	private extractClientName(group: CodegenOperationGroup): string | undefined {
		// Check if any of the tags have a custom client name
		for (const tag of group.tags) {
			const tagObj = this.spec.tags?.find((t) => t.name === tag);
			if (tagObj) {
				const clientName = (tagObj as any)["x-sandbox-client-name"];
				if (clientName) return clientName;
			}
		}

		return undefined;
	}

	private transformParameters(params: CodegenParameter[]): ParameterData[] {
		return params.map((p, index, arr) => ({
			name: camelCase(p.name),
			originalName: p.baseName,
			type: p.dataType,
			required: p.required,
			description: p.description,
			last: index === arr.length - 1,
		}));
	}

	private filterAndTransformHeaders(params: CodegenParameter[]): ParameterData[] {
		// Rule 1: Ignore x-api-key, Authorization, x-api-version headers
		const ignoredHeaders = ["x-api-key", "authorization", "x-api-version"];

		const filtered = params.filter((p) => !ignoredHeaders.includes(p.baseName.toLowerCase()));

		return filtered.map((p, index, arr) => {
			// Rule 2: Remove x- prefix and convert to camelCase
			const cleanName = p.baseName.replace(/^x-/i, "");
			return {
				name: camelCase(cleanName),
				originalName: p.baseName,
				type: p.dataType,
				required: p.required,
				description: p.description,
				last: index === arr.length - 1,
			};
		});
	}

	private findOperationInSpec(operationId: string, path?: string, httpMethod?: string): OpenAPIV3.OperationObject | null {
		const paths = this.spec.paths || {};
		const methods = ["get", "post", "put", "patch", "delete"] as const;

		// If path and method provided, use them for exact match (more reliable)
		if (path && httpMethod) {
			const pathItem = paths[path];
			if (pathItem) {
				const operation = pathItem[httpMethod as keyof typeof pathItem];
				if (operation && typeof operation === "object" && "operationId" in operation) {
					return operation as OpenAPIV3.OperationObject;
				}
			}
			return null;
		}

		// Fallback to operationId lookup (less reliable with duplicates)
		for (const pathItem of Object.values(paths)) {
			if (!pathItem) continue;
			for (const method of methods) {
				const operation = pathItem[method];
				if (operation?.operationId === operationId) {
					return operation;
				}
			}
		}

		return null;
	}

	extractExactSchema(operation: any, type: "request" | "response"): any {
		const opObj = this.findOperationInSpec(operation.operationId, operation.path, operation.httpMethod);
		if (!opObj) return null;

		let schema: any = null;

		if (type === "request") {
			const requestBody = opObj.requestBody as OpenAPIV3.RequestBodyObject;
			if (requestBody?.content?.["application/json"]?.schema) {
				schema = JSON.parse(JSON.stringify(requestBody.content["application/json"].schema));
			}
		} else {
			const responses = opObj.responses as OpenAPIV3.ResponsesObject;
			const response200 = responses["200"] as OpenAPIV3.ResponseObject;
			if (response200?.content?.["application/json"]?.schema) {
				schema = JSON.parse(JSON.stringify(response200.content["application/json"].schema));
			}
		}

		if (!schema) return null;

		// Add $id and $schema at the top level only
		const wrappedSchema = {
			$schema: "http://json-schema.org/draft-07/schema#",
			$id: pascalCase(operation.operationId) + (type === "request" ? "Request" : "Response"),
			...schema,
		};

		return wrappedSchema;
	}

	/**
	 * Convert a JSON schema to a Zod schema code string
	 */
	private convertToZodSchema(schema: any): string {
		if (!schema) return "z.any()";
		return jsonSchemaToZod(schema, { module: "none" });
	}

	/**
	 * Build template data for Zod schema generation
	 */
	buildZodSchemaData(operation: any): ZodSchemaData | null {
		const schema = this.extractExactSchema(operation, "request");
		if (!schema) return null;

		return {
			schemaName: pascalCase(operation.operationId) + "RequestSchema",
			zodSchema: this.convertToZodSchema(schema),
			typeName: pascalCase(operation.operationId) + "Request",
		};
	}

	/**
	 * Build template data for test generation
	 */
	buildTestData(group: CodegenOperationGroup, tagPath: string): TestTemplateData {
		const constantsMap = new Map<string, string>();
		const requestImports: RequestImport[] = [];

		const operations: OperationTestData[] = group.operations.map((op) => {
			const operationData = this.transformOperation(op);
			const parameters: TestParameter[] = [];

			// Add path and query parameters (combined - both use constants)
			[...operationData.pathParams, ...operationData.queryParams].forEach((param) => {
				const exampleValue = this.generateExampleValue(param.name, param.type);
				const constantName = this.toConstantName(param.name);
				constantsMap.set(constantName, exampleValue);

				parameters.push({
					name: param.name,
					type: param.type,
					isRequestBody: false,
					isOptional: !param.required,
					exampleValue: constantName,
					last: false,
				});
			});

			// Add request body
			if (operationData.hasRequestBody) {
				const typeName = pascalCase(op.operationId) + "Request";
				requestImports.push({ typeName });

				const properties = this.buildRequestBodyProperties(op, constantsMap);

				parameters.push({
					name: "request",
					type: typeName,
					isRequestBody: true,
					isOptional: false,
					requestBodyProperties: properties,
					last: false,
				});
			}

			// Add header parameters (inline values, no constants)
			operationData.headerParams.forEach((param) => {
				parameters.push({
					name: param.name,
					type: param.type,
					isRequestBody: false,
					isOptional: !param.required,
					exampleValue: this.generateExampleValue(param.name, param.type),
					last: false,
				});
			});

			// Mark the last parameter
			if (parameters.length > 0) {
				parameters[parameters.length - 1].last = true;
			}

			return {
				methodName: op.operationId,
				summary: op.summary?.toLowerCase(),
				parameters,
				testTimeout: 30000,
			};
		});

		const testConstants: TestConstant[] = Array.from(constantsMap.entries()).map(([name, value]) => ({
			name,
			value,
		}));

		return {
			clientName: group.clientName + "Client",
			clientPath: `../${tagPath}/client/${group.clientName}Client`,
			schemasPath: `../${tagPath}/schemas/request`,
			requestImports,
			operations,
			testConstants,
		};
	}

	private buildRequestBodyProperties(operation: any, constantsMap: Map<string, string>): RequestBodyProperty[] {
		const schema = this.extractExactSchema(operation, "request");
		if (!schema || !schema.properties) return [];

		// Generate mock data using json-schema-faker
		const mockData = JSONSchemaFaker.generate(schema) as Record<string, any>;

		const properties = Object.entries(mockData)
			.map(([key, value]: [string, any], index, arr) => {
				// Handle @entity field - keep property name as @entity but use ENTITY for constant
				const isEntityField = key === "@entity";
				const constantBaseName = isEntityField ? "entity" : key;

				// Generate constant name - for entity, check for collisions
				let constantName = this.toConstantName(constantBaseName);
				if (isEntityField && constantsMap.has(constantName)) {
					// Collision detected, prefix with operation name
					constantName = `${pascalCase(operation.operationId).toUpperCase()}_${constantName}`;
				}

				const exampleValue = this.formatValueForTest(value);
				constantsMap.set(constantName, exampleValue);

				return {
					propertyName: key,
					propertyValue: constantName,
					last: index === arr.length - 1,
				};
			})
			.filter(Boolean) as RequestBodyProperty[];

		// Update last flag after filtering
		if (properties.length > 0) {
			properties.forEach((p) => (p.last = false));
			properties[properties.length - 1].last = true;
		}

		return properties;
	}

	private toConstantName(name: string): string {
		return name.toUpperCase().replace(/[.-]/g, "_");
	}

	private generateExampleValue(paramName: string, type: string): string {
		// Create a simple schema based on type
		const schemaType = type === "number" ? "integer" : type === "boolean" ? "boolean" : "string";
		const simpleSchema: any = { type: schemaType };
		const value = JSONSchemaFaker.generate(simpleSchema);
		return this.formatValueForTest(value);
	}

	/**
	 * Format a generated value for use in test code
	 */
	private formatValueForTest(value: any): string {
		if (value === null || value === undefined) {
			return "null";
		}

		if (typeof value === "string") {
			// Escape quotes and backslashes in strings
			const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
			return `"${escaped}"`;
		}

		if (typeof value === "boolean" || typeof value === "number") {
			return String(value);
		}

		if (Array.isArray(value)) {
			return JSON.stringify(value);
		}

		if (typeof value === "object") {
			return JSON.stringify(value);
		}

		return String(value);
	}
}
