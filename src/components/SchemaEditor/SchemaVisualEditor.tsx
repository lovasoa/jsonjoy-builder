import type { FC } from "react";
import { useTranslation } from "../../hooks/use-translation.ts";
import {
  createFieldSchema,
  removeObjectPatternProperty,
  removeObjectProperty,
  renameObjectPatternProperty,
  renameObjectProperty,
  updateObjectPatternProperty,
  updateObjectProperty,
  updatePropertyRequired,
} from "../../lib/schemaEditor.ts";
import type { JSONSchema, NewField } from "../../types/jsonSchema.ts";
import { asObjectSchema, isBooleanSchema } from "../../types/jsonSchema.ts";
import AddFieldButton from "./AddFieldButton.tsx";
import SchemaFieldList from "./SchemaFieldList.tsx";
import type { EnumChangeContext } from "./TypeEditor.tsx";

/** @public */
export interface SchemaVisualEditorProps {
  schema: JSONSchema;
  readOnly: boolean;
  onChange: (schema: JSONSchema) => void;
  autoFocus?: boolean;
  onAddEnum?: (ctx: EnumChangeContext) => void;
  onDeleteEnum?: (ctx: EnumChangeContext) => void;
}

/** @public */
const SchemaVisualEditor: FC<SchemaVisualEditorProps> = ({
  schema,
  onChange,
  onAddEnum,
  onDeleteEnum,
  readOnly = false,
  autoFocus = true,
}) => {
  const t = useTranslation();
  // Handle adding a top-level field
  const handleAddField = (newField: NewField) => {
    // Create a field schema based on the new field data
    const fieldSchema = createFieldSchema(newField);

    // Add the field to the schema
    let newSchema = updateObjectProperty(
      asObjectSchema(schema),
      newField.name,
      fieldSchema,
    );

    // Update required status if needed
    if (newField.required) {
      newSchema = updatePropertyRequired(newSchema, newField.name, true);
    }

    // Update the schema
    onChange(newSchema);
  };

  const handleAddPatternField = (newField: NewField) => {
    onChange(
      updateObjectPatternProperty(
        asObjectSchema(schema),
        newField.name,
        createFieldSchema(newField),
      ),
    );
  };

  // Handle editing a top-level field
  const handleEditField = (name: string, updatedField: NewField) => {
    // Create a field schema based on the updated field data
    const fieldSchema = createFieldSchema(updatedField);

    let newSchema = asObjectSchema(schema);

    // If name changed, rename the property while preserving order
    if (name !== updatedField.name) {
      newSchema = renameObjectProperty(newSchema, name, updatedField.name);
      // Update the field schema after rename
      newSchema = updateObjectProperty(
        newSchema,
        updatedField.name,
        fieldSchema,
      );
    } else {
      // Name didn't change, just update the schema
      newSchema = updateObjectProperty(newSchema, name, fieldSchema);
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

  const handleEditPatternField = (name: string, updatedField: NewField) => {
    const fieldSchema = createFieldSchema(updatedField);
    let newSchema = asObjectSchema(schema);

    if (name !== updatedField.name) {
      newSchema = renameObjectPatternProperty(
        newSchema,
        name,
        updatedField.name,
      );
      newSchema = updateObjectPatternProperty(
        newSchema,
        updatedField.name,
        fieldSchema,
      );
    } else {
      newSchema = updateObjectPatternProperty(newSchema, name, fieldSchema);
    }

    onChange(newSchema);
  };

  // Handle deleting a top-level field
  const handleDeleteField = (name: string) => {
    onChange(removeObjectProperty(asObjectSchema(schema), name));
  };

  const handleDeletePatternField = (name: string) => {
    onChange(removeObjectPatternProperty(asObjectSchema(schema), name));
  };

  const hasFields =
    !isBooleanSchema(schema) &&
    ((schema.properties && Object.keys(schema.properties).length > 0) ||
      (schema.patternProperties &&
        Object.keys(schema.patternProperties).length > 0));

  return (
    <div className="p-4 h-full flex flex-col overflow-auto jsonjoy">
      {!readOnly && (
        <div className="mb-6 shrink-0">
          <AddFieldButton
            onAddField={handleAddField}
            onAddPatternField={handleAddPatternField}
            autoFocus={autoFocus}
          />
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
            onAddEnum={onAddEnum}
            onDeleteEnum={onDeleteEnum}
            onEditField={handleEditField}
            onDeleteField={handleDeleteField}
            onEditPatternField={handleEditPatternField}
            onDeletePatternField={handleDeletePatternField}
            autoFocus={autoFocus}
          />
        )}
      </div>
    </div>
  );
};

export default SchemaVisualEditor;
