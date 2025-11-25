import { render } from '@testing-library/react';
import 'global-jsdom/register';
import { describe, test } from "node:test";
import React from 'react';
import NumberEditor from '../../../../src/components/SchemaEditor/types/NumberEditor';

describe("NumberEditor", () => {
  test("write mode does show constraints", t => {
    const element = React.createElement(NumberEditor, {
      readOnly: false,
      onChange: () => { },
      schema: {
        type: 'number',
      },
    });
    t.assert.snapshot(render(element).container.innerHTML);
  });
  test("read-only mode doesn't show constraints", t => {
    const element = React.createElement(NumberEditor, {
      readOnly: true,
      onChange: () => { },
      schema: {
        type: 'number',
      },
    });
    t.assert.snapshot(render(element).container.innerHTML);
  });
});
