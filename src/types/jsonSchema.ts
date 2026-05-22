import * as z from "zod/mini";

// Core definitions
const simpleTypes = [
  "string",
  "number",
  "integer",
  "boolean",
  "object",
  "array",
  "null",
] as const;

// Define base schema first - Zod is the source of truth
export const baseSchema = z.object({
  // Base schema properties
  $id: z.optional(z.string()),
  $schema: z.optional(z.string()),
  $ref: z.optional(z.string()),
  $anchor: z.optional(z.string()),
  $dynamicRef: z.optional(z.string()),
  $dynamicAnchor: z.optional(z.string()),
  $vocabulary: z.optional(z.record(z.string(), z.boolean())),
  $comment: z.optional(z.string()),
  title: z.optional(z.string()),
  description: z.optional(z.string()),
  default: z.optional(z.unknown()),
  deprecated: z.optional(z.boolean()),
  readOnly: z.optional(z.boolean()),
  writeOnly: z.optional(z.boolean()),
  examples: z.optional(z.array(z.unknown())),
  type: z.optional(
    z.union([z.enum(simpleTypes), z.array(z.enum(simpleTypes))]),
  ),

  // String validations
  minLength: z.optional(z.number().check(z.int(), z.minimum(0))),
  maxLength: z.optional(z.number().check(z.int(), z.minimum(0))),
  pattern: z.optional(z.string()),
  format: z.optional(z.string()),
  contentMediaType: z.optional(z.string()),
  contentEncoding: z.optional(z.string()),

  // Number validations
  multipleOf: z.optional(z.number().check(z.positive())),
  minimum: z.optional(z.number()),
  maximum: z.optional(z.number()),
  exclusiveMinimum: z.optional(z.number()),
  exclusiveMaximum: z.optional(z.number()),

  // Array validations
  minItems: z.optional(z.number().check(z.int(), z.minimum(0))),
  maxItems: z.optional(z.number().check(z.int(), z.minimum(0))),
  uniqueItems: z.optional(z.boolean()),
  minContains: z.optional(z.number().check(z.int(), z.minimum(0))),
  maxContains: z.optional(z.number().check(z.int(), z.minimum(0))),

  // Object validations
  required: z.optional(z.array(z.string())),
  minProperties: z.optional(z.number().check(z.int(), z.minimum(0))),
  maxProperties: z.optional(z.number().check(z.int(), z.minimum(0))),
  dependentRequired: z.optional(z.record(z.string(), z.array(z.string()))),

  // Value validations
  const: z.optional(z.unknown()),
  enum: z.optional(z.array(z.unknown())),
});

// Define recursive schema type
/** @public */
export type JsonSchema =
  | boolean
  | (z.infer<typeof baseSchema> & {
      // Recursive properties
      $defs?: Record<string, JsonSchema>;
      contentSchema?: JsonSchema;
      items?: JsonSchema;
      prefixItems?: JsonSchema[];
      contains?: JsonSchema;
      unevaluatedItems?: JsonSchema;
      properties?: Record<string, JsonSchema>;
      patternProperties?: Record<string, JsonSchema>;
      additionalProperties?: JsonSchema | boolean;
      propertyNames?: JsonSchema;
      dependentSchemas?: Record<string, JsonSchema>;
      unevaluatedProperties?: JsonSchema;
      allOf?: JsonSchema[];
      anyOf?: JsonSchema[];
      oneOf?: JsonSchema[];
      not?: JsonSchema;
      if?: JsonSchema;
      then?: JsonSchema;
      else?: JsonSchema;
    });

// Define Zod schema with recursive types
export const jsonSchemaType: z.ZodMiniType<JsonSchema> = z.lazy(() =>
  z.union([
    z.object({
      ...baseSchema.shape,
      $defs: z.optional(z.record(z.string(), jsonSchemaType)),
      contentSchema: z.optional(jsonSchemaType),
      items: z.optional(jsonSchemaType),
      prefixItems: z.optional(z.array(jsonSchemaType)),
      contains: z.optional(jsonSchemaType),
      unevaluatedItems: z.optional(jsonSchemaType),
      properties: z.optional(z.record(z.string(), jsonSchemaType)),
      patternProperties: z.optional(z.record(z.string(), jsonSchemaType)),
      additionalProperties: z.optional(z.union([jsonSchemaType, z.boolean()])),
      propertyNames: z.optional(jsonSchemaType),
      dependentSchemas: z.optional(z.record(z.string(), jsonSchemaType)),
      unevaluatedProperties: z.optional(jsonSchemaType),
      allOf: z.optional(z.array(jsonSchemaType)),
      anyOf: z.optional(z.array(jsonSchemaType)),
      oneOf: z.optional(z.array(jsonSchemaType)),
      not: z.optional(jsonSchemaType),
      if: z.optional(jsonSchemaType),
      // biome-ignore lint/suspicious/noThenProperty: This is a required property name in JSON Schema
      then: z.optional(jsonSchemaType),
      else: z.optional(jsonSchemaType),
    }),
    z.boolean(),
  ]),
);

// Derive our types from the schema
export type SchemaType = (typeof simpleTypes)[number];

export interface NewField {
  name: string;
  type: SchemaEditorType;
  description: string;
  required: boolean;
  validation?: ObjectJsonSchema;
  additionalProperties?: boolean;
}

export interface SchemaEditorState {
  schema: JsonSchema;
  fieldInfo: {
    type: SchemaType;
    properties: Array<{
      name: string;
      path: string[];
      schema: JsonSchema;
      required: boolean;
    }>;
  } | null;
  handleAddField: (newField: NewField, parentPath?: string[]) => void;
  handleEditField: (path: string[], updatedField: NewField) => void;
  handleDeleteField: (path: string[]) => void;
  handleSchemaEdit: (schema: JsonSchema) => void;
}

export type ObjectJsonSchema = Exclude<JsonSchema, boolean>;

/** Virtual type used in the editor UI to represent combinator schemas */
export type SchemaEditorType = SchemaType | "anyOf" | "oneOf" | "allOf";

export function isBooleanSchema(schema: JsonSchema): schema is boolean {
  return typeof schema === "boolean";
}

export function isObjectSchema(schema: JsonSchema): schema is ObjectJsonSchema {
  return !isBooleanSchema(schema);
}

export function asObjectSchema(schema: JsonSchema): ObjectJsonSchema {
  return isObjectSchema(schema) ? schema : { type: "null" };
}
export function getSchemaDescription(schema: JsonSchema): string {
  return isObjectSchema(schema) ? schema.description || "" : "";
}

export function withObjectSchema<T>(
  schema: JsonSchema,
  fn: (schema: ObjectJsonSchema) => T,
  defaultValue: T,
): T {
  return isObjectSchema(schema) ? fn(schema) : defaultValue;
}

export function isAnyOfSchema(schema: JsonSchema): boolean {
  return isObjectSchema(schema) && Array.isArray(schema.anyOf);
}

export function isOneOfSchema(schema: JsonSchema): boolean {
  return isObjectSchema(schema) && Array.isArray(schema.oneOf);
}

export function isAllOfSchema(schema: JsonSchema): boolean {
  return isObjectSchema(schema) && Array.isArray(schema.allOf);
}

export function getEditorType(schema: JsonSchema): SchemaEditorType {
  if (isAnyOfSchema(schema)) return "anyOf";
  if (isOneOfSchema(schema)) return "oneOf";
  if (isAllOfSchema(schema)) return "allOf";
  return withObjectSchema(
    schema,
    (s) => (s.type || "object") as SchemaType,
    "object" as SchemaType,
  );
}
