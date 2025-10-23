/**
 * JSON Schema version detection and management utilities
 * Supports JSON Schema Draft-07, 2019-09, and 2020-12
 */

import type { JSONSchema } from "../types/jsonSchema.ts";

export type JSONSchemaDraft = "draft-07" | "2019-09" | "2020-12";

/**
 * Detects the JSON Schema draft version from a schema object
 * @param schema - The JSON Schema to analyze
 * @returns The detected draft version
 */
export function detectSchemaVersion(schema: JSONSchema): JSONSchemaDraft {
  // If schema is boolean, assume latest draft
  if (typeof schema === "boolean") {
    return "2020-12";
  }

  // Check $schema URI if present
  if (schema.$schema) {
    if (schema.$schema.includes("draft-07")) {
      return "draft-07";
    }
    if (schema.$schema.includes("2019-09")) {
      return "2019-09";
    }
    if (schema.$schema.includes("2020-12")) {
      return "2020-12";
    }
  }

  // Check for 2020-12 specific keywords
  if (schema.$dynamicRef || schema.$dynamicAnchor) {
    return "2020-12";
  }

  // Check for 2019-09 specific keywords
  if ("$recursiveRef" in schema || "$recursiveAnchor" in schema) {
    return "2019-09";
  }

  // Check for prefixItems (2020-12) vs items array (draft-07)
  if (schema.prefixItems && Array.isArray(schema.prefixItems)) {
    return "2020-12";
  }

  // Check for unevaluatedProperties/Items as primary indicators
  if (schema.unevaluatedProperties !== undefined || schema.unevaluatedItems !== undefined) {
    return "2020-12";
  }

  // Check for dependentSchemas (2020-12) vs dependencies (draft-07)
  if (schema.dependentSchemas) {
    return "2020-12";
  }

  // Check for definitions (draft-07) vs $defs (2020-12)
  if ("definitions" in schema) {
    return "draft-07";
  }

  if (schema.$defs) {
    return "2020-12";
  }

  // Default to 2020-12 if no clear indicators
  return "2020-12";
}

/**
 * Gets the $schema URI for a given draft version
 * @param draft - The draft version
 * @returns The $schema URI string
 */
export function getSchemaURI(draft: JSONSchemaDraft): string {
  switch (draft) {
    case "draft-07":
      return "https://json-schema.org/draft-07/schema";
    case "2019-09":
      return "https://json-schema.org/draft/2019-09/schema";
    case "2020-12":
      return "https://json-schema.org/draft/2020-12/schema";
    default:
      return "https://json-schema.org/draft/2020-12/schema";
  }
}

/**
 * Checks if a schema is compatible with a specific draft version
 * @param schema - The JSON Schema to check
 * @param draft - The target draft version
 * @returns True if compatible, false otherwise
 */
export function isCompatibleWithDraft(
  schema: JSONSchema,
  draft: JSONSchemaDraft,
): boolean {
  if (typeof schema === "boolean") {
    return true; // Boolean schemas are compatible with all drafts
  }

  switch (draft) {
    case "draft-07":
      // Draft-07 doesn't support these keywords
      return (
        !schema.$dynamicRef &&
        !schema.$dynamicAnchor &&
        !schema.prefixItems &&
        !schema.dependentSchemas &&
        !schema.unevaluatedProperties &&
        !schema.unevaluatedItems
      );

    case "2019-09":
      // 2019-09 doesn't support these keywords
      return (
        !schema.$dynamicRef &&
        !schema.$dynamicAnchor &&
        !schema.prefixItems
      );

    case "2020-12":
      // 2020-12 supports all keywords, check for deprecated ones
      return (
        !("$recursiveRef" in schema) &&
        !("$recursiveAnchor" in schema) &&
        !("definitions" in schema)
      );

    default:
      return true;
  }
}

/**
 * Gets a human-readable name for a draft version
 * @param draft - The draft version
 * @returns Human-readable name
 */
export function getDraftDisplayName(draft: JSONSchemaDraft): string {
  switch (draft) {
    case "draft-07":
      return "Draft 07";
    case "2019-09":
      return "Draft 2019-09";
    case "2020-12":
      return "Draft 2020-12 (Latest)";
    default:
      return "Unknown";
  }
}

/**
 * Gets all supported draft versions
 * @returns Array of supported draft versions
 */
export function getSupportedDrafts(): JSONSchemaDraft[] {
  return ["draft-07", "2019-09", "2020-12"];
}