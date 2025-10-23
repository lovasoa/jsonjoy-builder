/**
 * Tests for JSON Schema Draft Version Switching
 * Verifies that the validator correctly handles different draft versions
 */

import { describe, it } from "node:test";
import assert from "node:assert";
import { createValidator, validateSchema } from "../src/utils/validator.ts";
import { detectSchemaVersion, getSchemaURI } from "../src/utils/schema-version.ts";
import type { JSONSchema } from "../src/types/jsonSchema.ts";

describe("Multi-Draft Validator Tests", () => {
  it("should create validator for draft-07", () => {
    const validator = createValidator("draft-07");
    assert.ok(validator, "Draft-07 validator should be created");
  });

  it("should create validator for 2019-09", () => {
    const validator = createValidator("2019-09");
    assert.ok(validator, "2019-09 validator should be created");
  });

  it("should create validator for 2020-12", () => {
    const validator = createValidator("2020-12");
    assert.ok(validator, "2020-12 validator should be created");
  });

  it("should detect 2020-12 schema from $schema URI", () => {
    const schema: JSONSchema = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "object",
    };
    const detected = detectSchemaVersion(schema);
    assert.strictEqual(detected, "2020-12");
  });

  it("should detect 2020-12 from $dynamicRef keyword", () => {
    const schema: JSONSchema = {
      $dynamicRef: "#node",
      type: "object",
    };
    const detected = detectSchemaVersion(schema);
    assert.strictEqual(detected, "2020-12");
  });

  it("should detect 2020-12 from prefixItems keyword", () => {
    const schema: JSONSchema = {
      type: "array",
      prefixItems: [{ type: "string" }, { type: "number" }],
    };
    const detected = detectSchemaVersion(schema);
    assert.strictEqual(detected, "2020-12");
  });

  it("should validate with 2020-12 validator using prefixItems", () => {
    const schema: JSONSchema = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      type: "array",
      prefixItems: [{ type: "string" }, { type: "number" }],
      items: false,
    };

    const validData = ["hello", 42];
    const invalidData = ["hello", "world"];

    const result1 = validateSchema(schema, validData, "2020-12");
    const result2 = validateSchema(schema, invalidData, "2020-12");

    assert.strictEqual(result1.valid, true, "Should validate correct tuple");
    assert.strictEqual(result2.valid, false, "Should reject incorrect tuple");
  });

  it("should validate with 2020-12 validator using dependentSchemas", () => {
    const schema: JSONSchema = {
      type: "object",
      properties: {
        name: { type: "string" },
        credit_card: { type: "number" },
      },
      dependentSchemas: {
        credit_card: {
          properties: {
            billing_address: { type: "string" },
          },
          required: ["billing_address"],
        },
      },
    };

    const validWithCard = {
      name: "John",
      credit_card: 1234567890123456,
      billing_address: "123 Main St",
    };
    const invalidWithCard = {
      name: "John",
      credit_card: 1234567890123456,
    };

    const result1 = validateSchema(schema, validWithCard, "2020-12");
    const result2 = validateSchema(schema, invalidWithCard, "2020-12");

    assert.strictEqual(result1.valid, true, "Should validate when billing_address present");
    assert.strictEqual(result2.valid, false, "Should fail when billing_address missing");
  });

  it("should get correct $schema URIs for each draft", () => {
    assert.strictEqual(
      getSchemaURI("draft-07"),
      "https://json-schema.org/draft-07/schema"
    );
    assert.strictEqual(
      getSchemaURI("2019-09"),
      "https://json-schema.org/draft/2019-09/schema"
    );
    assert.strictEqual(
      getSchemaURI("2020-12"),
      "https://json-schema.org/draft/2020-12/schema"
    );
  });

  it("should validate if/then/else with 2020-12 validator", () => {
    const schema: JSONSchema = {
      type: "object",
      properties: {
        country: { type: "string" },
        postal_code: { type: "string" },
      },
      if: {
        properties: { country: { const: "USA" } },
      },
      then: {
        properties: {
          postal_code: { pattern: "^[0-9]{5}(-[0-9]{4})?$" },
        },
      },
      else: {
        properties: {
          postal_code: { minLength: 4, maxLength: 10 },
        },
      },
    };

    const validUSA = { country: "USA", postal_code: "12345" };
    const validOther = { country: "Canada", postal_code: "K1A0B1" };
    const invalidUSA = { country: "USA", postal_code: "ABC" };

    const result1 = validateSchema(schema, validUSA, "2020-12");
    const result2 = validateSchema(schema, validOther, "2020-12");
    const result3 = validateSchema(schema, invalidUSA, "2020-12");

    assert.strictEqual(result1.valid, true, "Should validate USA postal code");
    assert.strictEqual(result2.valid, true, "Should validate other postal code");
    assert.strictEqual(result3.valid, false, "Should reject invalid USA postal code");
  });
});