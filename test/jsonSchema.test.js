import assert from "node:assert";
import { describe, test } from "node:test";
import metaschema from "../metaschema.schema.json" with { type: "json" };
import {
  getEditorType,
  getNullableSchemaType,
  isBooleanSchema,
  isNullableSchema,
  isObjectSchema,
  jsonSchemaType,
  preserveNullableSchemaType,
} from "../src/types/jsonSchema.ts";

describe("JSON Schema", () => {
  test("should successfully parse the JSON Schema metaschema", () => {
    const result = jsonSchemaType.safeParse(metaschema);
    if (!result.success) {
      console.error("Validation error:", result.error);
    }
    assert.strictEqual(result.success, true);
  });

  test("schema type checker functions should work correctly", () => {
    const objectSchema = { type: "object", properties: {} };
    const booleanSchema = true;

    assert.strictEqual(isObjectSchema(objectSchema), true);
    assert.strictEqual(isBooleanSchema(objectSchema), false);

    assert.strictEqual(isObjectSchema(booleanSchema), false);
    assert.strictEqual(isBooleanSchema(booleanSchema), true);
  });

  test("nullable type arrays use their non-null type in the visual editor", () => {
    const nullableObject = { type: ["object", "null"] };
    const nullFirstString = { type: ["null", "string"] };

    assert.strictEqual(getEditorType(nullableObject), "object");
    assert.strictEqual(getEditorType(nullFirstString), "string");
    assert.strictEqual(getNullableSchemaType(nullableObject), "object");
    assert.strictEqual(isNullableSchema(nullFirstString), true);
  });

  test("nullable type arrays preserve null and source order after edits", () => {
    assert.deepStrictEqual(
      preserveNullableSchemaType(
        { type: ["null", "string"] },
        { type: "string", minLength: 2 },
      ),
      { type: ["null", "string"], minLength: 2 },
    );

    assert.deepStrictEqual(
      preserveNullableSchemaType(
        { type: ["object", "null"] },
        { type: "array", items: { type: "string" } },
      ),
      {
        type: ["array", "null"],
        items: { type: "string" },
      },
    );
  });

  test("multi-type unions are not treated as nullable", () => {
    assert.strictEqual(
      isNullableSchema({ type: ["string", "number", "null"] }),
      false,
    );
    assert.strictEqual(isNullableSchema({ type: ["string", "number"] }), false);
  });
});
