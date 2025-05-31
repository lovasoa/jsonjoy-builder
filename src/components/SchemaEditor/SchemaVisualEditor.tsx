import {
  createFieldSchema,
  updateObjectProperty,
  updatePropertyRequired,
} from "@/lib/schemaEditor";
import type { JSONSchema, NewField } from "@/types/jsonSchema";
import { asObjectSchema, isBooleanSchema } from "@/types/jsonSchema";
import type React from "react";
import AddConditionalRuleButton, {
  type ConditionalRule, // Import ConditionalRule
} from "./AddConditionalRuleButton";
import AddFieldButton from "./AddFieldButton";
import SchemaFieldList from "./SchemaFieldList";

interface SchemaVisualEditorProps {
  schema: JSONSchema;
  onChange: (schema: JSONSchema) => void;
}

const SchemaVisualEditor: React.FC<SchemaVisualEditorProps> = ({
  schema,
  onChange,
}) => {
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

  // Handle adding a conditional rule (if/then/else)
  const handleAddConditionalRule = (rule: ConditionalRule) => {
    const newSchema: JSONSchema = {
      ...asObjectSchema(schema),
      if: rule.if,
      then: rule.then,
    };
    if (rule.else) {
      newSchema.else = rule.else;
    }
    onChange(newSchema);
  };

  // Handle editing a top-level field
  const handleEditField = (name: string, updatedField: NewField) => {
    // Create a field schema based on the updated field data
    const fieldSchema = createFieldSchema(updatedField);

    // Update the field in the schema
    let newSchema = updateObjectProperty(
      asObjectSchema(schema),
      updatedField.name,
      fieldSchema,
    );

    // Update required status
    newSchema = updatePropertyRequired(
      newSchema,
      updatedField.name,
      updatedField.required || false,
    );

    // If name changed, we need to remove the old field
    if (name !== updatedField.name) {
      const { properties, ...rest } = newSchema;
      const { [name]: _, ...remainingProps } = properties || {};

      newSchema = {
        ...rest,
        properties: remainingProps,
      };

      // Re-add the field with the new name
      newSchema = updateObjectProperty(
        newSchema,
        updatedField.name,
        fieldSchema,
      );

      // Re-update required status if needed
      if (updatedField.required) {
        newSchema = updatePropertyRequired(newSchema, updatedField.name, true);
      }
    }

    // Update the schema
    onChange(newSchema);
  };

  // Handle deleting a top-level field
  const handleDeleteField = (name: string) => {
    // Check if the schema is valid first
    if (isBooleanSchema(schema) || !schema.properties) {
      return;
    }

    // Create a new schema without the field
    const { [name]: _, ...remainingProps } = schema.properties;

    const newSchema = {
      ...schema,
      properties: remainingProps,
    };

    // Remove from required array if present
    if (newSchema.required) {
      newSchema.required = newSchema.required.filter((field) => field !== name);
    }

    // Update the schema
    onChange(newSchema);
  };

  const hasFields =
    !isBooleanSchema(schema) &&
    schema.properties &&
    Object.keys(schema.properties).length > 0;

  return (
    <div className="p-4 h-full flex flex-col overflow-auto">
      <div className="mb-6 flex-shrink-0 flex flex-wrap gap-2">
        <AddFieldButton onAddField={handleAddField} />
        <AddConditionalRuleButton
          onAddConditionalRule={handleAddConditionalRule}
        />
      </div>

      <div className="flex-grow overflow-auto">
        {!hasFields ? (
          <div className="text-center py-10 text-muted-foreground">
            <p className="mb-3">No fields defined yet</p>
            <p className="text-sm">Add your first field to get started</p>
          </div>
        ) : (
          <SchemaFieldList
            schema={schema}
            onAddField={handleAddField}
            onEditField={handleEditField}
            onDeleteField={handleDeleteField}
          />
        )}
      </div>
    </div>
  );
};

export default SchemaVisualEditor;
