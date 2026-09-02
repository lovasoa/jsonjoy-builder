import { render, waitFor, within } from "@testing-library/react";
import "global-jsdom/register";
import { describe, test } from "node:test";
import React from "react";
import { SchemaFieldsEditor } from "../../../src/index.ts";

describe("SchemaFieldsEditor", () => {
  test("write mode does show constraints", (t) => {
    const element = React.createElement(SchemaFieldsEditor, {
      readOnly: false,
      onChange: () => {},
      value: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
        },
      },
    });
    t.assert.snapshot(render(element).container.innerHTML);
  });
  test("read-only mode doesn't show constraints", (t) => {
    const element = React.createElement(SchemaFieldsEditor, {
      readOnly: true,
      onChange: () => {},
      value: {
        type: "object",
        properties: {
          name: {
            type: "string",
          },
        },
      },
    });
    t.assert.snapshot(render(element).container.innerHTML);
  });
  test("renders a combinator editor for a root-level allOf", async (t) => {
    // The shape from extending an external schema: allOf of a $ref
    // plus local additions, with no root-level properties
    const element = React.createElement(SchemaFieldsEditor, {
      readOnly: false,
      onChange: () => {},
      value: {
        type: "object",
        allOf: [
          { $ref: "https://example.com/base.json" },
          { properties: { data: {} } },
        ],
      },
    });
    const { container } = render(element);
    // The combinator editor is lazy-loaded behind Suspense
    await waitFor(() => within(container).getByText("Schema 1"));
    t.assert.snapshot(container.innerHTML);
  });
  test("renders a ref editor for a root-level $ref", async (t) => {
    const element = React.createElement(SchemaFieldsEditor, {
      readOnly: false,
      onChange: () => {},
      value: { $ref: "#/$defs/base", $defs: { base: { type: "object" } } },
    });
    const { container } = render(element);
    await waitFor(() => within(container).getByText("Reference target"));
    t.assert.snapshot(container.innerHTML);
  });
});
