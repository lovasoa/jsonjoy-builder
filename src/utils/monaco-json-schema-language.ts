/**
 * Custom Monaco language definition for JSON Schema
 * Provides semantic colorization for schema keywords
 */

import type * as Monaco from "monaco-editor";

export function registerJsonSchemaLanguage(monaco: typeof Monaco) {
  // Register custom language for JSON Schema
  monaco.languages.register({ id: 'jsonschema' });

  // Define tokenization rules for JSON Schema
  monaco.languages.setMonarchTokensProvider('jsonschema', {
    // Set defaultToken to invalid to see what's not being tokenized
    defaultToken: 'invalid',
    
    // Keywords that represent types
    typeKeywords: ['string', 'number', 'integer', 'boolean', 'object', 'array', 'null'],
    
    // Schema keywords
    schemaKeywords: [
      'type', 'properties', 'items', 'required', 'enum', 'const',
      'if', 'then', 'else', 'allOf', 'anyOf', 'oneOf', 'not',
      'prefixItems', 'contains', 'minItems', 'maxItems', 'uniqueItems',
      'minimum', 'maximum', 'minLength', 'maxLength', 'pattern', 'format',
      '$schema', '$id', '$ref', '$defs', '$dynamicRef', '$dynamicAnchor',
      'definitions', 'additionalProperties', 'patternProperties',
      'dependentSchemas', 'dependentRequired',
      'unevaluatedProperties', 'unevaluatedItems',
      'title', 'description', 'default', 'examples'
    ],

    tokenizer: {
      root: [
        // Whitespace
        { include: '@whitespace' },
        
        // Property keys - detect schema keywords
        [/"(type|format|$schema|$id|$ref|$defs|$dynamicRef|$dynamicAnchor)"/, { token: 'schema-keyword-key' }],
        [/"([^"\\]|\\.)*"(?=\s*:)/, { token: 'key' }],
        
        // String values - check if they're type names after "type":
        [/"(string)"/, { token: 'type-string-value' }],
        [/"(number|integer)"/, { token: 'type-number-value' }],
        [/"(boolean)"/, { token: 'type-boolean-value' }],
        [/"(object)"/, { token: 'type-object-value' }],
        [/"(array)"/, { token: 'type-array-value' }],
        [/"(null)"/, { token: 'type-null-value' }],
        
        // Regular string values
        [/"([^"\\]|\\.)*"/, { token: 'string' }],
        
        // Numbers
        [/-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/, { token: 'number' }],
        
        // Booleans and null
        [/true|false/, { token: 'boolean' }],
        [/null/, { token: 'null' }],
        
        // Delimiters
        [/[{}[\]]/, '@brackets'],
        [/[,:]/, { token: 'delimiter' }],
      ],

      whitespace: [
        [/\s+/, 'white'],
      ],
    },
  });

  // Set language configuration for JSON Schema
  monaco.languages.setLanguageConfiguration('jsonschema', {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/']
    },
    brackets: [
      ['{', '}'],
      ['[', ']']
    ],
    autoClosingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '"', close: '"' }
    ],
    surroundingPairs: [
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '"', close: '"' }
    ]
  });
}