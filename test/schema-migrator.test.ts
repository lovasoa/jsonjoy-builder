/**
 * Schema Migrator Tests
 * Tests automatic migration from Draft-07 and 2019-09 to 2020-12
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  migrateToSchema202012,
  migrateFromDraft07,
  migrateFrom201909,
  getMigrationSummary,
  validateMigration
} from '../src/utils/schema-migrator.ts';

describe('Schema Migrator', () => {
  describe('Draft-07 to 2020-12 Migration', () => {
    it('should convert definitions to $defs', () => {
      const draft07Schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          user: { $ref: '#/definitions/User' }
        },
        definitions: {
          User: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' }
            }
          }
        }
      };

      const migrated = migrateFromDraft07(draft07Schema);

      assert.ok(migrated.$defs, 'Should have $defs');
      assert.strictEqual(migrated.definitions, undefined, 'Should not have definitions');
      assert.strictEqual(migrated.$defs.User.properties.name.type, 'string');
      assert.strictEqual(
        migrated.properties.user.$ref,
        '#/$defs/User',
        'Should update $ref to use $defs'
      );
    });

    it('should convert array items to prefixItems', () => {
      const draft07Schema = {
        type: 'array',
        items: [
          { type: 'string' },
          { type: 'number' }
        ],
        additionalItems: false
      };

      const migrated = migrateFromDraft07(draft07Schema);

      assert.ok(migrated.prefixItems, 'Should have prefixItems');
      assert.ok(Array.isArray(migrated.prefixItems), 'prefixItems should be array');
      assert.strictEqual(migrated.prefixItems.length, 2);
      assert.strictEqual(migrated.prefixItems[0].type, 'string');
      assert.strictEqual(migrated.prefixItems[1].type, 'number');
      assert.strictEqual(migrated.items, false, 'items should be false when additionalItems was false');
      assert.strictEqual(migrated.additionalItems, undefined, 'Should not have additionalItems');
    });

    it('should handle additionalItems schema', () => {
      const draft07Schema = {
        type: 'array',
        items: [
          { type: 'string' }
        ],
        additionalItems: { type: 'number' }
      };

      const migrated = migrateFromDraft07(draft07Schema);

      assert.ok(migrated.prefixItems);
      assert.deepStrictEqual(migrated.items, { type: 'number' });
      assert.strictEqual(migrated.additionalItems, undefined);
    });

    it('should update $schema URI', () => {
      const draft07Schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object'
      };

      const migrated = migrateToSchema202012(draft07Schema, 'draft-07');

      assert.strictEqual(
        migrated.$schema,
        'https://json-schema.org/draft/2020-12/schema',
        'Should update to 2020-12 URI'
      );
    });
  });

  describe('2019-09 to 2020-12 Migration', () => {
    it('should convert $recursiveRef to $dynamicRef', () => {
      const schema201909 = {
        $schema: 'https://json-schema.org/draft/2019-09/schema',
        $id: 'https://example.com/tree',
        $recursiveAnchor: true,
        type: 'object',
        properties: {
          value: { type: 'number' },
          children: {
            type: 'array',
            items: { $recursiveRef: '#' }
          }
        }
      };

      const migrated = migrateFrom201909(schema201909);

      assert.strictEqual(migrated.$recursiveAnchor, undefined, 'Should not have $recursiveAnchor');
      assert.strictEqual(migrated.$dynamicAnchor, 'node', 'Should have $dynamicAnchor');
      assert.strictEqual(
        migrated.properties.children.items.$dynamicRef,
        '#node',
        'Should convert $recursiveRef to $dynamicRef'
      );
      assert.strictEqual(
        migrated.properties.children.items.$recursiveRef,
        undefined,
        'Should not have $recursiveRef'
      );
    });

    it('should handle named $recursiveAnchor', () => {
      const schema201909 = {
        $recursiveAnchor: 'customNode',
        type: 'object'
      };

      const migrated = migrateFrom201909(schema201909);

      assert.strictEqual(migrated.$dynamicAnchor, 'customNode');
      assert.strictEqual(migrated.$recursiveAnchor, undefined);
    });
  });

  describe('Migration Summary', () => {
    it('should generate summary for Draft-07 migration', () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        definitions: {
          User: { type: 'object' },
          Address: { type: 'object' }
        },
        type: 'array',
        items: [
          { type: 'string' },
          { type: 'number' }
        ],
        additionalItems: false
      };

      const summary = getMigrationSummary(schema);

      assert.strictEqual(summary.sourceDraft, 'draft-07');
      assert.strictEqual(summary.targetDraft, '2020-12');
      assert.ok(summary.changes.length > 0);
      assert.ok(
        summary.changes.some(c => c.includes('definitions')),
        'Should mention definitions conversion'
      );
      assert.ok(
        summary.changes.some(c => c.includes('prefixItems')),
        'Should mention array items conversion'
      );
    });

    it('should detect when no migration needed', () => {
      const schema = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'object'
      };

      const summary = getMigrationSummary(schema);

      assert.strictEqual(summary.sourceDraft, '2020-12');
      assert.ok(
        summary.changes.some(c => c.includes('already Draft 2020-12')),
        'Should indicate no migration needed'
      );
    });
  });

  describe('Migration Validation', () => {
    it('should validate successful migration', () => {
      const original = {
        definitions: { User: { type: 'object' } }
      };

      const migrated = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $defs: { User: { type: 'object' } }
      };

      const validation = validateMigration(original, migrated);

      assert.strictEqual(validation.success, true);
      assert.strictEqual(validation.warnings.length, 0);
    });

    it('should detect incomplete migration', () => {
      const original = {
        definitions: { User: { type: 'object' } }
      };

      const migrated = {
        definitions: { User: { type: 'object' } }, // Not migrated!
        $schema: 'https://json-schema.org/draft/2020-12/schema'
      };

      const validation = validateMigration(original, migrated);

      assert.strictEqual(validation.success, false);
      assert.ok(validation.warnings.length > 0);
      assert.ok(
        validation.warnings.some(w => w.includes('definitions')),
        'Should warn about unmigrated definitions'
      );
    });
  });

  describe('Complex Schema Migration', () => {
    it('should handle deeply nested schemas', () => {
      const draft07Schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        definitions: {
          Node: {
            type: 'object',
            properties: {
              value: { type: 'string' },
              children: {
                type: 'array',
                items: { $ref: '#/definitions/Node' }
              }
            }
          }
        },
        type: 'object',
        properties: {
          root: { $ref: '#/definitions/Node' }
        }
      };

      const migrated = migrateToSchema202012(draft07Schema, 'draft-07');

      assert.ok(migrated.$defs);
      assert.ok(migrated.$defs.Node);
      assert.strictEqual(
        migrated.properties.root.$ref,
        '#/$defs/Node',
        'Should update root reference'
      );
      assert.strictEqual(
        migrated.$defs.Node.properties.children.items.$ref,
        '#/$defs/Node',
        'Should update nested reference'
      );
      assert.strictEqual(
        migrated.$schema,
        'https://json-schema.org/draft/2020-12/schema'
      );
    });

    it('should handle combination of migrations', () => {
      const draft07Schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        definitions: {
          Coords: {
            type: 'array',
            items: [
              { type: 'number' },
              { type: 'number' }
            ],
            additionalItems: false
          }
        },
        properties: {
          location: { $ref: '#/definitions/Coords' }
        }
      };

      const migrated = migrateToSchema202012(draft07Schema, 'draft-07');

      // Check definitions → $defs
      assert.ok(migrated.$defs);
      assert.ok(migrated.$defs.Coords);
      
      // Check array items → prefixItems
      assert.ok(migrated.$defs.Coords.prefixItems);
      assert.strictEqual(migrated.$defs.Coords.items, false);
      assert.strictEqual(migrated.$defs.Coords.additionalItems, undefined);
      
      // Check $ref update
      assert.strictEqual(migrated.properties.location.$ref, '#/$defs/Coords');
    });
  });
});