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
 *
 * NOTE: Prefer using higher-level helpers that operate on the full root
 * schema and JSON pointer style paths when moving fields across containers
 * in the visual editor. This function is kept for potential library
 * consumers but is no longer used by the drag-and-drop implementation.
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
    newProperties[targetPropertyNames[i]] =
      targetSchema.properties[targetPropertyNames[i]];
  }

  // Add the moved property
  newProperties[newName] = property;

  // Add properties after the target index
  for (let i = targetIndex; i < targetPropertyNames.length; i++) {
    newProperties[targetPropertyNames[i]] =
      targetSchema.properties[targetPropertyNames[i]];
  }

  const updatedTarget = { ...targetSchema, properties: newProperties };

  // Update required status in target if needed
  if (required) {
    updatedTarget.required = [...(updatedTarget.required || []), newName];
  }

  return { updatedSource, updatedTarget };
}

/**
 * Moves a field between (or within) object containers inside a root schema,
 * identified by paths to the source and target object schemas.
 */
export interface FieldMoveLocation {
  /** Path to the object schema that owns the field. */
  parentPath: string[];
  /** The field name (property key) within that object. */
  name: string;
}

export interface FieldDropTarget {
  /** Path to the object schema that will receive the field. */
  parentPath: string[];
  /**
   * The anchor field name the drop is relative to. If null, the field is
   * appended to the end of the target container.
   */
  anchorName: string | null;
  /**
   * Drop position relative to the anchor: before ("top") or after
   * ("bottom"). If null, the field is appended to the end.
   */
  position: "top" | "bottom" | null;
}

function getAtPath<T = JSONSchema>(
  schema: JSONSchema,
  path: string[],
): T | null {
  let current = schema;
  for (const segment of path) {
    if (current == null) return null;
    current = current[segment];
  }
  return current as T;
}

function setAtPath<T = JSONSchema>(
  schema: JSONSchema,
  path: string[],
  value: T,
): JSONSchema {
  if (path.length === 0) {
    return value;
  }

  const newSchema = copySchema(schema);
  let current = newSchema;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    current[key] = copySchema(current[key] ?? {});
    current = current[key];
  }
  current[path[path.length - 1]] = value;
  return newSchema;
}

/**
 * Moves a field from one object container to another inside a root schema.
 *
 * - If source and target parent paths are equal, this performs a reordering
 *   using `moveProperty`.
 * - Otherwise, the field is removed from the source object and inserted into
 *   the target object at the requested position.
 */
export function moveFieldInSchema(
  rootSchema: JSONSchema,
  source: FieldMoveLocation,
  target: FieldDropTarget,
): JSONSchema {
  const sourceObject = getAtPath<ObjectJSONSchema>(
    rootSchema,
    source.parentPath,
  );
  const targetObject = getAtPath<ObjectJSONSchema>(
    rootSchema,
    target.parentPath,
  );

  if (!sourceObject || !isObjectSchema(sourceObject)) return rootSchema;
  if (!targetObject || !isObjectSchema(targetObject)) return rootSchema;
  if (!sourceObject.properties || !targetObject.properties) return rootSchema;

  // Same container: use moveProperty and honor the requested anchor
  if (
    source.parentPath.length === target.parentPath.length &&
    source.parentPath.every((seg, idx) => seg === target.parentPath[idx])
  ) {
    const propertyNames = Object.keys(sourceObject.properties);

    // If no anchor, move to end of the container
    if (!target.anchorName) {
      const newIndex = propertyNames.length - 1;
      const reordered = reorderProperty(sourceObject, source.name, newIndex);
      return setAtPath(rootSchema, source.parentPath, reordered);
    }

    if (!propertyNames.includes(target.anchorName)) {
      return rootSchema;
    }

    const after = target.position !== "top";
    const moved = moveProperty(
      sourceObject,
      source.name,
      target.anchorName,
      after,
    );
    return setAtPath(rootSchema, source.parentPath, moved);
  }

  // Cross-container move
  const property = sourceObject.properties[source.name];
  if (!property) return rootSchema;
  const isRequired = sourceObject.required?.includes(source.name) ?? false;

  // Remove from source container
  const updatedSource = removeObjectProperty(sourceObject, source.name);
  const intermediateRoot = setAtPath(
    rootSchema,
    source.parentPath,
    updatedSource,
  );

  // Re-read target object from the updated root in case source and target
  // share structural parents.
  const targetFromUpdatedRoot = getAtPath<ObjectJSONSchema>(
    intermediateRoot,
    target.parentPath,
  );
  if (!targetFromUpdatedRoot || !isObjectSchema(targetFromUpdatedRoot)) {
    return intermediateRoot;
  }

  const targetProps = targetFromUpdatedRoot.properties || {};
  const existingNames = Object.keys(targetProps);

  // Determine the base name to use in the new container, avoiding collisions
  let newName = source.name;
  let counter = 1;
  while (existingNames.includes(newName)) {
    newName = `${source.name}_${counter}`;
    counter++;
  }

  // Insert at the desired index relative to the anchor.
  const propertyNames = Object.keys(targetProps);
  let insertIndex = propertyNames.length;

  if (target.anchorName && propertyNames.includes(target.anchorName)) {
    const anchorIndex = propertyNames.indexOf(target.anchorName);
    insertIndex =
      target.position === "top" || target.position == null
        ? anchorIndex
        : anchorIndex + 1;
  }

  const newTargetProps: Record<string, JSONSchema> = {};

  for (let i = 0; i < insertIndex && i < propertyNames.length; i++) {
    const key = propertyNames[i];
    newTargetProps[key] = targetProps[key];
  }

  newTargetProps[newName] = property;

  for (let i = insertIndex; i < propertyNames.length; i++) {
    const key = propertyNames[i];
    newTargetProps[key] = targetProps[key];
  }

  const updatedTarget: ObjectJSONSchema = {
    ...targetFromUpdatedRoot,
    properties: newTargetProps,
  };

  if (isRequired) {
    updatedTarget.required = [...(updatedTarget.required || []), newName];
  }

  return setAtPath(intermediateRoot, target.parentPath, updatedTarget);
}
