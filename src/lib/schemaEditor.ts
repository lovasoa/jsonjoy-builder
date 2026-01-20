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
): ObjectJSONSchema {
  if (!isObjectSchema(schema)) return schema;

  const newSchema = copySchema(schema);
  if (!newSchema.properties) {
    newSchema.properties = {};
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
): ObjectJSONSchema {
  if (!isObjectSchema(schema) || !schema.properties) return schema;

  const newSchema = copySchema(schema);
  const { [propertyName]: _, ...remainingProps } = newSchema.properties;
  newSchema.properties = remainingProps;

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
  const { type, description, validation } = field;
  if (isObjectSchema(validation)) {
    return {
      type,
      description,
      ...validation,
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
export function getSchemaProperties(schema: JSONSchema): Property[] {
  if (!isObjectSchema(schema) || !schema.properties) return [];

  const required = schema.required || [];

  return Object.entries(schema.properties).map(([name, propSchema]) => ({
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
): ObjectJSONSchema {
  if (!isObjectSchema(schema) || !schema.properties) return schema;

  const newSchema = copySchema(schema);
  const newProperties: Record<string, JSONSchema> = {};

  // Iterate through properties in order, replacing old key with new key
  for (const [key, value] of Object.entries(newSchema.properties)) {
    if (key === oldName) {
      newProperties[newName] = value;
    } else {
      newProperties[key] = value;
    }
  }

  newSchema.properties = newProperties;

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
 * Reorders properties in an object schema by moving one property to a new position
 */
export function reorderProperty(
  schema: ObjectJSONSchema,
  propertyName: string,
  newIndex: number,
): ObjectJSONSchema {
  if (!isObjectSchema(schema) || !schema.properties) return schema;

  const propertyNames = Object.keys(schema.properties);
  const currentIndex = propertyNames.indexOf(propertyName);

  if (currentIndex === -1 || currentIndex === newIndex) return schema;

  const newSchema = copySchema(schema);
  const newProperties: Record<string, JSONSchema> = {};

  // Remove the property from its current position
  const [movedName] = propertyNames.splice(currentIndex, 1);

  // Insert at the new position
  propertyNames.splice(newIndex, 0, movedName);

  // Rebuild properties object in the new order
  for (const name of propertyNames) {
    newProperties[name] = newSchema.properties?.[name];
  }

  newSchema.properties = newProperties;

  return newSchema;
}

/**
 * Moves a property from one position to another in an object schema
 */
export function moveProperty(
  schema: ObjectJSONSchema,
  fromName: string,
  toName: string,
  after: boolean = true,
): ObjectJSONSchema {
  if (!isObjectSchema(schema) || !schema.properties) return schema;

  const propertyNames = Object.keys(schema.properties);
  const fromIndex = propertyNames.indexOf(fromName);
  const toIndex = propertyNames.indexOf(toName);

  if (fromIndex === -1 || toIndex === -1) return schema;

  let newIndex = after ? toIndex + 1 : toIndex;

  // Adjust if moving forward
  if (fromIndex < newIndex) {
    newIndex--;
  }

  return reorderProperty(schema, fromName, newIndex);
}

/**
 * Moves a property from one schema to another
 */
export function movePropertyBetweenSchemas(
  sourceSchema: ObjectJSONSchema,
  targetSchema: ObjectJSONSchema,
  propertyName: string,
  newName: string,
  targetIndex: number,
): {
  updatedSource: ObjectJSONSchema;
  updatedTarget: ObjectJSONSchema;
} {
  if (!isObjectSchema(sourceSchema) || !sourceSchema.properties) {
    return { updatedSource: sourceSchema, updatedTarget: targetSchema };
  }

  if (!isObjectSchema(targetSchema)) {
    targetSchema = { type: "object", properties: {} };
  }

  if (!targetSchema.properties) {
    targetSchema.properties = {};
  }

  // Get the property from source
  const property = sourceSchema.properties[propertyName];
  const required = sourceSchema.required?.includes(propertyName);

  // Remove from source
  const updatedSource = removeObjectProperty(sourceSchema, propertyName);

  // Insert into target at the specified position
  const targetPropertyNames = Object.keys(targetSchema.properties);
  const newProperties: Record<string, JSONSchema> = {};

  // Add properties before the target index
  for (let i = 0; i < targetIndex && i < targetPropertyNames.length; i++) {
    newProperties[targetPropertyNames[i]] = targetSchema.properties[targetPropertyNames[i]];
  }

  // Add the moved property
  newProperties[newName] = property;

  // Add properties after the target index
  for (let i = targetIndex; i < targetPropertyNames.length; i++) {
    newProperties[targetPropertyNames[i]] = targetSchema.properties[targetPropertyNames[i]];
  }

  const updatedTarget = { ...targetSchema, properties: newProperties };

  // Update required status in target if needed
  if (required) {
    updatedTarget.required = [...(updatedTarget.required || []), newName];
  }

  return { updatedSource, updatedTarget };
}
