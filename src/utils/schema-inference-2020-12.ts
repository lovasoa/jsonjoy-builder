/**
 * Enhanced Schema Inference for JSON Schema Draft 2020-12
 * Adds support for prefixItems (tuple detection) and other 2020-12 features
 */

import type { JSONSchema } from "../types/jsonSchema.ts";
import { inferSchema as inferBase } from "../lib/schema-inference.ts";
import { asObjectSchema } from "../types/jsonSchema.ts";

/**
 * Detects if an array should be treated as a tuple
 * (heterogeneous types across positions)
 */
function isTupleArray(arr: unknown[]): boolean {
  if (arr.length === 0) return false;
  if (arr.length === 1) return false; // Single item not a tuple

  // Check if items have different types
  const types = arr.map((item) => {
    if (item === null) return "null";
    if (Array.isArray(item)) return "array";
    return typeof item;
  });

  const uniqueTypes = new Set(types);
  
  // If we have multiple different types, it's likely a tuple
  return uniqueTypes.size > 1;
}

/**
 * Converts an inferred schema to 2020-12 format
 * Replaces definitions with $defs if present
 */
export function convertToSchema202012(schema: JSONSchema): JSONSchema {
  if (typeof schema === "boolean") {
    return schema;
  }

  const objSchema = asObjectSchema(schema);
  const converted: Record<string, unknown> = { ...objSchema };

  // Replace definitions with $defs (2020-12)
  if ("definitions" in objSchema && objSchema.definitions) {
    converted.$defs = objSchema.definitions;
    delete converted.definitions;
  }

  // Recursively convert nested schemas
  if (objSchema.properties) {
    converted.properties = Object.fromEntries(
      Object.entries(objSchema.properties).map(([key, value]) => [
        key,
        convertToSchema202012(value),
      ]),
    );
  }

  if (objSchema.items && typeof objSchema.items === "object") {
    converted.items = convertToSchema202012(objSchema.items);
  }

  if (objSchema.allOf) {
    converted.allOf = objSchema.allOf.map(convertToSchema202012);
  }

  if (objSchema.anyOf) {
    converted.anyOf = objSchema.anyOf.map(convertToSchema202012);
  }

  if (objSchema.oneOf) {
    converted.oneOf = objSchema.oneOf.map(convertToSchema202012);
  }

  if (objSchema.not) {
    converted.not = convertToSchema202012(objSchema.not);
  }

  return converted as JSONSchema;
}

/**
 * Infers a JSON Schema from data with 2020-12 features
 * Detects tuples and uses prefixItems instead of items array
 */
export function inferSchema202012(data: unknown): JSONSchema {
  // Start with base inference
  const baseSchema = inferBase(data);
  
  // If it's an array, check if it should be a tuple
  if (Array.isArray(data) && isTupleArray(data)) {
    // Create tuple schema with prefixItems
    return {
      type: "array",
      prefixItems: data.map((item) => inferSchema202012(item)),
      items: false, // No additional items allowed for strict tuples
    };
  }

  // For non-tuple arrays or other types, convert to 2020-12
  return convertToSchema202012(baseSchema);
}

/**
 * Creates a full 2020-12 JSON Schema document from a JSON object
 * This is the main entry point for schema generation
 */
export function createSchema202012FromJson(jsonObject: unknown): JSONSchema {
  const inferredSchema = inferSchema202012(jsonObject);
  const rootSchema = asObjectSchema(inferredSchema);

  const finalSchema: Record<string, unknown> = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "Generated Schema",
    description: "Generated from JSON data using Draft 2020-12",
  };

  if (rootSchema.type === "object" || rootSchema.properties) {
    finalSchema.type = "object";
    finalSchema.properties = rootSchema.properties;
    if (rootSchema.required) finalSchema.required = rootSchema.required;
  } else if (rootSchema.type === "array" || rootSchema.items || rootSchema.prefixItems) {
    finalSchema.type = "array";
    
    // Use prefixItems if present (tuple)
    if (rootSchema.prefixItems) {
      finalSchema.prefixItems = rootSchema.prefixItems;
      if (rootSchema.items !== undefined) {
        finalSchema.items = rootSchema.items;
      }
    } else if (rootSchema.items) {
      finalSchema.items = rootSchema.items;
    }
    
    if (rootSchema.minItems !== undefined) {
      finalSchema.minItems = rootSchema.minItems;
    }
    if (rootSchema.maxItems !== undefined) {
      finalSchema.maxItems = rootSchema.maxItems;
    }
  } else if (rootSchema.type) {
    // Handle primitive types at root
    finalSchema.type = "object";
    finalSchema.properties = { value: rootSchema };
    finalSchema.required = ["value"];
    finalSchema.title = "Generated Schema (Primitive Root)";
    finalSchema.description = "Input was a primitive value, wrapped in an object.";
  } else {
    finalSchema.type = "object";
  }

  return finalSchema as JSONSchema;
}

/**
 * Helper to infer base schema (re-exported from base inference)
 */
export { inferSchema as inferBaseSchema } from "../lib/schema-inference.ts";