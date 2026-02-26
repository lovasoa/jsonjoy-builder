import {
  removeObjectProperty,
  updateObjectProperty,
} from "../../../lib/schemaEditor.ts";
import type { ObjectJSONSchema } from "../../../types/jsonSchema.ts";
import { isBooleanSchema } from "../../../types/jsonSchema.ts";

// Handle toggling between properties and patternProperties
const handlePropertyToggle = (
  onChange: (newSchema: ObjectJSONSchema) => void,
  schema: ObjectJSONSchema,
  name: string,
  isPatternProperty = false,
) => {
  const schemaProperty = isPatternProperty ? "patternProperties" : "properties";

  if (isBooleanSchema(schema) || !schema[schemaProperty]) {
    return;
  }

  const fieldSchema = schema[schemaProperty][name];

  const schemaAfterRemove = removeObjectProperty(
    schema,
    name,
    isPatternProperty,
  );
  const newSchema = updateObjectProperty(
    schemaAfterRemove,
    name,
    fieldSchema,
    !isPatternProperty,
  );

  onChange(newSchema);
};

export default handlePropertyToggle;
