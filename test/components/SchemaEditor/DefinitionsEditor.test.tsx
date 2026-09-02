import { render } from "@testing-library/react";
import "global-jsdom/register";
import { describe, test } from "node:test";
import React from "react";
import DefinitionsEditor from "../../../src/components/SchemaEditor/DefinitionsEditor.tsx";
import { RootSchemaContext } from "../../../src/hooks/use-root-schema.ts";
import type { ObjectJsonSchema } from "../../../src/types/jsonSchema.ts";

const schemaWithDefs: ObjectJsonSchema = {
  type: "object",
  $defs: {
    address: {
      type: "object",
      properties: { city: { type: "string" } },
    },
    tag: { type: "string" },
  },
};

const emptySchema: ObjectJsonSchema = { type: "object" };

function renderDefinitionsEditor(schema: ObjectJsonSchema, readOnly: boolean) {
  const element = React.createElement(
    RootSchemaContext.Provider,
    { value: schema },
    React.createElement(DefinitionsEditor, {
      schema,
      readOnly,
      onChange: () => {},
    }),
  );
  return render(element);
}

describe("DefinitionsEditor", () => {
  test("renders definitions from $defs in write mode", (t) => {
    t.assert.snapshot(
      renderDefinitionsEditor(schemaWithDefs, false).container.innerHTML,
    );
  });

  test("read-only mode with definitions renders without editing controls", (t) => {
    t.assert.snapshot(
      renderDefinitionsEditor(schemaWithDefs, true).container.innerHTML,
    );
  });

  test("write mode with no definitions shows the add form", (t) => {
    t.assert.snapshot(
      renderDefinitionsEditor(emptySchema, false).container.innerHTML,
    );
  });

  test("read-only mode with no definitions renders nothing", (t) => {
    const { container } = renderDefinitionsEditor(emptySchema, true);
    t.assert.snapshot(container.innerHTML);
  });
});
