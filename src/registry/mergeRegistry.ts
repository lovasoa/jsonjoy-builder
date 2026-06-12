import type {
  SchemaBuilderComponents,
  SchemaBuilderRegistry,
  SchemaBuilderSlots,
} from "./types.ts";

/**
 * Deep-ish merge of two registries.
 *
 * Merge contract (per namespace):
 * - `components`:      shallow per-key replace
 * - `slots`:           shallow per-key replace
 * - `slotProps`:       shallow per-slot merge
 *
 * No recursive deep merge inside a component definition.
 */

function mergeComponents(
  base: Partial<SchemaBuilderComponents> | undefined,
  override: Partial<SchemaBuilderComponents> | undefined,
): Partial<SchemaBuilderComponents> | undefined {
  if (!override) return base;
  if (!base) return override;
  return { ...base, ...override };
}

function mergeSlots(
  base: Partial<SchemaBuilderSlots> | undefined,
  override: Partial<SchemaBuilderSlots> | undefined,
): Partial<SchemaBuilderSlots> | undefined {
  if (!override) return base;
  if (!base) return override;
  return { ...base, ...override };
}

function mergeSlotProps(
  base: Record<string, Record<string, unknown>> | undefined,
  override: Record<string, Record<string, unknown>> | undefined,
): Record<string, Record<string, unknown>> | undefined {
  if (!override) return base;
  if (!base) return override;
  const result: Record<string, Record<string, unknown>> = { ...base };
  for (const key of Object.keys(override)) {
    result[key] = { ...(result[key] || {}), ...override[key] };
  }
  return result;
}

/**
 * Merge two registries, with `override` taking precedence over `base`.
 *
 * Per-namespace strategy:
 * - `components` — shallow per-key replace: each key in `override.components`
 *   replaces the same key in `base.components`; unmentioned keys are kept.
 * - `slots` — same shallow per-key replace.
 * - `slotProps` — shallow merge per slot: props in `override.slotProps[K]`
 *   are spread over `base.slotProps[K]`, so individual props can be overridden
 *   without replacing the entire slot-props object.
 *
 * Either argument may be `undefined`; the other is returned as-is.
 *
 * @public
 */
export function mergeRegistry(
  base: SchemaBuilderRegistry | undefined,
  override: SchemaBuilderRegistry | undefined,
): SchemaBuilderRegistry {
  if (!override) return base || {};
  if (!base) return override;
  return {
    components: mergeComponents(base.components, override.components),
    slots: mergeSlots(base.slots, override.slots),
    slotProps: mergeSlotProps(base.slotProps, override.slotProps),
  };
}
