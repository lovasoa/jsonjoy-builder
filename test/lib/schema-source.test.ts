import assert from "node:assert";
import { describe, test } from "node:test";
import {
  getSchemaSourceFileName,
  getSchemaSourceMimeType,
  schemaToSource,
  sourceToSchema,
} from "../../src/lib/schema-source.ts";
import type { JsonSchema } from "../../src/types/jsonSchema.ts";

describe("schema source conversion", () => {
  const schema: JsonSchema = {
    type: "object",
    required: ["name"],
    properties: {
      name: {
        type: "string",
        description: "User name",
      },
    },
  };

  test("serializes schemas as YAML", () => {
    assert.strictEqual(
      schemaToSource(schema, "yaml"),
      [
        "type: object",
        "required:",
        "  - name",
        "properties:",
        "  name:",
        "    type: string",
        "    description: User name",
        "",
      ].join("\n"),
    );
  });

  test("serializes schemas as JSON", () => {
    assert.strictEqual(
      schemaToSource(schema, "json"),
      [
        "{",
        '  "type": "object",',
        '  "required": [',
        '    "name"',
        "  ],",
        '  "properties": {',
        '    "name": {',
        '      "type": "string",',
        '      "description": "User name"',
        "    }",
        "  }",
        "}",
        "",
      ].join("\n"),
    );
  });

  test("parses YAML source into the same schema object shape used by JSON logic", () => {
    const source = [
      "type: object",
      "required:",
      "  - enabled",
      "properties:",
      "  enabled:",
      "    type: boolean",
      "additionalProperties: false",
      "",
    ].join("\n");

    assert.deepStrictEqual(sourceToSchema(source, "yaml"), {
      type: "object",
      required: ["enabled"],
      properties: {
        enabled: {
          type: "boolean",
        },
      },
      additionalProperties: false,
    });
  });

  test("parses JSON source into the same schema object shape used by JSON logic", () => {
    assert.deepStrictEqual(
      sourceToSchema(
        [
          "{",
          '  "type": "object",',
          '  "properties": {',
          '    "enabled": { "type": "boolean" }',
          "  }",
          "}",
        ].join("\n"),
        "json",
      ),
      {
        type: "object",
        properties: {
          enabled: {
            type: "boolean",
          },
        },
      },
    );
  });

  test("supports boolean JSON schemas", () => {
    assert.strictEqual(sourceToSchema("true\n", "yaml"), true);
    assert.strictEqual(schemaToSource(false, "yaml"), "false\n");
    assert.strictEqual(sourceToSchema("false\n", "json"), false);
    assert.strictEqual(schemaToSource(true, "json"), "true\n");
  });

  test("matches download file names and mime types to the selected format", () => {
    assert.strictEqual(getSchemaSourceFileName("yaml"), "schema.yaml");
    assert.strictEqual(getSchemaSourceFileName("json"), "schema.json");
    assert.strictEqual(
      getSchemaSourceFileName("json", "custom-schema.yaml"),
      "custom-schema.json",
    );
    assert.strictEqual(getSchemaSourceMimeType("yaml"), "application/yaml");
    assert.strictEqual(getSchemaSourceMimeType("json"), "application/json");
  });
});
