/**
 * Schema Migrator Utility
 * Automatically converts JSON Schemas from older drafts to Draft 2020-12
 * Supports migration from Draft-07 and Draft 2019-09
 */

import type { JSONSchema } from "../types/jsonSchema.ts";
import type { JSONSchemaDraft } from "./schema-version.ts";
import { detectSchemaVersion, getSchemaURI } from "./schema-version.ts";

/**
 * Main migration function - converts any schema to Draft 2020-12
 */
export function migrateToSchema202012(
  schema: JSONSchema,
  fromDraft?: JSONSchemaDraft
): JSONSchema {
  // Auto-detect source draft if not provided
  const sourceDraft = fromDraft || detectSchemaVersion(schema);
  
  // Already 2020-12? Return as-is
  if (sourceDraft === '2020-12') {
    return schema;
  }
  
  let migrated: JSONSchema = JSON.parse(JSON.stringify(schema)); // Deep clone
  
  // Apply version-specific migrations
  if (sourceDraft === 'draft-07') {
    migrated = migrateFromDraft07(migrated);
  } else if (sourceDraft === '2019-09') {
    migrated = migrateFrom201909(migrated);
  }
  
  // Set the correct $schema URI
  if (typeof migrated === 'object' && migrated !== null) {
    migrated.$schema = getSchemaURI('2020-12');
  }
  
  return migrated;
}

/**
 * Migrate from Draft-07 to 2020-12
 */
export function migrateFromDraft07(schema: JSONSchema): JSONSchema {
  let migrated = JSON.parse(JSON.stringify(schema)); // Deep clone
  
  // 1. Replace 'definitions' with '$defs'
  if (migrated.definitions) {
    migrated.$defs = migrated.definitions;
    delete migrated.definitions;
    
    // Update all $ref pointers
    migrated = updateReferences(migrated, '#/definitions/', '#/$defs/');
  }
  
  // 2. Convert array form of 'items' to 'prefixItems'
  migrated = convertArrayItemsToPrefixItems(migrated);
  
  // 3. Recursively migrate nested schemas
  migrated = recursivelyMigrateNested(migrated, migrateFromDraft07);
  
  return migrated;
}

/**
 * Migrate from Draft 2019-09 to 2020-12
 */
export function migrateFrom201909(schema: JSONSchema): JSONSchema {
  let migrated = JSON.parse(JSON.stringify(schema)); // Deep clone
  
  // 1. Replace $recursiveRef with $dynamicRef
  if (migrated.$recursiveRef) {
    // Convert $recursiveRef: "#" to $dynamicRef: "#anchor"
    const anchorName = migrated.$recursiveAnchor || "node";
    migrated.$dynamicRef = migrated.$recursiveRef === "#" 
      ? `#${anchorName}` 
      : migrated.$recursiveRef;
    delete migrated.$recursiveRef;
  }
  
  // 2. Replace $recursiveAnchor with $dynamicAnchor
  if (migrated.$recursiveAnchor !== undefined) {
    if (migrated.$recursiveAnchor === true) {
      migrated.$dynamicAnchor = "node"; // Default anchor name
    } else {
      migrated.$dynamicAnchor = String(migrated.$recursiveAnchor);
    }
    delete migrated.$recursiveAnchor;
  }
  
  // 3. Convert array form of 'items' to 'prefixItems' (same as Draft-07)
  migrated = convertArrayItemsToPrefixItems(migrated);
  
  // 4. Recursively migrate nested schemas
  migrated = recursivelyMigrateNested(migrated, migrateFrom201909);
  
  return migrated;
}

/**
 * Convert array form of 'items' to 'prefixItems'
 * Draft-07/2019-09: items: [...schemas], additionalItems: false
 * Draft 2020-12: prefixItems: [...schemas], items: false
 */
function convertArrayItemsToPrefixItems(schema: JSONSchema): JSONSchema {
  if (!schema || typeof schema !== 'object') {
    return schema;
  }
  
  const migrated = { ...schema };
  
  // Check if this schema has array-form items (tuple validation)
  if (Array.isArray(migrated.items)) {
    // Convert to prefixItems
    migrated.prefixItems = migrated.items;
    
    // Handle additionalItems
    if ('additionalItems' in migrated) {
      if (migrated.additionalItems === false) {
        migrated.items = false;
      } else if (migrated.additionalItems === true) {
        delete migrated.items; // Allow any additional items
      } else if (typeof migrated.additionalItems === 'object') {
        migrated.items = migrated.additionalItems;
      }
      delete migrated.additionalItems;
    } else {
      // No additionalItems specified - default is to allow any
      delete migrated.items;
    }
  }
  
  return migrated;
}

/**
 * Update all $ref pointers from old path to new path
 */
function updateReferences(
  schema: JSONSchema,
  oldPath: string,
  newPath: string
): JSONSchema {
  if (!schema || typeof schema !== 'object') {
    return schema;
  }
  
  const migrated: any = Array.isArray(schema) ? [...schema] : { ...schema };
  
  // Update $ref if it uses the old path
  if (typeof migrated.$ref === 'string' && migrated.$ref.startsWith(oldPath)) {
    migrated.$ref = migrated.$ref.replace(oldPath, newPath);
  }
  
  // Recursively update all nested objects
  for (const key in migrated) {
    if (migrated[key] && typeof migrated[key] === 'object') {
      migrated[key] = updateReferences(migrated[key], oldPath, newPath);
    }
  }
  
  return migrated;
}

/**
 * Recursively apply migration to all nested schemas
 */
function recursivelyMigrateNested(
  schema: JSONSchema,
  migrateFn: (s: JSONSchema) => JSONSchema
): JSONSchema {
  if (!schema || typeof schema !== 'object') {
    return schema;
  }
  
  const migrated: any = { ...schema };
  
  // Keywords that can contain nested schemas
  const schemaKeywords = [
    'properties',
    'patternProperties',
    'additionalProperties',
    'items',
    'prefixItems',
    'contains',
    'if',
    'then',
    'else',
    'allOf',
    'anyOf',
    'oneOf',
    'not',
    'dependentSchemas',
    '$defs',
    'definitions', // For backwards compatibility during migration
    'unevaluatedProperties',
    'unevaluatedItems'
  ];
  
  for (const keyword of schemaKeywords) {
    if (keyword in migrated && migrated[keyword]) {
      const value = migrated[keyword];
      
      if (Array.isArray(value)) {
        // Array of schemas (allOf, anyOf, oneOf, prefixItems)
        migrated[keyword] = value.map((item) =>
          typeof item === 'object' ? migrateFn(item) : item
        );
      } else if (typeof value === 'object') {
        if (keyword === 'properties' || keyword === 'patternProperties' || 
            keyword === 'dependentSchemas' || keyword === '$defs' || keyword === 'definitions') {
          // Object with schema values
          const migratedObj: any = {};
          for (const key in value) {
            migratedObj[key] = migrateFn(value[key]);
          }
          migrated[keyword] = migratedObj;
        } else {
          // Single schema (additionalProperties, items, not, if, then, else, etc.)
          migrated[keyword] = migrateFn(value);
        }
      }
    }
  }
  
  return migrated;
}

/**
 * Validate that migration was successful
 */
export function validateMigration(
  original: JSONSchema,
  migrated: JSONSchema
): { success: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // Type guard for object schemas
  if (typeof migrated !== 'object' || migrated === null || typeof migrated === 'boolean') {
    return { success: true, warnings };
  }
  
  // Cast to any for legacy keyword access
  const migratedAny = migrated as any;
  
  // Check if $schema was updated
  if (!migrated.$schema || !migrated.$schema.includes('2020-12')) {
    warnings.push('$schema URI not updated to 2020-12');
  }
  
  // Check for leftover old keywords
  if (migratedAny.definitions) {
    warnings.push('Old "definitions" keyword still present (should be $defs)');
  }
  
  if (migratedAny.additionalItems !== undefined) {
    warnings.push('Old "additionalItems" keyword still present (should be items)');
  }
  
  if (migratedAny.$recursiveRef || migratedAny.$recursiveAnchor) {
    warnings.push('Old recursive keywords still present (should be $dynamic*)');
  }
  
  // Check for array-form items
  if (Array.isArray(migrated.items)) {
    warnings.push('Array form of "items" still present (should be prefixItems)');
  }
  
  return {
    success: warnings.length === 0,
    warnings
  };
}

/**
 * Get a summary of what will be migrated
 */
export function getMigrationSummary(
  schema: JSONSchema,
  fromDraft?: JSONSchemaDraft
): {
  sourceDraft: JSONSchemaDraft;
  targetDraft: '2020-12';
  changes: string[];
} {
  const sourceDraft = fromDraft || detectSchemaVersion(schema);
  const changes: string[] = [];
  
  if (sourceDraft === '2020-12') {
    changes.push('Schema is already Draft 2020-12 - no migration needed');
    return { sourceDraft, targetDraft: '2020-12', changes };
  }
  
  // Type guard
  if (typeof schema !== 'object' || schema === null || typeof schema === 'boolean') {
    changes.push('No structural changes needed - only $schema update');
    return { sourceDraft, targetDraft: '2020-12', changes };
  }
  
  // Cast to any for legacy keyword access
  const schemaAny = schema as any;
  
  // Check for Draft-07 specific changes
  if (sourceDraft === 'draft-07') {
    if (schemaAny.definitions) {
      changes.push('Convert "definitions" → "$defs"');
      changes.push(`Update ${Object.keys(schemaAny.definitions).length} definition references`);
    }
  }
  
  // Check for 2019-09 specific changes
  if (sourceDraft === '2019-09') {
    if (schemaAny.$recursiveRef) {
      changes.push('Convert "$recursiveRef" → "$dynamicRef"');
    }
    if (schemaAny.$recursiveAnchor !== undefined) {
      changes.push('Convert "$recursiveAnchor" → "$dynamicAnchor"');
    }
  }
  
  // Check for array items conversion (both drafts)
  if (Array.isArray(schema.items)) {
    changes.push(`Convert array "items" → "prefixItems" (${schema.items.length} positions)`);
    if (schemaAny.additionalItems !== undefined) {
      changes.push('Convert "additionalItems" → "items"');
    }
  }
  
  // Update $schema
  changes.push('Update $schema URI to Draft 2020-12');
  
  if (changes.length === 1) {
    changes.push('No structural changes needed - only $schema update');
  }
  
  return {
    sourceDraft,
    targetDraft: '2020-12',
    changes
  };
}

/**
 * Migrate and provide detailed report
 */
export function migrateWithReport(
  schema: JSONSchema,
  fromDraft?: JSONSchemaDraft
): {
  original: JSONSchema;
  migrated: JSONSchema;
  summary: ReturnType<typeof getMigrationSummary>;
  validation: ReturnType<typeof validateMigration>;
} {
  const summary = getMigrationSummary(schema, fromDraft);
  const migrated = migrateToSchema202012(schema, fromDraft);
  const validation = validateMigration(schema, migrated);
  
  return {
    original: schema,
    migrated,
    summary,
    validation
  };
}
