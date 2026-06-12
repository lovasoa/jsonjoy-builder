import assert from "node:assert";
import { describe, test } from "node:test";
import {
  collectRefTargets,
  definitionPointer,
  getRootDefinitions,
  removeDefinition,
  renameDefinition,
  resolveExternalDocument,
  resolveRef,
  splitRefUri,
  updateDefinition,
} from "../../src/lib/refUtils.ts";
import type { ObjectJsonSchema } from "../../src/types/jsonSchema.ts";

const document: ObjectJsonSchema = {
  type: "object",
  properties: {
    home: { $ref: "#/$defs/address" },
    work: { $ref: "#/$defs/address/properties/city" },
    vehicle: { $ref: "#/definitions/vehicle" },
  },
  $defs: {
    address: {
      type: "object",
      properties: {
        city: { type: "string" },
      },
    },
    "weird~name/with-slash": { type: "number" },
    anchored: { type: "string", $anchor: "myAnchor" },
  },
  definitions: {
    vehicle: { type: "object" },
  },
};

describe("resolveRef", () => {
  test("resolves '#' to the document root", () => {
    assert.deepStrictEqual(resolveRef(document, "#"), {
      kind: "resolved",
      schema: document,
    });
  });

  test("resolves a JSON Pointer to a $defs entry", () => {
    const result = resolveRef(document, "#/$defs/address");
    assert.strictEqual(result.kind, "resolved");
    assert.deepStrictEqual(
      result.kind === "resolved" && result.schema,
      document.$defs?.address,
    );
  });

  test("resolves a JSON Pointer through nested properties", () => {
    const result = resolveRef(document, "#/$defs/address/properties/city");
    assert.deepStrictEqual(result, {
      kind: "resolved",
      schema: { type: "string" },
    });
  });

  test("resolves escaped pointer segments (~0 and ~1)", () => {
    const result = resolveRef(document, "#/$defs/weird~0name~1with-slash");
    assert.deepStrictEqual(result, {
      kind: "resolved",
      schema: { type: "number" },
    });
  });

  test("resolves URI-encoded pointer segments", () => {
    const result = resolveRef(document, "#/%24defs/address");
    assert.strictEqual(result.kind, "resolved");
  });

  test("resolves plain-name fragments via $anchor", () => {
    const result = resolveRef(document, "#myAnchor");
    assert.deepStrictEqual(result, {
      kind: "resolved",
      schema: { type: "string", $anchor: "myAnchor" },
    });
  });

  test("reports a missing target as unresolved", () => {
    assert.deepStrictEqual(resolveRef(document, "#/$defs/missing"), {
      kind: "unresolved",
    });
    assert.deepStrictEqual(resolveRef(document, "#missingAnchor"), {
      kind: "unresolved",
    });
  });

  test("reports non-fragment URIs as external", () => {
    assert.deepStrictEqual(
      resolveRef(document, "https://example.com/schema.json"),
      { kind: "external" },
    );
    assert.deepStrictEqual(resolveRef(document, "other.json#/$defs/x"), {
      kind: "external",
    });
  });

  test("does not resolve a pointer into plain data values", () => {
    const schema: ObjectJsonSchema = {
      type: "object",
      properties: { tags: { type: "array" } },
      required: ["tags"],
    };
    assert.deepStrictEqual(resolveRef(schema, "#/required/0"), {
      kind: "unresolved",
    });
  });
});

describe("collectRefTargets", () => {
  test("collects root definitions from $defs and definitions", () => {
    const pointers = collectRefTargets(document).map((t) => t.pointer);
    assert.deepStrictEqual(pointers, [
      "#/$defs/address",
      "#/$defs/weird~0name~1with-slash",
      "#/$defs/anchored",
      "#/definitions/vehicle",
    ]);
  });

  test("collects nested definitions after root ones", () => {
    const schema: ObjectJsonSchema = {
      type: "object",
      $defs: { top: { type: "string" } },
      properties: {
        nested: {
          type: "object",
          $defs: { inner: { type: "number" } },
        },
      },
    };
    const pointers = collectRefTargets(schema).map((t) => t.pointer);
    assert.deepStrictEqual(pointers, [
      "#/$defs/top",
      "#/properties/nested/$defs/inner",
    ]);
  });

  test("ignores keys that only look like definitions inside data", () => {
    const schema: ObjectJsonSchema = {
      type: "object",
      default: { $defs: { fake: { type: "string" } } },
      const: { definitions: { fake: { type: "string" } } },
    };
    assert.deepStrictEqual(collectRefTargets(schema), []);
  });

  test("every collected pointer resolves", () => {
    for (const target of collectRefTargets(document)) {
      const result = resolveRef(document, target.pointer);
      assert.strictEqual(result.kind, "resolved", target.pointer);
      assert.deepStrictEqual(
        result.kind === "resolved" && result.schema,
        target.schema,
      );
    }
  });
});

describe("definition editing", () => {
  test("getRootDefinitions lists $defs before legacy definitions", () => {
    const names = getRootDefinitions(document).map(
      (d) => `${d.container}:${d.name}`,
    );
    assert.deepStrictEqual(names, [
      "$defs:address",
      "$defs:weird~name/with-slash",
      "$defs:anchored",
      "definitions:vehicle",
    ]);
  });

  test("updateDefinition adds a new definition", () => {
    const updated = updateDefinition({ type: "object" }, "$defs", "name", {
      type: "string",
    });
    assert.deepStrictEqual(updated.$defs, { name: { type: "string" } });
  });

  test("removeDefinition drops the container when it becomes empty", () => {
    const schema: ObjectJsonSchema = {
      type: "object",
      $defs: { only: { type: "string" } },
    };
    const updated = removeDefinition(schema, "$defs", "only");
    assert.strictEqual(updated.$defs, undefined);
  });

  test("renameDefinition preserves definition order", () => {
    const schema: ObjectJsonSchema = {
      type: "object",
      $defs: {
        first: { type: "string" },
        second: { type: "number" },
        third: { type: "boolean" },
      },
    };
    const renamed = renameDefinition(schema, "$defs", "second", "middle");
    assert.deepStrictEqual(Object.keys(renamed.$defs ?? {}), [
      "first",
      "middle",
      "third",
    ]);
  });

  test("renameDefinition rewrites every reference to the definition", () => {
    const schema: ObjectJsonSchema = {
      type: "object",
      properties: {
        home: { $ref: "#/$defs/address" },
        city: { $ref: "#/$defs/address/properties/city" },
        other: { $ref: "#/$defs/addressBook" },
      },
      items: { $ref: "#/$defs/address" },
      $defs: {
        address: {
          type: "object",
          properties: { city: { type: "string" } },
        },
        addressBook: { type: "array", items: { $ref: "#/$defs/address" } },
      },
    };

    const renamed = renameDefinition(schema, "$defs", "address", "location");

    assert.deepStrictEqual(renamed.properties?.home, {
      $ref: "#/$defs/location",
    });
    assert.deepStrictEqual(renamed.properties?.city, {
      $ref: "#/$defs/location/properties/city",
    });
    // A definition whose name shares a prefix must not be rewritten
    assert.deepStrictEqual(renamed.properties?.other, {
      $ref: "#/$defs/addressBook",
    });
    assert.deepStrictEqual(renamed.items, { $ref: "#/$defs/location" });
    const book = renamed.$defs?.addressBook;
    assert.deepStrictEqual(typeof book === "object" && book.items, {
      $ref: "#/$defs/location",
    });
    assert.ok(renamed.$defs?.location);
    assert.strictEqual(renamed.$defs?.address, undefined);
  });

  test("renameDefinition leaves the schema untouched for unknown names", () => {
    const schema: ObjectJsonSchema = {
      type: "object",
      $defs: { known: { type: "string" } },
    };
    assert.strictEqual(
      renameDefinition(schema, "$defs", "unknown", "other"),
      schema,
    );
  });

  test("definitionPointer escapes special characters", () => {
    assert.strictEqual(
      definitionPointer("$defs", "weird~name/with-slash"),
      "#/$defs/weird~0name~1with-slash",
    );
  });
});

describe("external references", () => {
  test("splitRefUri separates the document URI from the fragment", () => {
    assert.deepStrictEqual(
      splitRefUri("https://example.com/schema.json#/definitions/x"),
      {
        documentUri: "https://example.com/schema.json",
        fragment: "/definitions/x",
      },
    );
    assert.deepStrictEqual(splitRefUri("https://example.com/schema.json"), {
      documentUri: "https://example.com/schema.json",
      fragment: "",
    });
    assert.deepStrictEqual(splitRefUri("other.json#anchor"), {
      documentUri: "other.json",
      fragment: "anchor",
    });
  });

  test("resolveExternalDocument loads each document only once", async () => {
    let calls = 0;
    const resolver = (uri: string) => {
      calls++;
      return Promise.resolve({ $id: uri, type: "object" as const });
    };

    const [first, second] = await Promise.all([
      resolveExternalDocument(resolver, "https://example.com/a.json"),
      resolveExternalDocument(resolver, "https://example.com/a.json"),
    ]);
    await resolveExternalDocument(resolver, "https://example.com/a.json");

    assert.strictEqual(calls, 1);
    assert.strictEqual(first, second);
  });

  test("resolveExternalDocument retries after a failed load", async () => {
    let calls = 0;
    const resolver = (uri: string) => {
      calls++;
      return calls === 1
        ? Promise.reject(new Error("offline"))
        : Promise.resolve({ $id: uri });
    };

    await assert.rejects(
      resolveExternalDocument(resolver, "https://example.com/b.json"),
      /offline/,
    );
    const doc = await resolveExternalDocument(
      resolver,
      "https://example.com/b.json",
    );

    assert.strictEqual(calls, 2);
    assert.deepStrictEqual(doc, { $id: "https://example.com/b.json" });
  });
});
