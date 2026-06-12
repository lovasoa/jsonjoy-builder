import { render, waitFor, within } from "@testing-library/react";
import "global-jsdom/register";
import { describe, test } from "node:test";
import React from "react";
import RefEditor from "../../../../src/components/SchemaEditor/types/RefEditor.tsx";
import { ExternalRefResolverContext } from "../../../../src/hooks/use-external-ref.ts";
import { RootSchemaContext } from "../../../../src/hooks/use-root-schema.ts";
import type { ExternalRefResolver } from "../../../../src/lib/refUtils.ts";
import type { ObjectJsonSchema } from "../../../../src/types/jsonSchema.ts";

const rootSchema: ObjectJsonSchema = {
  type: "object",
  properties: {
    home: { $ref: "#/$defs/address" },
  },
  $defs: {
    address: {
      type: "object",
      properties: { city: { type: "string" } },
    },
  },
};

function renderRefEditor(
  schema: ObjectJsonSchema,
  readOnly: boolean,
  resolveExternalRef?: ExternalRefResolver,
) {
  const element = React.createElement(
    RootSchemaContext.Provider,
    { value: rootSchema },
    React.createElement(
      ExternalRefResolverContext.Provider,
      { value: resolveExternalRef },
      React.createElement(RefEditor, {
        readOnly,
        onChange: () => {},
        schema,
        validationNode: undefined,
      }),
    ),
  );
  return render(element);
}

describe("RefEditor", () => {
  test("write mode shows the target input and picker", (t) => {
    t.assert.snapshot(
      renderRefEditor({ $ref: "#/$defs/address" }, false).container.innerHTML,
    );
  });

  test("read-only mode shows the target without editing controls", (t) => {
    t.assert.snapshot(
      renderRefEditor({ $ref: "#/$defs/address" }, true).container.innerHTML,
    );
  });

  test("warns about a reference that does not resolve", (t) => {
    t.assert.snapshot(
      renderRefEditor({ $ref: "#/$defs/missing" }, false).container.innerHTML,
    );
  });

  test("flags external references when no resolver is configured", (t) => {
    t.assert.snapshot(
      renderRefEditor({ $ref: "https://example.com/schema.json" }, false)
        .container.innerHTML,
    );
  });

  test("previews external references through the resolver", async (t) => {
    const resolver: ExternalRefResolver = () =>
      Promise.resolve({
        type: "object",
        properties: { id: { type: "string" } },
      });

    const { container } = renderRefEditor(
      { $ref: "https://example.com/schema.json#/properties/id" },
      false,
      resolver,
    );

    await waitFor(() => within(container).getByText("Show referenced schema"));
    t.assert.snapshot(container.innerHTML);
  });

  test("reports resolver failures", async (t) => {
    const resolver: ExternalRefResolver = () =>
      Promise.reject(new Error("404 Not Found"));

    const { container } = renderRefEditor(
      { $ref: "https://example.com/broken.json" },
      false,
      resolver,
    );

    await waitFor(() => within(container).getByText("404 Not Found"));
    t.assert.snapshot(container.innerHTML);
  });
});
