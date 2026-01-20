import { render } from "@testing-library/react";
import "global-jsdom/register";
import { describe, test } from "node:test";
import React from "react";
import SchemaVisualEditor from "../../../src/components/SchemaEditor/SchemaVisualEditor.tsx";
import { DragProvider } from "../../../src/components/SchemaEditor/DragContext.tsx";

describe("SchemaVisualEditor", () => {
  test("write mode does show constraints", (t) => {
    const element = React.createElement(
      DragProvider,
      null,
      React.createElement(SchemaVisualEditor, {
        readOnly: false,
        onChange: () => {},
        schema: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
          },
        },
      }),
    );
    t.assert.snapshot(render(element).container.innerHTML);
  });
  test("read-only mode doesn't show constraints", (t) => {
    const element = React.createElement(
      DragProvider,
      null,
      React.createElement(SchemaVisualEditor, {
        readOnly: true,
        onChange: () => {},
        schema: {
          type: "object",
          properties: {
            name: {
              type: "string",
            },
          },
        },
      }),
    );
    t.assert.snapshot(render(element).container.innerHTML);
  });
});
