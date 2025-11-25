import { render } from "@testing-library/react";
import "global-jsdom/register";
import { describe, test } from "node:test";
import React from "react";
import StringEditor from "../../../../src/components/SchemaEditor/types/StringEditor.tsx";

describe("StringEditor", () => {
  test("write mode does show constraints", (t) => {
    const element = React.createElement(StringEditor, {
      readOnly: false,
      onChange: () => {},
      validationNode: undefined,
      schema: {
        type: "number",
      },
    });
    t.assert.snapshot(render(element).container.innerHTML);
  });
  test("read-only mode doesn't show constraints", (t) => {
    const element = React.createElement(StringEditor, {
      readOnly: true,
      onChange: () => {},
      validationNode: undefined,
      schema: {
        type: "number",
      },
    });
    t.assert.snapshot(render(element).container.innerHTML);
  });
});
