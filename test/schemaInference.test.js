import assert from "node:assert";
import { describe, test } from "node:test";
import { createSchemaFromJson } from "../src/lib/schema-inference.ts";

describe("Schema Inference", () => {
  test("should infer schema for primitive types", () => {
    const json = {
      string: "hello",
      number: 42,
      integer: 42,
      float: 42.5,
      boolean: true,
      null: null,
    };

    const schema = createSchemaFromJson(json);
    assert.strictEqual(schema.properties.string.type, "string");
    assert.strictEqual(schema.properties.number.type, "integer");
    assert.strictEqual(schema.properties.integer.type, "integer");
    assert.strictEqual(schema.properties.float.type, "number");
    assert.strictEqual(schema.properties.boolean.type, "boolean");
    assert.strictEqual(schema.properties.null.type, "null");
  });

  test("should infer schema for object types", () => {
    const json = {
      person: {
        name: "John",
        age: 30,
      },
    };

    const schema = createSchemaFromJson(json);
    assert.strictEqual(schema.properties.person.type, "object");
    assert.strictEqual(schema.properties.person.properties.name.type, "string");
    assert.strictEqual(schema.properties.person.properties.age.type, "integer");
    assert.deepStrictEqual(schema.properties.person.required, ["age", "name"]);
  });

  test("should infer schema for array types", () => {
    const json = {
      numbers: [1, 2, 3],
      mixed: [1, "two", true],
      empty: [],
    };

    const schema = createSchemaFromJson(json);
    assert.strictEqual(schema.properties.numbers.type, "array");
    assert.strictEqual(schema.properties.numbers.items.type, "integer");
    assert.strictEqual(schema.properties.mixed.type, "array");
    assert.strictEqual(schema.properties.mixed.items.oneOf.length, 3);
    assert.strictEqual(schema.properties.empty.type, "array");
  });

  test("should infer schema for array of objects with different properties", () => {
    const json = {
      users: [
        {
          name: "John",
          age: 30,
        },
        {
          name: "Jane",
          address: "123 Main St",
        },
      ],
    };

    const schema = createSchemaFromJson(json);
    assert.strictEqual(
      schema.$schema,
      "https://json-schema.org/draft/2020-12/schema",
    );
    assert.strictEqual(schema.properties.users.type, "array");
    assert.strictEqual(schema.properties.users.items.type, "object");
    assert.strictEqual(
      schema.properties.users.items.properties.name.type,
      "string",
    );
    assert.strictEqual(
      schema.properties.users.items.properties.age.type,
      "integer",
    );
    assert.strictEqual(
      schema.properties.users.items.properties.address.type,
      "string",
    );
    // "name" is present in all objects, so it is required;
    // "address" is present in some objects, so it is not required;
    assert.deepStrictEqual(schema.properties.users.items.required, ["name"]);
  });

  test("should detect string formats", () => {
    const json = {
      date: "2024-03-20",
      datetime: "2024-03-20T12:00:00Z",
      email: "test@example.com",
      uuid: "123e4567-e89b-12d3-a456-426614174000",
      uri: "https://example.com",
    };

    const schema = createSchemaFromJson(json);
    assert.strictEqual(schema.properties.date.format, "date");
    assert.strictEqual(schema.properties.datetime.format, "date-time");
    assert.strictEqual(schema.properties.email.format, "email");
    assert.strictEqual(schema.properties.uuid.format, "uuid");
    assert.strictEqual(schema.properties.uri.format, "uri");
  });

  test("should handle nested arrays and objects", () => {
    const json = {
      users: [
        {
          name: "John",
          hobbies: ["reading", "gaming"],
        },
        {
          name: "Jane",
          hobbies: ["painting"],
        },
      ],
    };

    const schema = createSchemaFromJson(json);
    assert.strictEqual(schema.properties.users.type, "array");
    assert.strictEqual(schema.properties.users.items.type, "object");
    assert.strictEqual(
      schema.properties.users.items.properties.hobbies.type,
      "array",
    );
    assert.strictEqual(
      schema.properties.users.items.properties.hobbies.items.type,
      "string",
    );
    assert.deepStrictEqual(schema.properties.users.items.required, [
      "hobbies",
      "name",
    ]);
  });

  test("should handle mixed types for the same property using oneOf", () => {
    const json = {
      data: [
        { key: "A", value: 100 },
        { key: "B", value: "hello" },
        { key: "C", value: 200 },
        { key: "D", value: true }, // Add boolean to mix
      ],
    };
    const schema = createSchemaFromJson(json);
    assert.strictEqual(schema.properties.data.type, "array");
    assert.strictEqual(schema.properties.data.items.type, "object");
    assert.strictEqual(
      schema.properties.data.items.properties.key.type,
      "string",
    );
    // 'value' has mixed types (integer, string, boolean)
    assert.ok(
      schema.properties.data.items.properties.value.oneOf,
      "oneOf should exist for mixed types",
    );
    const oneOfTypes = schema.properties.data.items.properties.value.oneOf.map(
      (s) => s.type,
    );
    assert.deepStrictEqual(
      oneOfTypes.sort(),
      ["boolean", "integer", "string"].sort(),
      "oneOf should contain integer, string, and boolean types",
    );
    assert.deepStrictEqual(schema.properties.data.items.required, [
      "key",
      "value",
    ]);
  });

  test("should correctly identify required fields when properties are missing", () => {
    const json = {
      records: [
        { id: 1, name: "One", status: "active" },
        { id: 2, status: "inactive" }, // Missing 'name'
        { id: 3, name: "Three", status: "active" },
      ],
    };
    const schema = createSchemaFromJson(json);
    assert.strictEqual(schema.properties.records.type, "array");
    assert.strictEqual(schema.properties.records.items.type, "object");
    assert.strictEqual(
      schema.properties.records.items.properties.id.type,
      "integer",
    );
    assert.strictEqual(
      schema.properties.records.items.properties.name.type,
      "string",
    );
    assert.strictEqual(
      schema.properties.records.items.properties.status.type,
      "string",
    );
    // Only 'id' and 'status' are present in all items
    assert.deepStrictEqual(
      schema.properties.records.items.required.sort(),
      ["id", "status"].sort(),
    );
  });

  test("should detect enums for strings in larger arrays", () => {
    const json = {
      events: Array(20)
        .fill(null)
        .map((_, i) => ({
          id: i,
          // Alternate between 'PENDING', 'PROCESSING', 'COMPLETE'
          status: ["PENDING", "PROCESSING", "COMPLETE"][i % 3],
          timestamp: Date.now() + i,
        })),
    };
    const schema = createSchemaFromJson(json);
    assert.strictEqual(schema.properties.events.type, "array");
    assert.strictEqual(schema.properties.events.items.type, "object");
    assert.strictEqual(
      schema.properties.events.items.properties.status.type,
      "string",
    );
    assert.deepStrictEqual(
      schema.properties.events.items.properties.status.enum.sort(),
      ["COMPLETE", "PENDING", "PROCESSING"].sort(),
    );
  });

  test("should detect enums for numbers in larger arrays", () => {
    const json = {
      sensors: Array(15)
        .fill(null)
        .map((_, i) => ({
          sensorId: `sensor_${i}`,
          // Use limited numeric codes
          code: [101, 202, 303, 404][i % 4],
          reading: Math.random() * 100,
        })),
    };
    const schema = createSchemaFromJson(json);
    assert.strictEqual(schema.properties.sensors.type, "array");
    assert.strictEqual(schema.properties.sensors.items.type, "object");
    assert.strictEqual(
      schema.properties.sensors.items.properties.code.type,
      "integer",
    );
    assert.deepStrictEqual(
      schema.properties.sensors.items.properties.code.enum.sort(),
      [101, 202, 303, 404].sort(),
    );
  });

  test("should NOT detect enums for unique IDs or insufficient data", () => {
    const json = {
      shortList: [{ status: "A" }, { status: "B" }, { status: "C" }],
      uniqueIds: Array(12)
        .fill(null)
        .map((_, i) => ({ userId: `user_${i}` })),
    };
    const schema = createSchemaFromJson(json);
    // Short list should not trigger enum detection
    assert.strictEqual(
      schema.properties.shortList.items.properties.status.type,
      "string",
    );
    assert.strictEqual(
      schema.properties.shortList.items.properties.status.enum,
      undefined,
    );
    // Unique IDs should not be treated as enums
    assert.strictEqual(
      schema.properties.uniqueIds.items.properties.userId.type,
      "string",
    );
    assert.strictEqual(
      schema.properties.uniqueIds.items.properties.userId.enum,
      undefined,
    );
  });

  test("should detect coordinate arrays [lat, lon]", () => {
    const json = {
      locations: [
        { name: "Place A", coordinates: [40.7128, -74.006] },
        { name: "Place B", coordinates: [34.0522, -118.2437] },
        { name: "Place C", coords: [51.5074, -0.1278] }, // Different name, same pattern
      ],
    };
    const schema = createSchemaFromJson(json);
    // Test 'coordinates'
    const coordsSchema =
      schema.properties.locations.items.properties.coordinates;
    assert.strictEqual(coordsSchema.type, "array");
    assert.strictEqual(coordsSchema.items.type, "number");
    assert.strictEqual(coordsSchema.minItems, 2);
    assert.strictEqual(coordsSchema.maxItems, 2);
    // Test 'coords'
    const coordsSchema2 = schema.properties.locations.items.properties.coords;
    assert.strictEqual(coordsSchema2.type, "array");
    assert.strictEqual(coordsSchema2.items.type, "number");
    assert.strictEqual(coordsSchema2.minItems, 2);
    assert.strictEqual(coordsSchema2.maxItems, 2);
  });

  test(
    "should detect coordinate arrays [lat, lon, alt]",
    {
      skip: "todo - number and integer are treated as different schemas, resulting in a oneOf schema",
    },
    () => {
      const json = {
        points: [
          { id: 1, point: [40.7, -74.0, 10.0] },
          { id: 2, point: [34.0, -118.2, 50.5] },
        ],
      };
      const schema = createSchemaFromJson(json);
      const pointSchema = schema.properties.points.items.properties.point;
      assert.strictEqual(pointSchema.type, "array");
      assert.strictEqual(pointSchema.items.type, "number");
      assert.strictEqual(pointSchema.minItems, 3);
      assert.strictEqual(pointSchema.maxItems, 3);
    },
  );

  test(
    "should NOT detect coordinates if structure varies or type is wrong",
    { skip: "todo - minItems is being set" },
    () => {
      const json = {
        mixedCoords: [
          { id: 1, coordinates: [1, 2] },
          { id: 2, coordinates: [3, 4, 5] }, // Different length
        ],
        wrongType: [
          { id: 3, coordinates: ["lat", "lon"] }, // Wrong item type
        ],
      };
      const schema = createSchemaFromJson(json);
      const mixedSchema =
        schema.properties.mixedCoords.items.properties.coordinates;
      // Should fall back to default array inference (oneOf for items or simpler)
      assert.ok(mixedSchema.type === "array");
      assert.strictEqual(
        mixedSchema.minItems,
        undefined,
        "minItems shouldn't be set for varied length",
      );
      assert.strictEqual(
        mixedSchema.maxItems,
        undefined,
        "maxItems shouldn't be set for varied length",
      );

      const wrongTypeSchema =
        schema.properties.wrongType.items.properties.coordinates;
      assert.ok(wrongTypeSchema.type === "array");
      assert.strictEqual(
        wrongTypeSchema.minItems,
        undefined,
        "minItems shouldn't be set for wrong type",
      );
      assert.strictEqual(
        wrongTypeSchema.maxItems,
        undefined,
        "maxItems shouldn't be set for wrong type",
      );
      assert.strictEqual(
        wrongTypeSchema.items.type,
        "string",
        "Item type should be string",
      ); // Based on the single example
    },
  );

  test("should detect timestamp integers", () => {
    const now = Date.now();
    const json = {
      logs: [
        { event: "start", timestamp: now - 10000 },
        { event: "process", createdAt: now - 5000 },
        { event: "end", updatedAt: now },
      ],
    };
    const schema = createSchemaFromJson(json);
    const tsSchema = schema.properties.logs.items.properties.timestamp;
    assert.strictEqual(tsSchema.type, "integer");
    assert.strictEqual(tsSchema.format, "unix-timestamp");
    assert.ok(tsSchema.description.includes("Unix timestamp"));

    const createdSchema = schema.properties.logs.items.properties.createdAt;
    assert.strictEqual(createdSchema.type, "integer");
    assert.strictEqual(createdSchema.format, "unix-timestamp");

    const updatedSchema = schema.properties.logs.items.properties.updatedAt;
    assert.strictEqual(updatedSchema.type, "integer");
    assert.strictEqual(updatedSchema.format, "unix-timestamp");
  });

  test("should NOT detect timestamp for non-integer or out-of-range values", () => {
    const json = {
      data: [
        { id: 1, timestamp: 123.45 }, // Not an integer
        { id: 2, timestamp: -5000 }, // Too old (heuristically)
        { id: 3, timestamp: Date.now() },
      ],
    };
    const schema = createSchemaFromJson(json);
    const tsSchema = schema.properties.data.items.properties.timestamp;
    // Should merge to 'number' because of the float, or use oneOf if types differ significantly
    // The core idea is it should NOT get the 'unix-timestamp' format.
    assert.ok(
      tsSchema.type === "number" || tsSchema.oneOf,
      "Should be number or oneOf",
    );
    assert.strictEqual(tsSchema.format, undefined);
  });

  test("should handle arrays where items merge into a single object type", () => {
    const json = {
      values: [
        { common: "yes", typeA: 1 },
        { common: "yes", typeB: "hello" },
      ],
    };
    // Although items have different optional properties, the core structure merges.
    const schema = createSchemaFromJson(json);
    assert.strictEqual(schema.properties.values.type, "array");
    // Items should be a single object schema, not oneOf
    assert.strictEqual(schema.properties.values.items.type, "object");
    assert.ok(
      !schema.properties.values.items.oneOf,
      "Items should not be oneOf",
    );
    assert.strictEqual(
      schema.properties.values.items.properties.common.type,
      "string",
    );
    assert.strictEqual(
      schema.properties.values.items.properties.typeA.type,
      "integer",
    );
    assert.strictEqual(
      schema.properties.values.items.properties.typeB.type,
      "string",
    );
    // Only 'common' is required
    assert.deepStrictEqual(schema.properties.values.items.required, ["common"]);
  });

  test("should handle primitive root input (string)", () => {
    const json = "just a string";
    const schema = createSchemaFromJson(json);
    // Should wrap the primitive in an object
    assert.strictEqual(schema.type, "object");
    assert.ok(schema.properties.value, "Should have a 'value' property");
    assert.strictEqual(schema.properties.value.type, "string");
    assert.deepStrictEqual(schema.required, ["value"]);
    assert.ok(schema.title.includes("Primitive Root"));
  });

  test("should handle primitive root input (number)", () => {
    const json = 12345;
    const schema = createSchemaFromJson(json);
    assert.strictEqual(schema.type, "object");
    assert.ok(schema.properties.value, "Should have a 'value' property");
    assert.strictEqual(schema.properties.value.type, "integer");
    assert.deepStrictEqual(schema.required, ["value"]);
  });

  test("should handle primitive root input (boolean)", () => {
    const json = false;
    const schema = createSchemaFromJson(json);
    assert.strictEqual(schema.type, "object");
    assert.ok(schema.properties.value, "Should have a 'value' property");
    assert.strictEqual(schema.properties.value.type, "boolean");
    assert.deepStrictEqual(schema.required, ["value"]);
  });

  test("should handle array root input", () => {
    const json = [1, "two", true];
    const schema = createSchemaFromJson(json);
    assert.strictEqual(schema.type, "array");
    assert.ok(schema.items.oneOf, "Root array items should be oneOf");
    const oneOfTypes = schema.items.oneOf.map((s) => s.type);
    assert.deepStrictEqual(
      oneOfTypes.sort(),
      ["boolean", "integer", "string"].sort(),
    );
  });

  test("should handle empty array root input", () => {
    const json = [];
    const schema = createSchemaFromJson(json);
    assert.strictEqual(schema.type, "array");
    // Empty array results in an empty items object schema
    assert.deepStrictEqual(schema.items, {});
  });

  test("should handle null root input", () => {
    const json = null;
    const schema = createSchemaFromJson(json);
    // Should wrap in an object with a null type value
    assert.strictEqual(schema.type, "object");
    assert.ok(schema.properties.value, "Should have a 'value' property");
    assert.strictEqual(schema.properties.value.type, "null");
    assert.deepStrictEqual(schema.required, ["value"]);
  });

  test("should handle nested arrays and objects", () => {
    const json = {
      users: [
        { name: "Alice", hobbies: ["reading", "hiking"] },
        { name: "Bob", hobbies: ["gaming", "cooking"] },
      ],
    };
    const schema = createSchemaFromJson(json);
    assert.strictEqual(schema.properties.users.type, "array");
    assert.strictEqual(schema.properties.users.items.type, "object");
    assert.strictEqual(
      schema.properties.users.items.properties.name.type,
      "string",
    );
    assert.strictEqual(
      schema.properties.users.items.properties.hobbies.type,
      "array",
    );
    assert.strictEqual(
      schema.properties.users.items.properties.hobbies.items.type,
      "string",
    );
    assert.deepStrictEqual(schema.properties.users.items.required, [
      "hobbies",
      "name",
    ]);
  });
});
