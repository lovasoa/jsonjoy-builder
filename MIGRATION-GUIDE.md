# Migration Guide: JSON Schema Draft 2020-12

This guide helps you migrate your JSON schemas from older drafts (Draft-07 or 2019-09) to Draft 2020-12.

## Table of Contents

- [Overview](#overview)
- [Migration from Draft-07](#migration-from-draft-07)
- [Migration from Draft 2019-09](#migration-from-draft-2019-09)
- [New Features in 2020-12](#new-features-in-2020-12)
- [Breaking Changes](#breaking-changes)
- [Best Practices](#best-practices)

## Overview

JSON Schema Draft 2020-12 introduces several improvements and changes to previous drafts. This guide will help you understand what needs to be updated when migrating your schemas.

### Quick Migration Checklist

- [ ] Update `$schema` URI to `https://json-schema.org/draft/2020-12/schema`
- [ ] Replace `definitions` with `$defs`
- [ ] Update tuple validation from `items` array to `prefixItems`
- [ ] Replace `$recursiveRef` with `$dynamicRef` (if migrating from 2019-09)
- [ ] Review and update `unevaluatedProperties` and `unevaluatedItems` usage

---

## Migration from Draft-07

### 1. Update Schema Identifier

**Before (Draft-07)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```

**After (2020-12)**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema"
}
```

### 2. Replace `definitions` with `$defs`

**Before (Draft-07)**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "user": { "$ref": "#/definitions/User" }
  },
  "definitions": {
    "User": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "age": { "type": "number" }
      }
    }
  }
}
```

**After (2020-12)**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "user": { "$ref": "#/$defs/User" }
  },
  "$defs": {
    "User": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "age": { "type": "number" }
      }
    }
  }
}
```

### 3. Update Tuple Validation (Array with different types)

**Before (Draft-07)** - Used array form of `items`:
```json
{
  "type": "array",
  "items": [
    { "type": "string" },
    { "type": "number" },
    { "type": "boolean" }
  ],
  "additionalItems": false
}
```

**After (2020-12)** - Use `prefixItems`:
```json
{
  "type": "array",
  "prefixItems": [
    { "type": "string" },
    { "type": "number" },
    { "type": "boolean" }
  ],
  "items": false
}
```

**Key Changes**:
- `items` array form → `prefixItems`
- `additionalItems` → `items` (boolean or schema)
- More explicit and clearer semantics

### 4. Update Format Validation

**Before (Draft-07)** - Format was assertion by default:
```json
{
  "type": "string",
  "format": "email"
}
```

**After (2020-12)** - Format is annotation by default, use vocabularies for assertion:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$vocabulary": {
    "https://json-schema.org/draft/2020-12/vocab/format-assertion": true
  },
  "type": "string",
  "format": "email"
}
```

**Note**: In jsonjoy-builder, format validation is enabled by default using ajv-formats.

### 5. Migration Examples - Common Patterns

#### Example 1: User Profile with Address (Tuple)

**Draft-07**:
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "coordinates": {
      "type": "array",
      "items": [
        { "type": "number", "description": "latitude" },
        { "type": "number", "description": "longitude" }
      ],
      "additionalItems": false,
      "minItems": 2,
      "maxItems": 2
    }
  },
  "required": ["name"],
  "definitions": {
    "Address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" }
      }
    }
  }
}
```

**2020-12**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "coordinates": {
      "type": "array",
      "prefixItems": [
        { "type": "number", "description": "latitude" },
        { "type": "number", "description": "longitude" }
      ],
      "items": false,
      "minItems": 2,
      "maxItems": 2
    }
  },
  "required": ["name"],
  "$defs": {
    "Address": {
      "type": "object",
      "properties": {
        "street": { "type": "string" },
        "city": { "type": "string" }
      }
    }
  }
}
```

---

## Migration from Draft 2019-09

### 1. Update Schema Identifier

**Before (2019-09)**:
```json
{
  "$schema": "https://json-schema.org/draft/2019-09/schema"
}
```

**After (2020-12)**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema"
}
```

### 2. Replace Recursive References

**Before (2019-09)** - Used `$recursiveRef` and `$recursiveAnchor`:
```json
{
  "$schema": "https://json-schema.org/draft/2019-09/schema",
  "$id": "https://example.com/tree",
  "$recursiveAnchor": true,
  "type": "object",
  "properties": {
    "value": { "type": "number" },
    "children": {
      "type": "array",
      "items": { "$recursiveRef": "#" }
    }
  }
}
```

**After (2020-12)** - Use `$dynamicRef` and `$dynamicAnchor`:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/tree",
  "$dynamicAnchor": "node",
  "type": "object",
  "properties": {
    "value": { "type": "number" },
    "children": {
      "type": "array",
      "items": { "$dynamicRef": "#node" }
    }
  }
}
```

**Key Changes**:
- `$recursiveAnchor: true` → `$dynamicAnchor: "name"`
- `$recursiveRef: "#"` → `$dynamicRef`: "#name"`
- More explicit naming with dynamic anchors

### 3. Update Array Schemas (Same as Draft-07)

If you have tuple validation, update to `prefixItems`:

**Before (2019-09)**:
```json
{
  "type": "array",
  "items": [
    { "type": "string" },
    { "type": "number" }
  ],
  "additionalItems": false
}
```

**After (2020-12)**:
```json
{
  "type": "array",
  "prefixItems": [
    { "type": "string" },
    { "type": "number" }
  ],
  "items": false
}
```

---

## New Features in 2020-12

### 1. Enhanced Tuple Validation with `prefixItems`

Define schemas for specific array positions:

```json
{
  "type": "array",
  "prefixItems": [
    { "type": "string", "description": "Name" },
    { "type": "number", "minimum": 0, "description": "Age" },
    { "type": "string", "format": "email", "description": "Email" }
  ],
  "items": { "type": "string" },
  "minItems": 3
}
```

**Valid**: `["John", 30, "john@example.com", "extra", "strings", "allowed"]`  
**Invalid**: `["John", "thirty", "john@example.com"]` (second item must be number)

### 2. Dynamic References for Extensible Schemas

Create schemas that can be extended:

```json
{
  "$id": "https://example.com/base-node",
  "$dynamicAnchor": "node",
  "type": "object",
  "properties": {
    "id": { "type": "string" },
    "children": {
      "type": "array",
      "items": { "$dynamicRef": "#node" }
    }
  }
}
```

Extend in another schema:
```json
{
  "$id": "https://example.com/extended-node",
  "$dynamicAnchor": "node",
  "allOf": [
    { "$ref": "https://example.com/base-node" }
  ],
  "properties": {
    "customField": { "type": "string" }
  }
}
```

### 3. Improved `unevaluatedProperties`

Works correctly with schema composition:

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" }
  },
  "allOf": [
    {
      "properties": {
        "age": { "type": "number" }
      }
    }
  ],
  "unevaluatedProperties": false
}
```

**Valid**: `{ "name": "John", "age": 30 }`  
**Invalid**: `{ "name": "John", "age": 30, "extra": "not allowed" }`

Both `name` and `age` are evaluated (by `properties` and `allOf`), so they're allowed. But `extra` is unevaluated and forbidden.

### 4. Conditional Validation (Available in Draft-07+)

```json
{
  "type": "object",
  "properties": {
    "country": { "type": "string" },
    "postal_code": { "type": "string" }
  },
  "if": {
    "properties": {
      "country": { "const": "USA" }
    }
  },
  "then": {
    "properties": {
      "postal_code": { "pattern": "^[0-9]{5}(-[0-9]{4})?$" }
    }
  },
  "else": {
    "properties": {
      "postal_code": { "minLength": 4, "maxLength": 10 }
    }
  }
}
```

---

## Breaking Changes

### 1. `items` Keyword Behavior

In Draft-07 and earlier, `items` could be:
- A schema (applies to all items)
- An array of schemas (tuple validation)

In 2020-12, `items`:
- Only accepts a schema (not an array)
- Applies only to items NOT covered by `prefixItems`

### 2. Format Vocabulary

In Draft-07, `format` was an assertion (validation).  
In 2020-12, `format` is an annotation by default (metadata).

To enable format as assertion, declare the vocabulary:
```json
{
  "$vocabulary": {
    "https://json-schema.org/draft/2020-12/vocab/format-assertion": true
  }
}
```

### 3. `$recursiveRef` Removed

If migrating from 2019-09, replace `$recursiveRef` with `$dynamicRef`.

---

## Best Practices

### 1. Always Specify `$schema`

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object"
}
```

### 2. Use `prefixItems` for Tuples

When array items have different types or different validation rules:

```json
{
  "type": "array",
  "prefixItems": [
    { "type": "string" },
    { "type": "number" }
  ],
  "items": false
}
```

### 3. Prefer `$defs` over `definitions`

```json
{
  "$defs": {
    "User": { "type": "object" }
  },
  "properties": {
    "user": { "$ref": "#/$defs/User" }
  }
}
```

### 4. Use `unevaluatedProperties` with Composition

```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" }
  },
  "allOf": [
    {
      "properties": {
        "age": { "type": "number" }
      }
    }
  ],
  "unevaluatedProperties": false
}
```

This is more powerful than `additionalProperties: false` because it allows properties from composition.

### 5. Use Conditional Validation

```json
{
  "if": { "properties": { "type": { "const": "personal" } } },
  "then": { "required": ["age"] },
  "else": { "required": ["company"] }
}
```

---

## Common Migration Patterns

### Pattern 1: Coordinates (Tuple)

**Draft-07**:
```json
{
  "type": "array",
  "items": [
    { "type": "number" },
    { "type": "number" }
  ],
  "additionalItems": false
}
```

**2020-12**:
```json
{
  "type": "array",
  "prefixItems": [
    { "type": "number" },
    { "type": "number" }
  ],
  "items": false
}
```

### Pattern 2: Versioned Data

**Draft-07**:
```json
{
  "type": "object",
  "properties": {
    "version": { "type": "number" },
    "data": { "type": "object" }
  },
  "definitions": {
    "V1Data": {
      "properties": {
        "field1": { "type": "string" }
      }
    },
    "V2Data": {
      "properties": {
        "field1": { "type": "string" },
        "field2": { "type": "number" }
      }
    }
  },
  "if": {
    "properties": { "version": { "const": 1 } }
  },
  "then": {
    "properties": {
      "data": { "$ref": "#/definitions/V1Data" }
    }
  },
  "else": {
    "properties": {
      "data": { "$ref": "#/definitions/V2Data" }
    }
  }
}
```

**2020-12**:
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "properties": {
    "version": { "type": "number" },
    "data": { "type": "object" }
  },
  "$defs": {
    "V1Data": {
      "properties": {
        "field1": { "type": "string" }
      }
    },
    "V2Data": {
      "properties": {
        "field1": { "type": "string" },
        "field2": { "type": "number" }
      }
    }
  },
  "if": {
    "properties": { "version": { "const": 1 } }
  },
  "then": {
    "properties": {
      "data": { "$ref": "#/$defs/V1Data" }
    }
  },
  "else": {
    "properties": {
      "data": { "$ref": "#/$defs/V2Data" }
    }
  }
}
```

### Pattern 3: Dependent Validation

**Draft-07** (using `dependencies`):
```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "credit_card": { "type": "string" }
  },
  "dependencies": {
    "credit_card": ["billing_address"]
  }
}
```

**2020-12** (using `dependentRequired` or `dependentSchemas`):
```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "credit_card": { "type": "string" },
    "billing_address": { "type": "string" }
  },
  "dependentRequired": {
    "credit_card": ["billing_address"]
  }
}
```

Or with schema dependency:
```json
{
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "credit_card": { "type": "string" }
  },
  "dependentSchemas": {
    "credit_card": {
      "properties": {
        "billing_address": { "type": "string" },
        "cvv": { "type": "string", "pattern": "^[0-9]{3,4}$" }
      },
      "required": ["billing_address", "cvv"]
    }
  }
}
```

---

## Automated Migration

You can use the jsonjoy-builder UI to automatically migrate schemas:

1. Paste your Draft-07 or 2019-09 schema
2. Select the target draft version (2020-12)
3. The schema will be automatically updated

Or use the migration utility:

```typescript
import { migrateToSchema202012 } from 'jsonjoy-builder/utils/schema-migrator';

const oldSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "definitions": { ... },
  // ...
};

const newSchema = migrateToSchema202012(oldSchema, 'draft-07');
```

---

## Testing Your Migrated Schema

After migration, verify your schema:

1. **Validate with Ajv**:
```typescript
import Ajv2020 from 'ajv/dist/2020';
import addFormats from 'ajv-formats';

const ajv = new Ajv2020();
addFormats(ajv);

const validate = ajv.compile(yourSchema);
const valid = validate(yourData);
```

2. **Use jsonjoy-builder Validator**:
   - Paste your schema
   - Paste your test data
   - Click "Validate JSON"
   - Verify validation works as expected

3. **Check Edge Cases**:
   - Test with valid data
   - Test with invalid data
   - Test boundary conditions
   - Test with missing optional fields

---

## Need Help?

- [JSON Schema 2020-12 Specification](https://json-schema.org/draft/2020-12/json-schema-core.html)
- [Understanding JSON Schema](https://json-schema.org/understanding-json-schema/)
- [Ajv Documentation](https://ajv.js.org/)
- [jsonjoy-builder GitHub Issues](https://github.com/lovasoa/jsonjoy-builder/issues)

---

**Last Updated**: 2025-10-22  
**Version**: 1.0