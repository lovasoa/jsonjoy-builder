# JSON Schema Features

This project includes two key features for working with JSON Schemas:

1. **JSON Schema Inference**: Automatically generates a JSON Schema from a JSON document
2. **JSON Validation**: Validates JSON documents against the current schema

## Implementation Details

### JSON Schema Inference

The schema inference feature is implemented using a custom algorithm that analyzes JSON data and generates an appropriate schema. It's designed to:

- Detect data types (string, number, boolean, object, array)
- Identify common string formats (date, date-time, email, uuid, uri)
- Handle nested objects and arrays
- Support mixed-type arrays using `oneOf`
- Mark all non-null properties as required

The implementation is based on approaches used in libraries like:
- [json-schema-generator](https://github.com/krg7880/json-schema-generator)
- [GenSON](https://github.com/wolverdude/GenSON)

### JSON Validation

The validation feature uses [Ajv](https://ajv.js.org/) (Another JSON Schema Validator), which is one of the fastest and most complete JSON Schema validators. 

Key features:
- Complete support for JSON Schema draft-07
- Format validation with ajv-formats
- Detailed error reporting
- High performance validation

## UI Features

Both components leverage the Monaco Editor (the same editor used in Visual Studio Code) for an enhanced user experience:

- Syntax highlighting for JSON
- JSON formatting
- Validation-as-you-type
- Bracket matching and auto-closing
- Line numbers and folding

The JSON Validator component also displays the current schema alongside the input JSON document, making it easier to understand the validation requirements.

## Project Structure

The features are organized as follows:

```
src/
  components/
    features/
      InferSchemaDialog.tsx    # Component for inferring schemas from JSON
      ValidateJsonDialog.tsx       # Component for validating JSON against schema
  lib/
    schema-inference.ts       # Core schema inference logic as a service
  pages/
    Index.tsx                 # Main page with both features integrated
```

## Dependencies

- `monaco-editor`: Advanced code editor used in VS Code
- `ajv`: JSON Schema validator
- `ajv-formats`: Format validation for ajv

## Usage

1. **Schema Inference**:
   - Click "Infer from JSON" button
   - Paste or type a JSON document in the editor
   - Click "Generate Schema"

2. **JSON Validation**:
   - Click "Validate JSON" button
   - Paste or type a JSON document in the left editor
   - Review the current schema in the right editor
   - Click "Validate" to check against the current schema

## References

- [JSON Schema website](https://json-schema.org/)
- [Ajv Documentation](https://ajv.js.org/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)