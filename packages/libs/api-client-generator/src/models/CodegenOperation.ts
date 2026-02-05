/**
 * Intermediate representation for API operations.
 * Contains all information needed to generate endpoint functions and validators.
 */

export interface CodegenParameter {
	name: string;
	baseName: string;
	description?: string;
	required: boolean;
	in: "path" | "query" | "header" | "cookie";
	dataType: string;
	isEnum: boolean;
	enumValues?: string[];
	// Constraint information for validation
	constraints: ParameterConstraints;
}

export interface ParameterConstraints {
	pattern?: string;
	minLength?: number;
	maxLength?: number;
	minimum?: number;
	maximum?: number;
	format?: string;
}

export interface CodegenRequestBody {
	required: boolean;
	contentType: string;
	schema: SchemaIR;
}

export interface CodegenResponse {
	statusCode: string;
	description?: string;
	contentType?: string;
	schema?: SchemaIR;
}

export interface CodegenOperation {
	operationId: string;
	summary?: string;
	description?: string;
	tags: string[];
	httpMethod: "get" | "post" | "put" | "patch" | "delete";
	path: string;
	pathParams: CodegenParameter[];
	queryParams: CodegenParameter[];
	headerParams: CodegenParameter[];
	requestBody?: CodegenRequestBody;
	responses: CodegenResponse[];
	// Generated names
	methodName: string;
	requestTypeName?: string;
	responseTypeName?: string;
}

export interface CodegenOperationGroup {
	clientName: string; // The x-sandbox-client-name value
	className: string;
	operations: CodegenOperation[];
	imports: string[];
	tags: string[]; // Tags for folder nesting (e.g., ["KYC", "Aadhaar"])
}

/**
 * Schema Intermediate Representation
 * Captures all JSON Schema constraints for validation generation
 */
export interface SchemaIR {
	name?: string;
	type: SchemaType;
	description?: string;
	required: boolean;
	nullable: boolean;
	// Constraints
	constraints: SchemaConstraints;
	// For objects
	properties?: Record<string, SchemaIR>;
	requiredFields?: string[];
	additionalProperties?: boolean | SchemaIR;
	// For arrays
	items?: SchemaIR;
	// For enums
	enumValues?: (string | number | boolean)[];
	enumType?: "string" | "number" | "boolean";
	// For const values
	constValue?: string | number | boolean;
	// For refs
	$ref?: string;
	refName?: string;
	// For oneOf/anyOf/allOf
	oneOf?: SchemaIR[];
	anyOf?: SchemaIR[];
	allOf?: SchemaIR[];
	// Format for special types
	format?: string;
}

export type SchemaType = "string" | "number" | "integer" | "boolean" | "array" | "object" | "null" | "any" | "ref" | "enum" | "const" | "union";

export interface SchemaConstraints {
	// String constraints
	minLength?: number;
	maxLength?: number;
	pattern?: string;
	format?: string;
	// Number constraints
	minimum?: number;
	maximum?: number;
	exclusiveMinimum?: number;
	exclusiveMaximum?: number;
	multipleOf?: number;
	// Array constraints
	minItems?: number;
	maxItems?: number;
	uniqueItems?: boolean;
	// Object constraints
	minProperties?: number;
	maxProperties?: number;
}
