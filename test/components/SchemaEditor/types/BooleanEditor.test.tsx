import { render } from '@testing-library/react';
import 'global-jsdom/register';
import { describe, test } from "node:test";
import React from 'react';
import BooleanEditor from '../../../../src/components/SchemaEditor/types/BooleanEditor';

describe("BooleanEditor", () => {
  test("write mode does show constraints", t => {
    const element = React.createElement(BooleanEditor, {
      readOnly: false,
      onChange: () => { },
      schema: {
        type: 'boolean',
      },
    });
    t.assert.snapshot(render(element).container.innerHTML);
  });
  test("read-only mode doesn't show constraints", t => {
    const element = React.createElement(BooleanEditor, {
      readOnly: true,
      onChange: () => { },
      schema: {
        type: 'boolean',
      },
    });
    t.assert.snapshot(render(element).container.innerHTML);
  });
});
