import { render } from "@testing-library/react";
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
});
