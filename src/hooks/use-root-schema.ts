import { createContext, useContext } from "react";
import type { JsonSchema } from "../types/jsonSchema.ts";

/**
 * Holds the root schema of the document being edited, so that deeply
 * nested editors can list available definitions and resolve $ref values
 * against the whole document.
 */
export const RootSchemaContext = createContext<JsonSchema | undefined>(
  undefined,
);

/**
 * Returns the root schema of the edited document. Falls back to the
 * given schema when no provider is present (e.g. when an editor
 * component is rendered standalone).
 */
export function useRootSchema(fallback: JsonSchema): JsonSchema {
  const root = useContext(RootSchemaContext);
  return root === undefined ? fallback : root;
}
