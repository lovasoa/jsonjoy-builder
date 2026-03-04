import { render } from "@testing-library/react";
import "global-jsdom/register";
import { describe, test } from "node:test";
import React from "react";
import { DragProvider } from "../../../../src/components/SchemaEditor/DragContext.tsx";
import ObjectEditor from "../../../../src/components/SchemaEditor/types/ObjectEditor.tsx";

describe("ObjectEditor", () => {
  test("write mode does show constraints", (t) => {
    const element = React.createElement(
      DragProvider,
      null,
      React.createElement(ObjectEditor, {
        readOnly: false,
        onChange: () => {},
        depth: 0,
        validationNode: undefined,
        // Root path for the visual editor schema node
        path: [],
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
      React.createElement(ObjectEditor, {
        readOnly: true,
        onChange: () => {},
        depth: 0,
        validationNode: undefined,
        // Root path for the visual editor schema node
        path: [],
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
