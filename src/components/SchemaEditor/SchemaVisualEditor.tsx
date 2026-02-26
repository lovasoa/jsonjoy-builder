import type { FC } from "react";
import { useTranslation } from "../../hooks/use-translation.ts";
import {
  createFieldSchema,
  renameObjectProperty,
  updateObjectProperty,
  updatePropertyRequired,
} from "../../lib/schemaEditor.ts";
import type { JSONSchema, NewField } from "../../types/jsonSchema.ts";
import { asObjectSchema, isBooleanSchema } from "../../types/jsonSchema.ts";
import AddFieldButton from "./AddFieldButton.tsx";
import SchemaFieldList from "./SchemaFieldList.tsx";
import handlePropertyToggle from "./utils/handlePropertyToggle.tsx";

/** @public */
export interface SchemaVisualEditorProps {
  schema: JSONSchema;
  readOnly: boolean;
  onChange: (schema: JSONSchema) => void;
}

/** @public */
const SchemaVisualEditor: FC<SchemaVisualEditorProps> = ({
  schema,
  onChange,
  readOnly = false,
}) => {
  const t = useTranslation();
  // Handle adding a top-level field
  const handleAddField = (newField: NewField, isProperty = false) => {
    // Create a field schema based on the new field data
    const fieldSchema = createFieldSchema(newField);

    // Add the field to the schema
    let newSchema = updateObjectProperty(
      asObjectSchema(schema),
      newField.name,
      fieldSchema,
      isProperty,
    );

    // Update required status if needed
    if (newField.required) {
      newSchema = updatePropertyRequired(newSchema, newField.name, true);
    }

    // Update the schema
    onChange(newSchema);
  };

  // Handle editing a top-level field
  const handleEditField = (
    name: string,
    updatedField: NewField,
    isProperty = false,
  ) => {
    // Create a field schema based on the updated field data
    const fieldSchema = createFieldSchema(updatedField);

    let newSchema = asObjectSchema(schema);

    // If name changed, rename the property while preserving order
    if (name !== updatedField.name) {
      newSchema = renameObjectProperty(
        newSchema,
        name,
        updatedField.name,
        isProperty,
      );
      // Update the field schema after rename
      newSchema = updateObjectProperty(
        newSchema,
        updatedField.name,
        fieldSchema,
        isProperty,
      );
    } else {
      // Name didn't change, just update the schema
      newSchema = updateObjectProperty(
        newSchema,
        name,
        fieldSchema,
        isProperty,
      );
    }

    // Update required status
    newSchema = updatePropertyRequired(
      newSchema,
      updatedField.name,
      updatedField.required || false,
    );

    // Update the schema
    onChange(newSchema);
  };

  // Handle deleting a top-level field
  const handleDeleteField = (name: string, isProperty = false) => {
    const schemaProperty = isProperty
      ? "Properties"
      : "properties";

    // Check if the schema is valid first
    if (isBooleanSchema(schema) || !schema[schemaProperty]) {
      return;
    }

    // Create a new schema without the field
    const { [name]: _, ...remainingProps } = schema[schemaProperty];

    const newSchema = {
      ...schema,
      [schemaProperty]: remainingProps,
    };

    // Remove from required array if present
    if (newSchema.required) {
      newSchema.required = newSchema.required.filter((field) => field !== name);
    }

    // Update the schema
    onChange(newSchema);
  };

  const hasObjectSchema = !isBooleanSchema(schema);

  const hasProperties =
    hasObjectSchema &&
    schema.properties &&
    Object.keys(schema.properties).length > 0;

  const hasPropertiesFields =
    hasObjectSchema &&
    schema.patternProperties &&
    Object.keys(schema.patternProperties).length > 0;

  const hasFields = hasProperties || hasPropertiesFields;

  return (
    <div className="p-4 h-full flex flex-col overflow-auto jsonjoy">
      {!readOnly && (
        <div className="mb-6 shrink-0">
          <AddFieldButton onAddField={handleAddField} />
        </div>
      )}

      <div className="grow overflow-auto">
        {!hasFields ? (
          <div className="text-center py-10 text-muted-foreground">
            <p className="mb-3">{t.visualEditorNoFieldsHint1}</p>
            <p className="text-sm">{t.visualEditorNoFieldsHint2}</p>
          </div>
        ) : (
          <SchemaFieldList
            schema={schema}
            readOnly={readOnly}
            onAddField={handleAddField}
            onEditField={handleEditField}
            onDeleteField={handleDeleteField}
            onPropertyToggle={(name, isProperty) =>
              handlePropertyToggle(onChange, schema, name, isProperty)
            }
          />
        )}
      </div>
    </div>
  );
};

export default SchemaVisualEditor;
