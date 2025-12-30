import { describe, test } from "node:test";
import assert from "node:assert";
import { renameObjectProperty } from "../../src/lib/schemaEditor.ts";

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
