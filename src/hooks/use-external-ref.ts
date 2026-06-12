import { createContext, useContext, useEffect, useState } from "react";
import {
  type ExternalRefResolver,
  resolveExternalDocument,
  resolveFragment,
  splitRefUri,
} from "../lib/refUtils.ts";
import type { JsonSchema } from "../types/jsonSchema.ts";

/**
 * The resolver an application can provide (through the resolveExternalRef
 * prop) to let the editor load and preview external $ref targets. When
 * undefined, external references are preserved but never loaded.
 */
export const ExternalRefResolverContext = createContext<
  ExternalRefResolver | undefined
>(undefined);

export type ExternalSchemaState =
  /** No resolver configured (or the reference is not external) */
  | { status: "unavailable" }
  | { status: "loading" }
  /** The document could not be loaded or parsed */
  | { status: "error"; message: string }
  /** The document loaded but the fragment does not exist in it */
  | { status: "broken" }
  | { status: "loaded"; documentSchema: JsonSchema; schema: JsonSchema };

/**
 * Loads the schema behind an external $ref through the resolver from
 * context. Pass undefined while the reference is local to skip loading.
 */
export function useExternalSchema(
  ref: string | undefined,
): ExternalSchemaState {
  const resolver = useContext(ExternalRefResolverContext);
  const [state, setState] = useState<ExternalSchemaState>({
    status: "unavailable",
  });

  useEffect(() => {
    if (!resolver || ref === undefined) {
      setState({ status: "unavailable" });
      return;
    }

    let cancelled = false;
    setState({ status: "loading" });
    const { documentUri, fragment } = splitRefUri(ref);
    resolveExternalDocument(resolver, documentUri).then(
      (documentSchema) => {
        if (cancelled) return;
        const schema = resolveFragment(documentSchema, fragment);
        setState(
          schema === undefined
            ? { status: "broken" }
            : { status: "loaded", documentSchema, schema },
        );
      },
      (error: unknown) => {
        if (cancelled) return;
        setState({
          status: "error",
          message: error instanceof Error ? error.message : String(error),
        });
      },
    );

    return () => {
      cancelled = true;
    };
  }, [resolver, ref]);

  return state;
}
