import { pascalCase } from "change-case";
import { OpenAPIV3 } from "openapi-types";
import { SchemaIR, SchemaType } from "../models/CodegenOperation";

/**
 * Parses OpenAPI/JSON Schema into an intermediate representation
 * that preserves all validation constraints.
 */
export class SchemaParser {
	private spec: OpenAPIV3.Document;

	constructor(spec: OpenAPIV3.Document) {
		this.spec = spec;
	}

	/**
	 * Parse a schema object into SchemaIR
	 */
	parseSchema(schema: OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject, name?: string): SchemaIR {
		// Handle $ref
		if (this.isReferenceObject(schema)) {
			return this.parseReference(schema);
		}

		// Handle const
		if ("const" in schema && schema.const !== undefined) {
			return this.parseConst(schema, name);
		}

		// Handle enum
		if (schema.enum) {
			return this.parseEnum(schema, name);
		}

		// Handle oneOf
		if (schema.oneOf) {
			return this.parseOneOf(schema, name);
		}

		// Handle anyOf
		if (schema.anyOf) {
			return this.parseAnyOf(schema, name);
		}

		// Handle allOf
		if (schema.allOf) {
			return this.parseAllOf(schema, name);
		}

		// Handle by type
		const type = this.getSchemaType(schema);
		switch (type) {
			case "object":
				return this.parseObject(schema, name);
			case "array":
				return this.parseArray(schema, name);
			case "string":
				return this.parseString(schema, name);
			case "number":
			case "integer":
				return this.parseNumber(schema, name, type);
			case "boolean":
				return this.parseBoolean(schema, name);
			case "null":
				return this.parseNull(name);
			default:
				return this.parseAny(name);
		}
	}

	private parseReference(ref: OpenAPIV3.ReferenceObject): SchemaIR {
		const refPath = ref.$ref;
		const refName = refPath.split("/").pop()!;

		return {
			name: refName,
			type: "ref",
			required: true,
			nullable: false,
			constraints: {},
			$ref: refPath,
			refName: pascalCase(refName),
		};
	}

	private parseConst(schema: OpenAPIV3.SchemaObject, name?: string): SchemaIR {
		const constValue = (schema as any).const;
		return {
			name,
			type: "const",
			required: true,
			nullable: false,
			constraints: {},
			constValue,
		};
	}

	private parseEnum(schema: OpenAPIV3.SchemaObject, name?: string): SchemaIR {
		const enumType = typeof schema.enum![0] === "number" ? "number" : "string";
		return {
			name,
			type: "enum",
			description: schema.description,
			required: true,
			nullable: (schema as any).nullable || false,
			constraints: {},
			enumValues: schema.enum as (string | number | boolean)[],
			enumType,
		};
	}

	private parseOneOf(schema: OpenAPIV3.SchemaObject, name?: string): SchemaIR {
		const oneOfSchemas = schema.oneOf!.map((s, i) => this.parseSchema(s as OpenAPIV3.SchemaObject, `${name}OneOf${i}`));
		return {
			name,
			type: "union",
			required: true,
			nullable: (schema as any).nullable || false,
			constraints: {},
			oneOf: oneOfSchemas,
		};
	}

	private parseAnyOf(schema: OpenAPIV3.SchemaObject, name?: string): SchemaIR {
		const anyOfSchemas = schema.anyOf!.map((s, i) => this.parseSchema(s as OpenAPIV3.SchemaObject, `${name}AnyOf${i}`));
		return {
			name,
			type: "union",
			required: true,
			nullable: (schema as any).nullable || false,
			constraints: {},
			anyOf: anyOfSchemas,
		};
	}

	private parseAllOf(schema: OpenAPIV3.SchemaObject, name?: string): SchemaIR {
		const allOfSchemas = schema.allOf!.map((s, i) => this.parseSchema(s as OpenAPIV3.SchemaObject, `${name}AllOf${i}`));
		return {
			name,
			type: "object",
			required: true,
			nullable: (schema as any).nullable || false,
			constraints: {},
			allOf: allOfSchemas,
		};
	}

	private parseObject(schema: OpenAPIV3.SchemaObject, name?: string): SchemaIR {
		const properties: Record<string, SchemaIR> = {};
		const requiredFields = schema.required || [];

		if (schema.properties) {
			for (const [propName, propSchema] of Object.entries(schema.properties)) {
				const propIR = this.parseSchema(propSchema as OpenAPIV3.SchemaObject, `${name}${pascalCase(propName)}`);
				propIR.required = requiredFields.includes(propName);
				properties[propName] = propIR;
			}
		}

		// Handle additionalProperties
		let additionalProps: boolean | SchemaIR | undefined;
		if (schema.additionalProperties !== undefined) {
			if (typeof schema.additionalProperties === "boolean") {
				additionalProps = schema.additionalProperties;
			} else {
				additionalProps = this.parseSchema(schema.additionalProperties as OpenAPIV3.SchemaObject, `${name}AdditionalProps`);
			}
		}

		return {
			name,
			type: "object",
			description: schema.description,
			required: true,
			nullable: (schema as any).nullable || false,
			constraints: {
				minProperties: schema.minProperties,
				maxProperties: schema.maxProperties,
			},
			properties,
			requiredFields,
			additionalProperties: additionalProps,
		};
	}

	private parseArray(schema: OpenAPIV3.SchemaObject, name?: string): SchemaIR {
		let items: SchemaIR | undefined;
		if (schema.type === "array") {
			items = this.parseSchema(schema.items as OpenAPIV3.SchemaObject, `${name}Item`);
		}

		return {
			name,
			type: "array",
			description: schema.description,
			required: true,
			nullable: (schema as any).nullable || false,
			constraints: {
				minItems: schema.minItems,
				maxItems: schema.maxItems,
				uniqueItems: schema.uniqueItems,
			},
			items,
		};
	}

	private parseString(schema: OpenAPIV3.SchemaObject, name?: string): SchemaIR {
		return {
			name,
			type: "string",
			description: schema.description,
			required: true,
			nullable: (schema as any).nullable || false,
			constraints: {
				minLength: schema.minLength,
				maxLength: schema.maxLength,
				pattern: schema.pattern,
				format: schema.format,
			},
			format: schema.format,
		};
	}

	private parseNumber(schema: OpenAPIV3.SchemaObject, name?: string, type: "number" | "integer" = "number"): SchemaIR {
		return {
			name,
			type,
			description: schema.description,
			required: true,
			nullable: (schema as any).nullable || false,
			constraints: {
				minimum: schema.minimum,
				maximum: schema.maximum,
				exclusiveMinimum: schema.exclusiveMinimum as number | undefined,
				exclusiveMaximum: schema.exclusiveMaximum as number | undefined,
				multipleOf: schema.multipleOf,
			},
		};
	}

	private parseBoolean(schema: OpenAPIV3.SchemaObject, name?: string): SchemaIR {
		return {
			name,
			type: "boolean",
			description: schema.description,
			required: true,
			nullable: (schema as any).nullable || false,
			constraints: {},
		};
	}

	private parseNull(name?: string): SchemaIR {
		return {
			name,
			type: "null",
			required: true,
			nullable: true,
			constraints: {},
		};
	}

	private parseAny(name?: string): SchemaIR {
		return {
			name,
			type: "any",
			required: true,
			nullable: true,
			constraints: {},
		};
	}

	private getSchemaType(schema: OpenAPIV3.SchemaObject): SchemaType {
		if (schema.type) {
			return schema.type as SchemaType;
		}
		// Infer type from properties
		if (schema.properties) return "object";
		if (schema.type === "array") return "array";
		return "any";
	}

	private isReferenceObject(obj: any): obj is OpenAPIV3.ReferenceObject {
		return obj && typeof obj === "object" && "$ref" in obj;
	}

	/**
	 * Parse all schemas from components.schemas
	 */
	parseAllSchemas(): Map<string, SchemaIR> {
		const schemas = new Map<string, SchemaIR>();
		const componentSchemas = this.spec.components?.schemas || {};

		for (const [name, schema] of Object.entries(componentSchemas)) {
			if (!this.isReferenceObject(schema)) {
				schemas.set(name, this.parseSchema(schema, name));
			}
		}

		return schemas;
	}
}
