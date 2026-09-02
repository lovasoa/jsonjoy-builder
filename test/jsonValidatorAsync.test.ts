import assert from "node:assert";
import { describe, test } from "node:test";
import type { ExternalRefResolver } from "../src/lib/refUtils.ts";
import type { JsonSchema } from "../src/types/jsonSchema.ts";
import { validateJsonAsync } from "../src/utils/jsonValidator.ts";

const documents: Record<string, JsonSchema> = {
  "https://example.com/person.json": {
    type: "object",
    properties: {
      name: { type: "string" },
      address: { $ref: "https://example.com/address.json" },
    },
    required: ["name"],
  },
  "https://example.com/address.json": {
    type: "object",
    properties: { city: { type: "string" } },
    required: ["city"],
  },
};

const stubResolver: ExternalRefResolver = (uri) => {
  const doc = documents[uri];
  return doc !== undefined
    ? Promise.resolve(doc)
    : Promise.reject(new Error(`unknown document ${uri}`));
};

describe("validateJsonAsync", () => {
  test("loads external references through the resolver", async () => {
    const schema: JsonSchema = {
      type: "object",
      properties: { person: { $ref: "https://example.com/person.json" } },
    };

    const valid = await validateJsonAsync(
      JSON.stringify({ person: { name: "Ada", address: { city: "London" } } }),
      schema,
      stubResolver,
    );
    assert.strictEqual(valid.valid, true);

    // The nested external schema (address.json, referenced by
    // person.json) must be enforced too
    const invalid = await validateJsonAsync(
      JSON.stringify({ person: { name: "Ada", address: {} } }),
      schema,
      stubResolver,
    );
    assert.strictEqual(invalid.valid, false);
    assert.ok(
      invalid.errors?.some((e) => e.message.includes("city")),
      JSON.stringify(invalid.errors),
    );
  });

  test("supports fragments in external references", async () => {
    const schema: JsonSchema = {
      $ref: "https://example.com/person.json#/properties/name",
    };

    const valid = await validateJsonAsync('"Ada"', schema, stubResolver);
    assert.strictEqual(valid.valid, true);

    const invalid = await validateJsonAsync("42", schema, stubResolver);
    assert.strictEqual(invalid.valid, false);
  });

  test("reports resolver failures as validation errors", async () => {
    const schema: JsonSchema = {
      $ref: "https://example.com/missing.json",
    };

    const result = await validateJsonAsync("{}", schema, stubResolver);
    assert.strictEqual(result.valid, false);
    assert.ok(
      result.errors?.some((e) => e.message.includes("unknown document")),
      JSON.stringify(result.errors),
    );
  });

  test("behaves like validateJson without a resolver", async () => {
    const schema: JsonSchema = {
      $ref: "https://example.com/person.json",
    };

    const result = await validateJsonAsync("{}", schema);
    assert.strictEqual(result.valid, false);
    assert.ok(result.errors && result.errors.length > 0);
  });
});
