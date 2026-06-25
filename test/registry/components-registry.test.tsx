import assert from "node:assert/strict";
import { describe, test } from "node:test";
import "global-jsdom/register";
import { render } from "@testing-library/react";
import {
  SchemaBuilderRegistryProvider,
  useComponent,
} from "../../src/registry/SchemaBuilderRegistryContext.tsx";
import type { SchemaBuilderRegistry } from "../../src/registry/types.ts";

describe("components-registry", () => {
  test("custom Button renders instead of default", () => {
    function CustomButton() {
      return <div data-testid="custom-button">Custom</div>;
    }

    const registry: SchemaBuilderRegistry = {
      components: { Button: CustomButton as never },
    };

    function TestComponent() {
      const Button = useComponent("Button");
      return <Button />;
    }

    const { container } = render(
      <SchemaBuilderRegistryProvider value={registry}>
        <TestComponent />
      </SchemaBuilderRegistryProvider>,
    );

    assert.ok(container.querySelector('[data-testid="custom-button"]'));
  });

  test("custom Input renders instead of default", () => {
    function CustomInput() {
      return <input data-testid="custom-input" />;
    }

    const registry: SchemaBuilderRegistry = {
      components: { Input: CustomInput as never },
    };

    function TestComponent() {
      const Input = useComponent("Input");
      return <Input />;
    }

    const { container } = render(
      <SchemaBuilderRegistryProvider value={registry}>
        <TestComponent />
      </SchemaBuilderRegistryProvider>,
    );

    assert.ok(container.querySelector('[data-testid="custom-input"]'));
  });

  test("custom Switch renders instead of default", () => {
    function CustomSwitch() {
      return <div data-testid="custom-switch" />;
    }

    const registry: SchemaBuilderRegistry = {
      components: { Switch: CustomSwitch as never },
    };

    function TestComponent() {
      const Switch = useComponent("Switch");
      return <Switch />;
    }

    const { container } = render(
      <SchemaBuilderRegistryProvider value={registry}>
        <TestComponent />
      </SchemaBuilderRegistryProvider>,
    );

    assert.ok(container.querySelector('[data-testid="custom-switch"]'));
  });

  test("component override does not affect others", () => {
    function CustomButton() {
      return <div data-testid="only-button" />;
    }

    const registry: SchemaBuilderRegistry = {
      components: { Button: CustomButton as never },
    };

    function TestComponent() {
      const Button = useComponent("Button");
      const Input = useComponent("Input");
      return (
        <div>
          <Button />
          <Input />
        </div>
      );
    }

    const { container } = render(
      <SchemaBuilderRegistryProvider value={registry}>
        <TestComponent />
      </SchemaBuilderRegistryProvider>,
    );

    // Custom Button renders, default Input still renders (no crash)
    assert.ok(container.querySelector('[data-testid="only-button"]'));
  });
});
