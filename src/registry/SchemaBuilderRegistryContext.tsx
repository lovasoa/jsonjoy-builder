import { createContext, type ReactNode, useContext, useMemo } from "react";
import { defaultRegistry } from "./defaults.tsx";
import { mergeRegistry } from "./mergeRegistry.ts";
import type {
  SchemaBuilderComponents,
  SchemaBuilderRegistry,
  SchemaBuilderSlots,
} from "./types.ts";

// ── Context ──────────────────────────────────

const SchemaBuilderRegistryContext =
  createContext<SchemaBuilderRegistry>(defaultRegistry);

// ── Provider ─────────────────────────────────

/**
 * Provides a registry of UI components and layout slots to the editor tree.
 * Registries nest: each provider merges its `value` on top of the nearest
 * parent registry, so you only need to override the parts you care about.
 *
 * @example
 * ```tsx
 * <SchemaBuilderRegistryProvider value={{ components: { Button: MyButton, Input: MyInput } }}>
 *   <SchemaBuilder schema={schema} onChange={onChange} />
 * </SchemaBuilderRegistryProvider>
 * ```
 *
 * @public
 */
export function SchemaBuilderRegistryProvider({
  value,
  children,
}: {
  value?: SchemaBuilderRegistry;
  children: ReactNode;
}) {
  const parent = useContext(SchemaBuilderRegistryContext);
  const merged = useMemo(() => mergeRegistry(parent, value), [parent, value]);
  return (
    <SchemaBuilderRegistryContext value={merged}>
      {children}
    </SchemaBuilderRegistryContext>
  );
}

// ── Hooks ────────────────────────────────────

/** Read the current registry tree. */
export function useRegistry(): SchemaBuilderRegistry {
  return useContext(SchemaBuilderRegistryContext);
}

/** Get a single component from the registry. Falls back to the default. */
export function useComponent<K extends keyof SchemaBuilderComponents>(
  name: K,
): SchemaBuilderComponents[K] {
  const reg = useContext(SchemaBuilderRegistryContext);
  const overridden = reg.components?.[name];
  if (overridden) return overridden as SchemaBuilderComponents[K];
  return defaultRegistry.components[name] as SchemaBuilderComponents[K];
}

/** Get a single slot from the registry. Falls back to the default. */
export function useSlot<K extends keyof SchemaBuilderSlots>(
  name: K,
): SchemaBuilderSlots[K] {
  const reg = useContext(SchemaBuilderRegistryContext);
  const overridden = reg.slots?.[name];
  if (overridden) return overridden as SchemaBuilderSlots[K];
  return defaultRegistry.slots[name] as SchemaBuilderSlots[K];
}

/** Get slotProps for a given slot name. Merges defaults with user-provided props. */
export function useSlotProps(slotName: string): Record<string, unknown> {
  const reg = useContext(SchemaBuilderRegistryContext);
  return reg.slotProps?.[slotName] ?? {};
}
