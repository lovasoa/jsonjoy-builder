import { type FC, useMemo } from "react";
import { useControllableSchema } from "../../hooks/use-controllable-schema.ts";
import { ExternalRefResolverContext } from "../../hooks/use-external-ref.ts";
import { RootSchemaContext } from "../../hooks/use-root-schema.ts";
import { useTranslation } from "../../hooks/use-translation.ts";
import { SchemaBuilderProvider } from "../../i18n/schema-builder-config.tsx";
import type { Translation } from "../../i18n/translation-keys.ts";
import type { ExternalRefResolver } from "../../lib/refUtils.ts";
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
import { cn } from "../../lib/utils.ts";
import { SchemaBuilderRegistryProvider } from "../../registry/SchemaBuilderRegistryContext.tsx";
import type { SchemaBuilderRegistry } from "../../registry/types.ts";
import type { JsonSchema, NewField } from "../../types/jsonSchema.ts";
import {
  asObjectSchema,
  getEditorType,
  isBooleanSchema,
} from "../../types/jsonSchema.ts";
import { buildValidationTree } from "../../types/validation.ts";
import AddFieldButton from "./AddFieldButton.tsx";
import DefinitionsEditor from "./DefinitionsEditor.tsx";
import SchemaFieldList from "./SchemaFieldList.tsx";
import TypeEditor from "./TypeEditor.tsx";

/** @public */
export interface SchemaFieldsEditorProps {
  value?: JsonSchema;
  defaultValue?: JsonSchema;
  onChange?: (schema: JsonSchema) => void;
  readOnly?: boolean;
  autoFocus?: boolean;
  className?: string;
  locale?: Translation;
  messages?: Partial<Translation>;
  registry?: SchemaBuilderRegistry;
  /**
   * Opt-in loader for external $ref targets, used to preview the
   * referenced schemas. When omitted, external references are
   * preserved but never loaded. Pass `fetchExternalRef` for plain
   * HTTP(S) loading.
   */
  resolveExternalRef?: ExternalRefResolver;
}

/** @public */
const SchemaFieldsEditor: FC<SchemaFieldsEditorProps> = ({
  value,
  defaultValue,
  onChange,
  readOnly = false,
  autoFocus = true,
  className,
  locale,
  messages,
  registry,
  resolveExternalRef,
}) => {
  const [schema, setSchema] = useControllableSchema({
    value,
    defaultValue,
    onChange,
  });

  return (
    <SchemaBuilderProvider locale={locale} messages={messages}>
      <SchemaBuilderRegistryProvider value={registry}>
        <SchemaFieldsEditorContent
          schema={schema}
          onChange={setSchema}
          readOnly={readOnly}
          autoFocus={autoFocus}
          className={className}
          resolveExternalRef={resolveExternalRef}
        />
      </SchemaBuilderRegistryProvider>
    </SchemaBuilderProvider>
  );
};

interface SchemaFieldsEditorContentProps {
  schema: JsonSchema;
  readOnly: boolean;
  onChange: (schema: JsonSchema) => void;
  autoFocus?: boolean;
  className?: string;
  resolveExternalRef?: ExternalRefResolver;
}

const SchemaFieldsEditorContent: FC<SchemaFieldsEditorContentProps> = ({
  schema,
  onChange,
  readOnly = false,
  autoFocus = true,
  className,
  resolveExternalRef,
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

  // A root that is a combinator or a reference is edited as a whole:
  // it has no field list of its own
  const rootEditorType = getEditorType(schema);
  const rootIsComposite =
    rootEditorType === "anyOf" ||
    rootEditorType === "oneOf" ||
    rootEditorType === "allOf" ||
    rootEditorType === "ref";

  const rootValidationTree = useMemo(
    () => (rootIsComposite ? buildValidationTree(schema, t) : undefined),
    [rootIsComposite, schema, t],
  );

  return (
    <RootSchemaContext.Provider value={schema}>
      <ExternalRefResolverContext.Provider value={resolveExternalRef}>
        <div
          className={cn(
            "p-4 h-full flex flex-col overflow-auto jsonjoy",
            className,
          )}
        >
          {!readOnly && !rootIsComposite && (
            <div className="mb-6 shrink-0">
              <AddFieldButton
                onAddField={handleAddField}
                onAddPatternField={handleAddPatternField}
                autoFocus={autoFocus}
              />
            </div>
          )}

          <div className="grow overflow-auto">
            {rootIsComposite ? (
              <div className="rounded-lg border p-3">
                <TypeEditor
                  schema={schema}
                  readOnly={readOnly}
                  validationNode={rootValidationTree}
                  onChange={onChange}
                  schemaKey="root"
                />
              </div>
            ) : !hasFields ? (
              <div className="text-center py-10 text-muted-foreground">
                <p className="mb-3">{t.visualEditorNoFieldsHint1}</p>
                <p className="text-sm">{t.visualEditorNoFieldsHint2}</p>
              </div>
            ) : (
              <SchemaFieldList
                schema={schema}
                readOnly={readOnly}
                onEditField={handleEditField}
                onDeleteField={handleDeleteField}
                onEditPatternField={handleEditPatternField}
                onDeletePatternField={handleDeletePatternField}
                autoFocus={autoFocus}
              />
            )}

            <DefinitionsEditor
              schema={schema}
              readOnly={readOnly}
              onChange={onChange}
              autoFocus={autoFocus}
            />
          </div>
        </div>
      </ExternalRefResolverContext.Provider>
    </RootSchemaContext.Provider>
  );
};

export default SchemaFieldsEditor;
