import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { mergeRegistry } from "../../src/registry/mergeRegistry.ts";
import type { SchemaBuilderRegistry } from "../../src/registry/types.ts";

describe("mergeRegistry", () => {
  test("undefined override returns base", () => {
    const base: SchemaBuilderRegistry = {
      components: { Button: (() => null) as never },
    };
    const result = mergeRegistry(base, undefined);
    assert.equal(result.components?.Button, base.components?.Button);
  });

  test("undefined base returns override", () => {
    const override: SchemaBuilderRegistry = {
      components: { Button: (() => null) as never },
    };
    const result = mergeRegistry(undefined, override);
    assert.equal(result.components?.Button, override.components?.Button);
  });

  test("both undefined returns empty object", () => {
    const result = mergeRegistry(undefined, undefined);
    assert.deepEqual(result, {});
  });

  test("component override replaces without affecting other components", () => {
    const base: SchemaBuilderRegistry = {
      components: {
        Button: (() => "BaseButton") as never,
        Input: (() => "BaseInput") as never,
      },
    };
    const override: SchemaBuilderRegistry = {
      components: { Button: (() => "OverrideButton") as never },
    };
    const result = mergeRegistry(base, override);
    assert.equal(result.components?.Button, override.components?.Button);
    assert.equal(result.components?.Input, base.components?.Input);
  });

  test("slotProps shallow merges per slot", () => {
    const base: SchemaBuilderRegistry = {
      slotProps: { FieldFrame: { variant: "default", size: "md" } },
    };
    const override: SchemaBuilderRegistry = {
      slotProps: { FieldFrame: { variant: "compact" } },
    };
    const result = mergeRegistry(base, override);
    assert.equal(
      (result.slotProps?.FieldFrame as Record<string, unknown>).variant,
      "compact",
    );
    assert.equal(
      (result.slotProps?.FieldFrame as Record<string, unknown>).size,
      "md",
    );
  });
});
