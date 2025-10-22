/**
 * JSON Schema Draft 2020-12 Comprehensive Tests
 * Tests all new 2020-12 keywords and features
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { validateSchema } from '../src/utils/validator.ts';

describe('JSON Schema Draft 2020-12 Support', () => {
  describe('prefixItems - Tuple Validation', () => {
    it('should validate tuple with prefixItems correctly', () => {
      const schema = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'array',
        prefixItems: [
          { type: 'string' },
          { type: 'number' }
        ],
        items: false
      };

      const validData = ['hello', 42];
      const invalidData1 = ['hello', 'world']; // Second item should be number
      const invalidData2 = ['hello', 42, 'extra']; // No additional items allowed

      const result1 = validateSchema(schema, validData, '2020-12');
      const result2 = validateSchema(schema, invalidData1, '2020-12');
      const result3 = validateSchema(schema, invalidData2, '2020-12');

      assert.strictEqual(result1.valid, true, 'Valid tuple should pass');
      assert.strictEqual(result2.valid, false, 'Invalid type should fail');
      assert.strictEqual(result3.valid, false, 'Additional items should fail');
    });

    it('should allow additional items with items schema', () => {
      const schema = {
        type: 'array',
        prefixItems: [
          { type: 'string' },
          { type: 'number' }
        ],
        items: { type: 'boolean' }
      };

      const validData = ['hello', 42, true, false, true];
      const invalidData = ['hello', 42, 'not boolean'];

      const result1 = validateSchema(schema, validData, '2020-12');
      const result2 = validateSchema(schema, invalidData, '2020-12');

      assert.strictEqual(result1.valid, true);
      assert.strictEqual(result2.valid, false);
    });
  });

  describe('Conditional Validation - if/then/else', () => {
    it('should handle simple if/then/else', () => {
      const schema = {
        type: 'object',
        properties: {
          country: { type: 'string' },
          postal_code: { type: 'string' }
        },
        if: {
          properties: { country: { const: 'USA' } }
        },
        then: {
          properties: { postal_code: { pattern: '^[0-9]{5}(-[0-9]{4})?$' } }
        },
        else: {
          properties: { postal_code: { minLength: 4, maxLength: 10 } }
        }
      };

      const validUSA = { country: 'USA', postal_code: '12345' };
      const validCanada = { country: 'Canada', postal_code: 'K1A0B1' };
      const invalidUSA = { country: 'USA', postal_code: 'ABC' };

      assert.strictEqual(validateSchema(schema, validUSA, '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, validCanada, '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, invalidUSA, '2020-12').valid, false);
    });

    it('should handle nested if/then/else chains', () => {
      const schema = {
        type: 'object',
        properties: {
          type: { enum: ['personal', 'business'] },
          age: { type: 'number' },
          company: { type: 'string' }
        },
        required: ['type'],
        if: {
          properties: { type: { const: 'personal' } }
        },
        then: {
          required: ['age']
        },
        else: {
          required: ['company']
        }
      };

      const validPersonal = { type: 'personal', age: 25 };
      const validBusiness = { type: 'business', company: 'Acme' };
      const invalidPersonal = { type: 'personal' }; // Missing age
      const invalidBusiness = { type: 'business' }; // Missing company

      assert.strictEqual(validateSchema(schema, validPersonal, '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, validBusiness, '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, invalidPersonal, '2020-12').valid, false);
      assert.strictEqual(validateSchema(schema, invalidBusiness, '2020-12').valid, false);
    });
  });

  describe('Dynamic References - $dynamicRef and $dynamicAnchor', () => {
    it('should handle $dynamicRef with $dynamicAnchor', () => {
      const schema = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        $id: 'https://example.com/tree',
        $dynamicAnchor: 'node',
        type: 'object',
        properties: {
          value: { type: 'number' },
          children: {
            type: 'array',
            items: { $dynamicRef: '#node' }
          }
        }
      };

      const validData = {
        value: 1,
        children: [
          { value: 2, children: [] },
          { value: 3, children: [{ value: 4, children: [] }] }
        ]
      };

      const invalidData = {
        value: 1,
        children: [
          { value: 'not a number', children: [] }
        ]
      };

      assert.strictEqual(validateSchema(schema, validData, '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, invalidData, '2020-12').valid, false);
    });
  });

  describe('dependentSchemas', () => {
    it('should apply dependent schema when property is present', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          credit_card: { type: 'number' }
        },
        dependentSchemas: {
          credit_card: {
            properties: {
              billing_address: { type: 'string' },
              cvv: { type: 'string', pattern: '^[0-9]{3,4}$' }
            },
            required: ['billing_address', 'cvv']
          }
        }
      };

      const validWithoutCard = { name: 'John' };
      const validWithCard = { name: 'John', credit_card: 1234, billing_address: '123 Main', cvv: '123' };
      const invalidWithCard = { name: 'John', credit_card: 1234 }; // Missing required fields

      assert.strictEqual(validateSchema(schema, validWithoutCard, '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, validWithCard, '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, invalidWithCard, '2020-12').valid, false);
    });
  });

  describe('unevaluatedProperties', () => {
    it('should forbid unevaluated properties with composition', () => {
      const schema = {
        type: 'object',
        properties: {
          name: { type: 'string' }
        },
        allOf: [
          {
            properties: {
              age: { type: 'number' }
            }
          }
        ],
        unevaluatedProperties: false
      };

      const validData = { name: 'John', age: 30 };
      const invalidData = { name: 'John', age: 30, extra: 'not allowed' };

      assert.strictEqual(validateSchema(schema, validData, '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, invalidData, '2020-12').valid, false);
    });
  });

  describe('unevaluatedItems', () => {
    it('should forbid unevaluated items with prefixItems', () => {
      const schema = {
        type: 'array',
        prefixItems: [
          { type: 'string' },
          { type: 'number' }
        ],
        contains: { type: 'boolean' },
        unevaluatedItems: false
      };

      const validData = ['hello', 42];
      const invalidData = ['hello', 42, 'extra'];

      assert.strictEqual(validateSchema(schema, validData, '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, invalidData, '2020-12').valid, false);
    });
  });

  describe('$defs - Replaces definitions', () => {
    it('should use $defs for schema definitions', () => {
      const schema = {
        $schema: 'https://json-schema.org/draft/2020-12/schema',
        type: 'object',
        properties: {
          user: { $ref: '#/$defs/User' }
        },
        $defs: {
          User: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              age: { type: 'number' }
            },
            required: ['name']
          }
        }
      };

      const validData = { user: { name: 'John', age: 30 } };
      const invalidData = { user: { age: 30 } }; // Missing required name

      assert.strictEqual(validateSchema(schema, validData, '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, invalidData, '2020-12').valid, false);
    });
  });

  describe('Composition Keywords', () => {
    it('should validate allOf correctly', () => {
      const schema = {
        allOf: [
          { type: 'object', properties: { name: { type: 'string' } } },
          { type: 'object', properties: { age: { type: 'number' } } }
        ]
      };

      const validData = { name: 'John', age: 30 };
      const invalidData = { name: 'John', age: 'thirty' };

      assert.strictEqual(validateSchema(schema, validData, '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, invalidData, '2020-12').valid, false);
    });

    it('should validate anyOf correctly', () => {
      const schema = {
        anyOf: [
          { type: 'string', minLength: 5 },
          { type: 'number', minimum: 0 }
        ]
      };

      assert.strictEqual(validateSchema(schema, 'hello', '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, 42, '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, 'hi', '2020-12').valid, false);
    });

    it('should validate oneOf correctly', () => {
      const schema = {
        oneOf: [
          { type: 'string' },
          { type: 'number' }
        ]
      };

      assert.strictEqual(validateSchema(schema, 'hello', '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, 42, '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, true, '2020-12').valid, false);
    });

    it('should validate not correctly', () => {
      const schema = {
        not: { type: 'string' }
      };

      assert.strictEqual(validateSchema(schema, 42, '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, 'hello', '2020-12').valid, false);
    });
  });

  describe('String Validation', () => {
    it('should validate string constraints', () => {
      const schema = {
        type: 'string',
        minLength: 3,
        maxLength: 10,
        pattern: '^[a-z]+$'
      };

      assert.strictEqual(validateSchema(schema, 'hello', '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, 'hi', '2020-12').valid, false); // Too short
      assert.strictEqual(validateSchema(schema, 'HELLO', '2020-12').valid, false); // Pattern mismatch
    });
  });

  describe('Number Validation', () => {
    it('should validate number constraints', () => {
      const schema = {
        type: 'number',
        minimum: 0,
        maximum: 100,
        multipleOf: 5
      };

      assert.strictEqual(validateSchema(schema, 50, '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, -1, '2020-12').valid, false); // Below minimum
      assert.strictEqual(validateSchema(schema, 101, '2020-12').valid, false); // Above maximum
      assert.strictEqual(validateSchema(schema, 7, '2020-12').valid, false); // Not multiple of 5
    });
  });

  describe('Array Validation', () => {
    it('should validate array constraints', () => {
      const schema = {
        type: 'array',
        minItems: 1,
        maxItems: 5,
        uniqueItems: true,
        items: { type: 'number' }
      };

      assert.strictEqual(validateSchema(schema, [1, 2, 3], '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, [], '2020-12').valid, false); // Too few items
      assert.strictEqual(validateSchema(schema, [1, 2, 3, 4, 5, 6], '2020-12').valid, false); // Too many
      assert.strictEqual(validateSchema(schema, [1, 2, 2], '2020-12').valid, false); // Not unique
    });

    it('should validate contains with min/maxContains', () => {
      const schema = {
        type: 'array',
        contains: { type: 'number' },
        minContains: 2,
        maxContains: 4
      };

      assert.strictEqual(validateSchema(schema, [1, 2, 'a'], '2020-12').valid, true); // 2 numbers
      assert.strictEqual(validateSchema(schema, [1, 'a'], '2020-12').valid, false); // Only 1 number
      assert.strictEqual(validateSchema(schema, [1, 2, 3, 4, 5, 'a'], '2020-12').valid, false); // Too many numbers
    });
  });

  describe('Object Validation', () => {
    it('should validate object constraints', () => {
      const schema = {
        type: 'object',
        minProperties: 1,
        maxProperties: 3,
        patternProperties: {
          '^[a-z]+$': { type: 'string' }
        }
      };

      assert.strictEqual(validateSchema(schema, { name: 'John' }, '2020-12').valid, true);
      assert.strictEqual(validateSchema(schema, {}, '2020-12').valid, false); // Too few properties
      assert.strictEqual(validateSchema(schema, { a: '1', b: '2', c: '3', d: '4' }, '2020-12').valid, false); // Too many
    });
  });

  describe('Backward Compatibility', () => {
    it('should still validate Draft-07 schemas', () => {
      const schema = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'object',
        properties: {
          name: { type: 'string' }
        },
        required: ['name']
      };

      const validData = { name: 'John' };
      const invalidData = {};

      assert.strictEqual(validateSchema(schema, validData, 'draft-07').valid, true);
      assert.strictEqual(validateSchema(schema, invalidData, 'draft-07').valid, false);
    });

    it('should still validate Draft 2019-09 schemas', () => {
      const schema = {
        $schema: 'https://json-schema.org/draft/2019-09/schema',
        type: 'object',
        dependentSchemas: {
          foo: {
            properties: {
              bar: { type: 'string' }
            }
          }
        }
      };

      const validData = { foo: 'value', bar: 'required' };

      assert.strictEqual(validateSchema(schema, validData, '2019-09').valid, true);
    });
  });
});