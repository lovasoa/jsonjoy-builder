/**
 * JSON Schema Draft 2020-12 Type Definitions
 * 
 * This file provides a type alias for JSON Schema Draft 2020-12.
 * The actual type definitions are in jsonSchema.ts which already
 * supports all 2020-12 keywords.
 * 
 * @see jsonSchema.ts for complete type definitions
 */

import type { JSONSchema } from "./jsonSchema.ts";

/**
 * JSON Schema Draft 2020-12 type
 * This is an alias to the main JSONSchema type which already includes
 * all JSON Schema 2020-12 keywords:
 * 
 * New in 2020-12:
 * - $dynamicRef - Dynamic schema references
 * - $dynamicAnchor - Dynamic anchor points
 * - prefixItems - Tuple validation (replaces array form of items)
 * - items (new behavior) - Schema for remaining array items after prefixItems
 * - $defs - Schema definitions (replaces definitions from draft-07)
 * - unevaluatedProperties - Improved unevaluated properties handling
 * - unevaluatedItems - Improved unevaluated items handling
 * - dependentSchemas - Property-dependent schemas
 * - $vocabulary - Vocabulary declarations
 * 
 * Also includes all standard keywords:
 * - Core: $schema, $id, $ref, $anchor, $comment
 * - Type: type, const, enum
 * - Composition: allOf, anyOf, oneOf, not
 * - Conditional: if, then, else
 * - String: minLength, maxLength, pattern, format, contentEncoding, contentMediaType, contentSchema
 * - Number: minimum, maximum, exclusiveMinimum, exclusiveMaximum, multipleOf
 * - Array: minItems, maxItems, uniqueItems, contains, minContains, maxContains
 * - Object: properties, patternProperties, additionalProperties, required, minProperties, maxProperties, dependentRequired
 * - Metadata: title, description, default, deprecated, readOnly, writeOnly, examples
 */
export type JSONSchema202012 = JSONSchema;

/**
 * Re-export the base JSONSchema type for convenience
 */
export type { JSONSchema } from "./jsonSchema.ts";

/**
 * Export utility functions for working with JSON Schema
 */
export { isBooleanSchema, isObjectSchema, asObjectSchema, getSchemaDescription, withObjectSchema } from "./jsonSchema.ts";
export type { ObjectJSONSchema, SchemaType, NewField, SchemaEditorState } from "./jsonSchema.ts";