import type {
  JsonSchema,
  NewField,
  ObjectJsonSchema,
} from "../types/jsonSchema.ts";
import { isBooleanSchema, isObjectSchema } from "../types/jsonSchema.ts";

export type Property = {
  name: string;
  schema: JsonSchema;
  required: boolean;
};

export function copySchema<T extends JsonSchema>(schema: T): T {
  if (typeof structuredClone === "function") return structuredClone(schema);
  return JSON.parse(JSON.stringify(schema));
}

/**
 * Updates a property in an object schema
 */
export function updateObjectProperty(
  schema: ObjectJsonSchema,
  propertyName: string,
  propertySchema: JsonSchema,
): ObjectJsonSchema {
  return updateObjectSchemaEntry(
    schema,
    "properties",
    propertyName,
    propertySchema,
  );
}

export function updateObjectPatternProperty(
  schema: ObjectJsonSchema,
  propertyName: string,
  propertySchema: JsonSchema,
): ObjectJsonSchema {
  return updateObjectSchemaEntry(
    schema,
    "patternProperties",
    propertyName,
    propertySchema,
  );
}

function updateObjectSchemaEntry(
  schema: ObjectJsonSchema,
  schemaProperty: "properties" | "patternProperties",
  propertyName: string,
  propertySchema: JsonSchema,
): ObjectJsonSchema {
  if (!isObjectSchema(schema)) return schema;

  const newSchema = copySchema(schema);
  if (!newSchema[schemaProperty]) {
    newSchema[schemaProperty] = {};
  }

  newSchema[schemaProperty][propertyName] = propertySchema;
  return newSchema;
}

/**
 * Removes a property from an object schema
 */
export function removeObjectProperty(
  schema: ObjectJsonSchema,
  propertyName: string,
): ObjectJsonSchema {
  const newSchema = removeObjectSchemaEntry(schema, "properties", propertyName);

  // Also remove from required array if present
  if (newSchema.required) {
    newSchema.required = newSchema.required.filter(
      (name) => name !== propertyName,
    );
  }

  return newSchema;
}

export function removeObjectPatternProperty(
  schema: ObjectJsonSchema,
  propertyName: string,
): ObjectJsonSchema {
  return removeObjectSchemaEntry(schema, "patternProperties", propertyName);
}

function removeObjectSchemaEntry(
  schema: ObjectJsonSchema,
  schemaProperty: "properties" | "patternProperties",
  propertyName: string,
): ObjectJsonSchema {
  if (!isObjectSchema(schema) || !schema[schemaProperty]) return schema;

  const newSchema = copySchema(schema);
  const { [propertyName]: _, ...remainingProps } = newSchema[schemaProperty];
  if (Object.keys(remainingProps).length === 0) {
    delete newSchema[schemaProperty];
    return newSchema;
  }

  newSchema[schemaProperty] = remainingProps;
  return newSchema;
}

/**
 * Updates the 'required' status of a property
 */
export function updatePropertyRequired(
  schema: ObjectJsonSchema,
  propertyName: string,
  required: boolean,
): ObjectJsonSchema {
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
  schema: JsonSchema,
  itemsSchema: JsonSchema,
): JsonSchema {
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
export function createFieldSchema(field: NewField): JsonSchema {
  const { type, description, validation, additionalProperties } = field;

  if (type === "anyOf" || type === "oneOf" || type === "allOf") {
    const schema = validation || {
      [type]:
        type === "allOf"
          ? [{ type: "object" as const }]
          : [{ type: "string" as const }, { type: "number" as const }],
    };

    return {
      ...schema,
      description: description || undefined,
    };
  }

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
export function getSchemaProperties(schema: JsonSchema): Property[] {
  const required = isObjectSchema(schema) ? schema.required || [] : [];
  return getObjectSchemaEntries(schema, "properties").map((entry) =>
    propertyFromEntry(entry, required),
  );
}

export function getSchemaPatternProperties(schema: JsonSchema): Property[] {
  return getObjectSchemaEntries(schema, "patternProperties").map((entry) =>
    propertyFromEntry(entry),
  );
}

function getObjectSchemaEntries(
  schema: JsonSchema,
  schemaProperty: "properties" | "patternProperties",
): Array<[string, JsonSchema]> {
  if (!isObjectSchema(schema) || !schema[schemaProperty]) return [];
  return Object.entries(schema[schemaProperty]);
}

function propertyFromEntry(
  [name, propSchema]: [string, JsonSchema],
  required: string[] = [],
): Property {
  return {
    name,
    schema: propSchema,
    required: required.includes(name),
  };
}

/**
 * Gets the items schema from an array schema
 */
export function getArrayItemsSchema(schema: JsonSchema): JsonSchema | null {
  if (isBooleanSchema(schema)) return null;
  if (schema.type !== "array") return null;

  return schema.items || null;
}

/**
 * Renames a property while preserving order in the object schema
 */
export function renameObjectProperty(
  schema: ObjectJsonSchema,
  oldName: string,
  newName: string,
): ObjectJsonSchema {
  const newSchema = renameObjectSchemaEntry(
    schema,
    "properties",
    oldName,
    newName,
  );

  // Update required array if the field name changed
  if (newSchema.required) {
    newSchema.required = newSchema.required.map((field) =>
      field === oldName ? newName : field,
    );
  }

  return newSchema;
}

export function renameObjectPatternProperty(
  schema: ObjectJsonSchema,
  oldName: string,
  newName: string,
): ObjectJsonSchema {
  return renameObjectSchemaEntry(schema, "patternProperties", oldName, newName);
}

function renameObjectSchemaEntry(
  schema: ObjectJsonSchema,
  schemaProperty: "properties" | "patternProperties",
  oldName: string,
  newName: string,
): ObjectJsonSchema {
  if (!isObjectSchema(schema) || !schema[schemaProperty]) return schema;

  const newSchema = copySchema(schema);
  const newProperties: Record<string, JsonSchema> = {};

  // Iterate through properties in order, replacing old key with new key
  for (const [key, value] of Object.entries(newSchema[schemaProperty])) {
    if (key === oldName) {
      newProperties[newName] = value;
    } else {
      newProperties[key] = value;
    }
  }

  newSchema[schemaProperty] = newProperties;
  return newSchema;
}

/**
 * Checks if a schema has children
 */
export function hasChildren(schema: JsonSchema): boolean {
  if (!isObjectSchema(schema)) return false;

  if (schema.type === "object" && schema.properties) {
    return Object.keys(schema.properties).length > 0;
  }

  if (schema.type === "array" && schema.items && isObjectSchema(schema.items)) {
    return schema.items.type === "object" && !!schema.items.properties;
  }

  return false;
}
