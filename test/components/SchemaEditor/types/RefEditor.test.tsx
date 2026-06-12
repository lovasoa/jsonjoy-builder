import { render } from "@testing-library/react";
import "global-jsdom/register";
import { describe, test } from "node:test";
import React from "react";
import RefEditor from "../../../../src/components/SchemaEditor/types/RefEditor.tsx";
import { RootSchemaContext } from "../../../../src/hooks/use-root-schema.ts";
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

function renderRefEditor(schema: ObjectJsonSchema, readOnly: boolean) {
  const element = React.createElement(
    RootSchemaContext.Provider,
    { value: rootSchema },
    React.createElement(RefEditor, {
      readOnly,
      onChange: () => {},
      schema,
      validationNode: undefined,
    }),
  );
  return render(element).container.innerHTML;
}

describe("RefEditor", () => {
  test("write mode shows the target input and picker", (t) => {
    t.assert.snapshot(renderRefEditor({ $ref: "#/$defs/address" }, false));
  });

  test("read-only mode shows the target without editing controls", (t) => {
    t.assert.snapshot(renderRefEditor({ $ref: "#/$defs/address" }, true));
  });

  test("warns about a reference that does not resolve", (t) => {
    t.assert.snapshot(renderRefEditor({ $ref: "#/$defs/missing" }, false));
  });

  test("flags external references", (t) => {
    t.assert.snapshot(
      renderRefEditor({ $ref: "https://example.com/schema.json" }, false),
    );
  });
});
