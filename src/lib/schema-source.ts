import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import type { JsonSchema } from "../types/jsonSchema.ts";

export type SchemaSourceFormat = "yaml" | "json";

export function schemaToSource(
  schema: JsonSchema,
  format: SchemaSourceFormat,
): string {
  if (format === "json") {
    return `${JSON.stringify(schema, null, 2)}\n`;
  }

  return stringifyYaml(schema, {
    indent: 2,
    lineWidth: 0,
  });
}

export function sourceToSchema(
  source: string,
  format: SchemaSourceFormat,
): JsonSchema {
  if (format === "json") {
    return JSON.parse(source) as JsonSchema;
  }

  const parsedSchema = parseYaml(source);

  if (parsedSchema === undefined) {
    throw new Error("YAML schema source is empty.");
  }

  return parsedSchema as JsonSchema;
}

export function getSchemaSourceFileName(
  format: SchemaSourceFormat,
  baseName = "schema",
): string {
  const normalizedBaseName = baseName.replace(/\.(json|ya?ml)$/i, "");
  const extension = format === "json" ? "json" : "yaml";
  return `${normalizedBaseName}.${extension}`;
}

export function getSchemaSourceMimeType(format: SchemaSourceFormat): string {
  return format === "json" ? "application/json" : "application/yaml";
}
