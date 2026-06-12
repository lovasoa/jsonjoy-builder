import type { JsonSchema, ObjectJsonSchema } from "../types/jsonSchema.ts";
import { isObjectSchema } from "../types/jsonSchema.ts";
import { copySchema } from "./schemaEditor.ts";

/** The two keywords that hold reusable schema definitions */
export type DefinitionContainer = "$defs" | "definitions";

export const DEFINITION_CONTAINERS: DefinitionContainer[] = [
  "$defs",
  "definitions",
];

/** A referenceable schema found in the document */
export interface RefTarget {
  /** Definition name (the key inside $defs / definitions) */
  name: string;
  /** Full JSON Pointer fragment usable as a $ref value, e.g. "#/$defs/address" */
  pointer: string;
  schema: JsonSchema;
}

export type RefResolution =
  /** The reference points to a schema in this document */
  | { kind: "resolved"; schema: JsonSchema }
  /** The reference is local (starts with #) but its target does not exist */
  | { kind: "unresolved" }
  /** The reference points outside this document and cannot be previewed */
  | { kind: "external" };

/** Escapes a single JSON Pointer segment (RFC 6901) */
export function escapePointerSegment(segment: string): string {
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}

/** Unescapes a single JSON Pointer segment (RFC 6901) */
export function unescapePointerSegment(segment: string): string {
  return segment.replace(/~1/g, "/").replace(/~0/g, "~");
}

/** Builds a $ref value pointing at a definition, e.g. "#/$defs/address" */
export function definitionPointer(
  container: DefinitionContainer,
  name: string,
): string {
  return `#/${container}/${escapePointerSegment(name)}`;
}

function decodeFragmentSegment(segment: string): string | undefined {
  try {
    return unescapePointerSegment(decodeURIComponent(segment));
  } catch {
    return undefined;
  }
}

/**
 * Resolves a JSON Pointer (the part after "#") against the document root.
 * Returns undefined when the pointer does not lead to a schema.
 */
export function resolveJsonPointer(
  root: JsonSchema,
  pointer: string,
): JsonSchema | undefined {
  let current: unknown = root;
  if (pointer === "") return root;
  if (!pointer.startsWith("/")) return undefined;

  for (const rawSegment of pointer.slice(1).split("/")) {
    const segment = decodeFragmentSegment(rawSegment);
    if (segment === undefined) return undefined;

    if (Array.isArray(current)) {
      const index = /^(0|[1-9][0-9]*)$/.test(segment)
        ? Number(segment)
        : Number.NaN;
      if (!Number.isInteger(index) || index >= current.length) {
        return undefined;
      }
      current = current[index];
    } else if (current !== null && typeof current === "object") {
      if (!Object.prototype.hasOwnProperty.call(current, segment))
        return undefined;
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }

  // Only object and boolean values are schemas
  if (typeof current === "boolean") return current;
  if (
    current !== null &&
    typeof current === "object" &&
    !Array.isArray(current)
  )
    return current as JsonSchema;
  return undefined;
}

/** Keywords whose value is a single subschema */
const SINGLE_SUBSCHEMA_KEYWORDS = [
  "items",
  "contains",
  "additionalProperties",
  "propertyNames",
  "unevaluatedItems",
  "unevaluatedProperties",
  "contentSchema",
  "not",
  "if",
  "then",
  "else",
] as const;

/** Keywords whose value is an array of subschemas */
const ARRAY_SUBSCHEMA_KEYWORDS = [
  "prefixItems",
  "allOf",
  "anyOf",
  "oneOf",
] as const;

/** Keywords whose value is a map of subschemas */
const MAP_SUBSCHEMA_KEYWORDS = [
  "properties",
  "patternProperties",
  "dependentSchemas",
  "$defs",
  "definitions",
] as const;

/**
 * Walks every subschema of the document in a keyword-aware way, so that
 * plain data inside `const`, `enum`, `default` or `examples` is never
 * mistaken for a schema. The visitor receives each schema together with
 * its JSON Pointer (without the leading "#").
 */
export function walkSchema(
  schema: JsonSchema,
  visit: (schema: ObjectJsonSchema, pointer: string) => void,
  pointer = "",
): void {
  if (!isObjectSchema(schema)) return;

  visit(schema, pointer);

  for (const keyword of SINGLE_SUBSCHEMA_KEYWORDS) {
    const sub = schema[keyword];
    if (sub !== undefined && typeof sub !== "boolean") {
      walkSchema(sub, visit, `${pointer}/${keyword}`);
    }
  }

  for (const keyword of ARRAY_SUBSCHEMA_KEYWORDS) {
    const subs = schema[keyword];
    if (Array.isArray(subs)) {
      subs.forEach((sub, index) => {
        walkSchema(sub, visit, `${pointer}/${keyword}/${index}`);
      });
    }
  }

  for (const keyword of MAP_SUBSCHEMA_KEYWORDS) {
    const subs = schema[keyword];
    if (subs && typeof subs === "object") {
      for (const [name, sub] of Object.entries(subs)) {
        walkSchema(
          sub,
          visit,
          `${pointer}/${keyword}/${escapePointerSegment(name)}`,
        );
      }
    }
  }
}

/**
 * Resolves a $ref value against the document root. Supports "#" (the root
 * itself), "#/..." JSON Pointers and "#name" plain-name fragments declared
 * with $anchor or $dynamicAnchor. Anything that does not start with "#"
 * is reported as external.
 */
export function resolveRef(root: JsonSchema, ref: string): RefResolution {
  if (!ref.startsWith("#")) return { kind: "external" };
  if (ref === "#") return { kind: "resolved", schema: root };

  const fragment = ref.slice(1);
  if (fragment.startsWith("/")) {
    const schema = resolveJsonPointer(root, fragment);
    return schema === undefined
      ? { kind: "unresolved" }
      : { kind: "resolved", schema };
  }

  // Plain-name fragment: look for a matching $anchor / $dynamicAnchor
  let anchorName: string;
  try {
    anchorName = decodeURIComponent(fragment);
  } catch {
    return { kind: "unresolved" };
  }
  let found: JsonSchema | undefined;
  walkSchema(root, (schema) => {
    if (found !== undefined) return;
    if (schema.$anchor === anchorName || schema.$dynamicAnchor === anchorName) {
      found = schema;
    }
  });
  return found === undefined
    ? { kind: "unresolved" }
    : { kind: "resolved", schema: found };
}

/**
 * Collects every named definition in the document ($defs and the legacy
 * definitions keyword, at the root or nested in any subschema) as a list
 * of referenceable targets. Root-level definitions come first.
 */
export function collectRefTargets(root: JsonSchema): RefTarget[] {
  const rootTargets: RefTarget[] = [];
  const nestedTargets: RefTarget[] = [];

  walkSchema(root, (schema, pointer) => {
    for (const container of DEFINITION_CONTAINERS) {
      const defs = schema[container];
      if (!defs || typeof defs !== "object") continue;
      for (const [name, defSchema] of Object.entries(defs)) {
        const target: RefTarget = {
          name,
          pointer: `#${pointer}/${container}/${escapePointerSegment(name)}`,
          schema: defSchema,
        };
        (pointer === "" ? rootTargets : nestedTargets).push(target);
      }
    }
  });

  return [...rootTargets, ...nestedTargets];
}

/** A definition entry at the root of the document */
export interface DefinitionEntry {
  name: string;
  container: DefinitionContainer;
  pointer: string;
  schema: JsonSchema;
}

/** Lists the root-level definitions ($defs first, then legacy definitions) */
export function getRootDefinitions(root: JsonSchema): DefinitionEntry[] {
  if (!isObjectSchema(root)) return [];

  const entries: DefinitionEntry[] = [];
  for (const container of DEFINITION_CONTAINERS) {
    const defs = root[container];
    if (!defs || typeof defs !== "object") continue;
    for (const [name, schema] of Object.entries(defs)) {
      entries.push({
        name,
        container,
        pointer: definitionPointer(container, name),
        schema,
      });
    }
  }
  return entries;
}

/** Adds or replaces a root-level definition */
export function updateDefinition(
  root: ObjectJsonSchema,
  container: DefinitionContainer,
  name: string,
  schema: JsonSchema,
): ObjectJsonSchema {
  const newRoot = copySchema(root);
  newRoot[container] = { ...newRoot[container], [name]: schema };
  return newRoot;
}

/** Removes a root-level definition. References to it are left untouched. */
export function removeDefinition(
  root: ObjectJsonSchema,
  container: DefinitionContainer,
  name: string,
): ObjectJsonSchema {
  if (!root[container]) return root;

  const newRoot = copySchema(root);
  const { [name]: _, ...remaining } = newRoot[container] ?? {};
  if (Object.keys(remaining).length === 0) {
    delete newRoot[container];
  } else {
    newRoot[container] = remaining;
  }
  return newRoot;
}

/**
 * Renames a root-level definition, preserving its position, and rewrites
 * every $ref in the document that points at it (or below it) so existing
 * references keep working.
 */
export function renameDefinition(
  root: ObjectJsonSchema,
  container: DefinitionContainer,
  oldName: string,
  newName: string,
): ObjectJsonSchema {
  const defs = root[container];
  if (
    !defs ||
    !Object.prototype.hasOwnProperty.call(defs, oldName) ||
    oldName === newName
  ) {
    return root;
  }

  const newRoot = copySchema(root);
  const newDefs: Record<string, JsonSchema> = {};
  for (const [key, value] of Object.entries(newRoot[container] ?? {})) {
    newDefs[key === oldName ? newName : key] = value;
  }
  newRoot[container] = newDefs;

  const oldPointer = definitionPointer(container, oldName);
  const newPointer = definitionPointer(container, newName);
  walkSchema(newRoot, (schema) => {
    if (typeof schema.$ref !== "string") return;
    if (schema.$ref === oldPointer) {
      schema.$ref = newPointer;
    } else if (schema.$ref.startsWith(`${oldPointer}/`)) {
      schema.$ref = newPointer + schema.$ref.slice(oldPointer.length);
    }
  });

  return newRoot;
}
