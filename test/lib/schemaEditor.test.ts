import assert from "node:assert";
import { describe, test } from "node:test";
import {
  getArrayItemsSchema,
  hasChildren,
  renameObjectProperty,
  updateArrayItems,
} from "../../src/lib/schemaEditor.ts";

describe("renameObjectProperty", () => {
  test("preserves property order when renaming", () => {
    const schema = {
      type: "object" as const,
      properties: {
        firstName: { type: "string" as const },
        lastName: { type: "string" as const },
        email: { type: "string" as const },
      },
      required: ["firstName", "lastName", "email"],
    };

    const result = renameObjectProperty(schema, "lastName", "surname");

    const keys = Object.keys(result.properties);
    assert.deepStrictEqual(keys, ["firstName", "surname", "email"]);
    assert.deepStrictEqual(result.required, ["firstName", "surname", "email"]);
  });
});

describe("nullable container helpers", () => {
  test("reads and updates items on nullable arrays", () => {
    const schema = {
      type: ["null", "array"] as const,
      items: { type: "string" as const },
    };

    assert.deepStrictEqual(getArrayItemsSchema(schema), { type: "string" });
    assert.deepStrictEqual(updateArrayItems(schema, { type: "number" }), {
      type: ["null", "array"],
      items: { type: "number" },
    });
  });

  test("detects children on nullable objects and array items", () => {
    assert.strictEqual(
      hasChildren({
        type: ["object", "null"],
        properties: { name: { type: "string" } },
      }),
      true,
    );
    assert.strictEqual(
      hasChildren({
        type: ["array", "null"],
        items: {
          type: ["null", "object"],
          properties: { name: { type: "string" } },
        },
      }),
      true,
    );
  });
});
