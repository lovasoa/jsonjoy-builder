import type {
  JSONSchema,
  NewField,
  ObjectJSONSchema,
} from "../types/jsonSchema.ts";
import { isBooleanSchema, isObjectSchema } from "../types/jsonSchema.ts";

export type Property = {
  name: string;
  schema: JSONSchema;
  required: boolean;
};

export type PatternProperty = {
  pattern: string;
  schema: JSONSchema;
};

export function copySchema<T extends JSONSchema>(schema: T): T {
  if (typeof structuredClone === "function") return structuredClone(schema);
  return JSON.parse(JSON.stringify(schema));
}

/**
 * Updates a property in an object schema
 */
export function updateObjectProperty(
  schema: ObjectJSONSchema,
  propertyName: string,
  propertySchema: JSONSchema,
  isPatternProperty = false,
): ObjectJSONSchema {
  if (!isObjectSchema(schema)) return schema;

  const newSchema = copySchema(schema);

  if (!newSchema.properties) {
    newSchema.properties = {};
  }

  if (isPatternProperty) {
    if (!newSchema.patternProperties) {
      newSchema.patternProperties = {};
    }

    newSchema.patternProperties[propertyName] = propertySchema;

    return newSchema;
  }

  newSchema.properties[propertyName] = propertySchema;

  return newSchema;
}

/**
 * Removes a property from an object schema
 */
export function removeObjectProperty(
  schema: ObjectJSONSchema,
  propertyName: string,
  isPatternProperty = false,
): ObjectJSONSchema {
  const schemaProperty = isPatternProperty ? "patternProperties" : "properties";

  if (!isObjectSchema(schema) || !schema[schemaProperty]) return schema;

  const newSchema = copySchema(schema);
  const { [propertyName]: _, ...remainingProps } = newSchema[schemaProperty];
  newSchema[schemaProperty] = remainingProps;

  // Also remove from required array if present
  if (newSchema.required) {
    newSchema.required = newSchema.required.filter(
      (name) => name !== propertyName,
    );
  }

  return newSchema;
}

/**
 * Updates the 'required' status of a property
 */
export function updatePropertyRequired(
  schema: ObjectJSONSchema,
  propertyName: string,
  required: boolean,
): ObjectJSONSchema {
  if (!isObjectSchema(schema)) return schema;

  const newSchema = copySchema(schema);
  if (!newSchema.required) {
    newSchema.required = [];
  }

  if (required) {
    // Add to required array if not already there
    if (!newSchema.required.includes(propertyName)) {
      newSchema.required.push(propertyName);
    }
  } else {
    // Remove from required array
    newSchema.required = newSchema.required.filter(
      (name) => name !== propertyName,
    );
  }

  return newSchema;
}

/**
 * Updates an array schema's items
 */
export function updateArrayItems(
  schema: JSONSchema,
  itemsSchema: JSONSchema,
): JSONSchema {
  if (isObjectSchema(schema) && schema.type === "array") {
    return {
      ...schema,
      items: itemsSchema,
    };
  }
  return schema;
}

/**
 * Creates a schema for a new field
 */
export function createFieldSchema(field: NewField): JSONSchema {
  const { type, description, validation, additionalProperties } = field;

  if (isObjectSchema(validation)) {
    return {
      type,
      description,
      ...validation,
      ...(additionalProperties === false ? { additionalProperties } : {}),
    };
  }

  return validation;
}

/**
 * Validates a field name
 */
export function validateFieldName(name: string): boolean {
  if (!name || name.trim() === "") {
    return false;
  }

  // Check that the name doesn't contain invalid characters for property names
  const validNamePattern = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/;
  return validNamePattern.test(name);
}

/**
 * Gets properties from an object schema
 */
export function getSchemaProperties(
  schema: JSONSchema,
  isPatternProperty = false,
): Property[] {
  const schemaProperty = isPatternProperty ? "patternProperties" : "properties";

  if (!isObjectSchema(schema) || !schema[schemaProperty]) return [];

  const required = schema.required || [];

  return Object.entries(schema[schemaProperty]).map(([name, propSchema]) => ({
    name,
    schema: propSchema,
    required: required.includes(name),
  }));
}

/**
 * Gets the items schema from an array schema
 */
export function getArrayItemsSchema(schema: JSONSchema): JSONSchema | null {
  if (isBooleanSchema(schema)) return null;
  if (schema.type !== "array") return null;

  return schema.items || null;
}

/**
 * Renames a property while preserving order in the object schema
 */
export function renameObjectProperty(
  schema: ObjectJSONSchema,
  oldName: string,
  newName: string,
  isPatternProperty = false,
): ObjectJSONSchema {
  const schemaProperty = isPatternProperty ? "patternProperties" : "properties";

  if (!isObjectSchema(schema) || !schema[schemaProperty]) return schema;

  const newSchema = copySchema(schema);
  const newProperties: Record<string, JSONSchema> = {};

  // Iterate through properties in order, replacing old key with new key
  for (const [key, value] of Object.entries(newSchema[schemaProperty])) {
    if (key === oldName) {
      newProperties[newName] = value;
    } else {
      newProperties[key] = value;
    }
  }

  newSchema[schemaProperty] = newProperties;

  // Update required array if the field name changed
  if (newSchema.required) {
    newSchema.required = newSchema.required.map((field) =>
      field === oldName ? newName : field,
    );
  }

  return newSchema;
}

/**
 * Checks if a schema has children
 */
export function hasChildren(schema: JSONSchema): boolean {
  if (!isObjectSchema(schema)) return false;

  if (schema.type === "object" && schema.properties) {
    return Object.keys(schema.properties).length > 0;
  }

  if (schema.type === "array" && schema.items && isObjectSchema(schema.items)) {
    return schema.items.type === "object" && !!schema.items.properties;
  }

  return false;
}

/**
 * Gets pattern properties from an object schema
 */
export function getSchemaPatternProperties(
  schema: JSONSchema,
): PatternProperty[] {
  if (!isObjectSchema(schema) || !schema.patternProperties) return [];

  return Object.entries(schema.patternProperties).map(
    ([pattern, propSchema]) => ({
      pattern,
      schema: propSchema,
    }),
  );
}

/**
 * Validates a regex pattern
 */
export function validateRegexPattern(pattern: string): {
  valid: boolean;
  error?: string;
} {
  if (!pattern || pattern.trim() === "") {
    return { valid: false, error: "Pattern cannot be empty" };
  }

  try {
    new RegExp(pattern);
    return { valid: true };
  } catch (e) {
    return { valid: false, error: `Invalid regex: ${(e as Error).message}` };
  }
}
