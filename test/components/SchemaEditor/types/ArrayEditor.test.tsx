import { render } from '@testing-library/react';
import 'global-jsdom/register';
import { describe, test } from "node:test";
import React from 'react';
import ArrayEditor from '../../../../src/components/SchemaEditor/types/ArrayEditor';

describe("ArrayEditor", () => {
  test("write mode does show constraints", t => {
    const element = React.createElement(ArrayEditor, {
      readOnly: false,
      onChange: () => { },
      depth: 0,
      validationNode: undefined,
      schema: {
        type: 'array',
        items: {
          type: 'string',
        }
      },
    });
    t.assert.snapshot(render(element).container.innerHTML);
  });
  test("read-only mode doesn't show constraints", t => {
    const element = React.createElement(ArrayEditor, {
      readOnly: true,
      onChange: () => { },
      depth: 0,
      validationNode: undefined,
      schema: {
        type: 'array',
        items: {
          type: 'string',
        }
      },
    });
    t.assert.snapshot(render(element).container.innerHTML);
  });
});
