/**
 * Multi-draft JSON Schema Validator
 * Supports JSON Schema Draft-07, 2019-09, and 2020-12
 */

import Ajv from "ajv";
import Ajv2019 from "ajv/dist/2019.js";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import type { JSONSchema } from "../types/jsonSchema.ts";
import type { JSONSchemaDraft } from "./schema-version.ts";
import { detectSchemaVersion, getSchemaURI } from "./schema-version.ts";

export interface ValidationError {
  path: string;
  message: string;
  line?: number;
  column?: number;
}

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
}

/**
 * Creates an Ajv validator instance for the specified JSON Schema draft
 * @param draft - The draft version to create a validator for (default: "2020-12")
 * @returns Configured Ajv instance
 */
export function createValidator(draft: JSONSchemaDraft = "2020-12") {
  let ajv;

  switch (draft) {
    case "2020-12":
      ajv = new Ajv2020({
        strict: false,
        allErrors: true,
        verbose: true,
        validateSchema: false,
        validateFormats: false,
      });
      break;

    case "2019-09":
      ajv = new Ajv2019({
        strict: false,
        allErrors: true,
        verbose: true,
        validateSchema: false,
        validateFormats: false,
      });
      break;

    case "draft-07":
      ajv = new Ajv({
        strict: false,
        allErrors: true,
        verbose: true,
        validateSchema: false,
        validateFormats: false,
      });
      break;

    default:
      // Default to 2020-12 if unknown draft
      ajv = new Ajv2020({
        strict: false,
        allErrors: true,
        verbose: true,
        validateSchema: false,
        validateFormats: false,
      });
  }

  // Add format validation support
  addFormats(ajv);

  return ajv;
}

/**
 * Validates data against a JSON Schema using the appropriate draft validator
 * @param schema - The JSON Schema to validate against
 * @param data - The data to validate
 * @param draft - Optional draft version (auto-detected if not provided)
 * @returns Validation result
 */
export function validateSchema(
  schema: JSONSchema,
  data: unknown,
  draft?: JSONSchemaDraft,
): ValidationResult {
  try {
    // Auto-detect draft version if not provided
    const draftVersion = draft || detectSchemaVersion(schema);

    // Create appropriate validator
    const ajv = createValidator(draftVersion);

    // Compile and validate
    const validate = ajv.compile(schema);
    const valid = validate(data);

    if (!valid) {
      const errors =
        validate.errors?.map((error) => ({
          path: error.instancePath || "/",
          message: error.message || "Unknown error",
        })) || [];

      return {
        valid: false,
        errors,
      };
    }

    return {
      valid: true,
      errors: [],
    };
  } catch (error) {
    return {
      valid: false,
      errors: [
        {
          path: "/",
          message: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}

/**
 * Validates a schema itself (meta-validation)
 * @param schema - The schema to validate
 * @param draft - The draft version to validate against
 * @returns True if schema is valid, false otherwise
 */
export function validateSchemaStructure(
  schema: JSONSchema,
  draft: JSONSchemaDraft = "2020-12",
): boolean {
  try {
    const ajv = createValidator(draft);
    
    // Get meta-schema for the draft version
    const metaSchemaURI = getSchemaURI(draft);
    
    // Validate the schema against the meta-schema
    const validate = ajv.getSchema(metaSchemaURI);
    
    if (validate) {
      return validate(schema) as boolean;
    }
    
    // If no meta-schema available, try basic compilation
    ajv.compile(schema);
    return true;
  } catch {
    return false;
  }
}

/**
 * Gets validator version information
 * @param draft - The draft version
 * @returns Version information object
 */
export function getValidatorInfo(draft: JSONSchemaDraft) {
  return {
    draft,
    ajvVersion: "8.17.1",
    schemaURI: getSchemaURI(draft),
    supports: {
      prefixItems: draft === "2020-12",
      dynamicRef: draft === "2020-12",
      dependentSchemas: draft === "2020-12" || draft === "2019-09",
      unevaluatedProperties: draft === "2020-12" || draft === "2019-09",
      if_then_else: true, // All drafts since draft-07
    },
  };
}