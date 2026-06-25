import assert from "node:assert/strict";
import { describe, test } from "node:test";
import "global-jsdom/register";
import { render } from "@testing-library/react";
import {
  SchemaBuilderRegistryProvider,
  useRegistry,
} from "../../src/registry/SchemaBuilderRegistryContext.tsx";
import type { SchemaBuilderRegistry } from "../../src/registry/types.ts";

describe("SchemaBuilderRegistryProvider nesting", () => {
  function ParentButton() {
    return null;
  }
  function ChildButton() {
    return null;
  }
  function ChildInput() {
    return null;
  }

  test("child provider without value is no-op (uses parent)", () => {
    const parentRegistry: SchemaBuilderRegistry = {
      components: {
        Button: ParentButton,
      },
    };
    let captured: SchemaBuilderRegistry | null = null;

    function Child() {
      captured = useRegistry();
      return null;
    }

    render(
      <SchemaBuilderRegistryProvider value={parentRegistry}>
        <SchemaBuilderRegistryProvider>
          <Child />
        </SchemaBuilderRegistryProvider>
      </SchemaBuilderRegistryProvider>,
    );

    assert.equal(captured?.components?.Button, ParentButton);
  });

  test("child provider with value merges with parent", () => {
    const parentRegistry: SchemaBuilderRegistry = {
      components: {
        Button: ParentButton,
      },
    };
    const childRegistry: SchemaBuilderRegistry = {
      components: {
        Input: ChildInput,
      },
    };
    let captured: SchemaBuilderRegistry | null = null;

    function Child() {
      captured = useRegistry();
      return null;
    }

    render(
      <SchemaBuilderRegistryProvider value={parentRegistry}>
        <SchemaBuilderRegistryProvider value={childRegistry}>
          <Child />
        </SchemaBuilderRegistryProvider>
      </SchemaBuilderRegistryProvider>,
    );

    assert.equal(captured?.components?.Button, ParentButton);
    assert.equal(captured?.components?.Input, ChildInput);
  });

  test("child override replaces parent key", () => {
    const parentRegistry: SchemaBuilderRegistry = {
      components: {
        Button: ParentButton,
      },
    };
    const childRegistry: SchemaBuilderRegistry = {
      components: {
        Button: ChildButton,
      },
    };
    let captured: SchemaBuilderRegistry | null = null;

    function Child() {
      captured = useRegistry();
      return null;
    }

    render(
      <SchemaBuilderRegistryProvider value={parentRegistry}>
        <SchemaBuilderRegistryProvider value={childRegistry}>
          <Child />
        </SchemaBuilderRegistryProvider>
      </SchemaBuilderRegistryProvider>,
    );

    assert.equal(captured?.components?.Button, ChildButton);
  });
});
