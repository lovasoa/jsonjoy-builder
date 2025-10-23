import type { FC } from "react";
import {
  createFieldSchema,
  updateObjectProperty,
  updatePropertyRequired,
} from "../../lib/schemaEditor.ts";
import type { JSONSchema, NewField } from "../../types/jsonSchema.ts";
import { asObjectSchema, isBooleanSchema } from "../../types/jsonSchema.ts";
import AddFieldButton from "./AddFieldButton.tsx";
import SchemaFieldList from "./SchemaFieldList.tsx";
import { useTranslation } from "../../hooks/use-translation.ts";
import ConditionalSchemaEditor from "../keywords/ConditionalSchemaEditor.tsx";
import PrefixItemsEditor from "../keywords/PrefixItemsEditor.tsx";
import DynamicReferencesEditor from "../keywords/DynamicReferencesEditor.tsx";
import DependentSchemasEditor from "../keywords/DependentSchemasEditor.tsx";
import CompositionEditor from "../keywords/CompositionEditor.tsx";
import UnevaluatedPropertiesEditor from "../keywords/UnevaluatedPropertiesEditor.tsx";
import UnevaluatedItemsEditor from "../keywords/UnevaluatedItemsEditor.tsx";
import type { JSONSchemaDraft } from "../../utils/schema-version.ts";
import { detectSchemaVersion } from "../../utils/schema-version.ts";
import { getDraftFeatures } from "../../utils/draft-features.ts";
import { Badge } from "../ui/badge.tsx";

/** @public */
export interface SchemaVisualEditorProps {
  schema: JSONSchema;
  onChange: (schema: JSONSchema) => void;
  draft?: JSONSchemaDraft;
}

/** @public */
const SchemaVisualEditor: FC<SchemaVisualEditorProps> = ({
  schema,
  onChange,
  draft,
}) => {
  const t = useTranslation();
  const currentDraft = draft || detectSchemaVersion(schema);
  const features = getDraftFeatures(currentDraft);
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
    <div className="p-4 h-full flex flex-col overflow-auto jsonjoy">
      <div className="mb-6 shrink-0">
        <AddFieldButton onAddField={handleAddField} />
      </div>

      <div className="grow overflow-auto space-y-6">
        {/* Properties Section */}
        <div>
          {!hasFields ? (
            <div className="text-center py-10 text-muted-foreground">
              <p className="mb-3">{t.visualEditorNoFieldsHint1}</p>
              <p className="text-sm">{t.visualEditorNoFieldsHint2}</p>
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

        {/* Advanced Keywords Section */}
        <div className="space-y-4 pt-6 border-t">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Advanced Keywords
            </h3>
            <Badge variant="secondary" className="text-xs">
              {currentDraft === 'draft-07' ? 'Draft-07' : currentDraft === '2019-09' ? 'Draft 2019-09+' : 'Draft 2020-12'}
            </Badge>
          </div>
          
          {/* Conditional Validation (Draft-07+) */}
          {features.conditionals && (
            <ConditionalSchemaEditor schema={schema} onChange={onChange} draft={currentDraft} />
          )}
          
          {/* Composition (All drafts) */}
          {features.composition && (
            <CompositionEditor schema={schema} onChange={onChange} draft={currentDraft} />
          )}
          
          {/* Array-specific */}
          {!isBooleanSchema(schema) && schema.type === "array" && (
            <>
              {/* Prefix Items (2020-12 only) */}
              {features.prefixItems && (
                <div className="relative">
                  <PrefixItemsEditor schema={schema} onChange={onChange} draft={currentDraft} />
                  <Badge variant="outline" className="absolute top-2 right-2 text-xs">
                    2020-12
                  </Badge>
                </div>
              )}
              
              {/* Unevaluated Items (2019-09+, enhanced in 2020-12) */}
              {features.unevaluatedItems && (
                <div className="relative">
                  <UnevaluatedItemsEditor schema={schema} onChange={onChange} draft={currentDraft} />
                  {currentDraft === '2020-12' && (
                    <Badge variant="outline" className="absolute top-2 right-2 text-xs">
                      Enhanced in 2020-12
                    </Badge>
                  )}
                </div>
              )}
            </>
          )}
          
          {/* Object-specific */}
          {!isBooleanSchema(schema) && (schema.type === "object" || schema.properties) && (
            <>
              {/* Dependent Schemas (2019-09+) */}
              {features.dependentSchemas && (
                <div className="relative">
                  <DependentSchemasEditor schema={schema} onChange={onChange} draft={currentDraft} />
                  {currentDraft !== '2020-12' && (
                    <Badge variant="outline" className="absolute top-2 right-2 text-xs">
                      2019-09+
                    </Badge>
                  )}
                </div>
              )}
              
              {/* Unevaluated Properties (2019-09+, enhanced in 2020-12) */}
              {features.unevaluatedProps && (
                <div className="relative">
                  <UnevaluatedPropertiesEditor schema={schema} onChange={onChange} draft={currentDraft} />
                  {currentDraft === '2020-12' && (
                    <Badge variant="outline" className="absolute top-2 right-2 text-xs">
                      Enhanced in 2020-12
                    </Badge>
                  )}
                </div>
              )}
            </>
          )}
          
          {/* Dynamic References (2020-12 only) */}
          {features.dynamicRefs && (
            <div className="relative">
              <DynamicReferencesEditor schema={schema} onChange={onChange} />
              <Badge variant="outline" className="absolute top-2 right-2 text-xs">
                2020-12
              </Badge>
            </div>
          )}
          
          {/* Info message if limited features */}
          {currentDraft !== '2020-12' && (
            <div className="text-xs text-muted-foreground italic p-3 bg-muted/30 rounded-md">
              💡 Switch to Draft 2020-12 to access all advanced features including prefixItems and dynamic references
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SchemaVisualEditor;
