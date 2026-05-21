import { useTranslation } from "../../../hooks/use-translation.ts";
import {
  getSchemaPatternProperties,
  getSchemaProperties,
  removeObjectPatternProperty,
  removeObjectProperty,
  renameObjectPatternProperty,
  renameObjectProperty,
  updateObjectPatternProperty,
  updateObjectProperty,
  updatePropertyRequired,
} from "../../../lib/schemaEditor.ts";
import type { NewField, ObjectJSONSchema } from "../../../types/jsonSchema.ts";
import { asObjectSchema, isBooleanSchema } from "../../../types/jsonSchema.ts";
import { ButtonToggle } from "../../ui/button-toggle.tsx";
import AddFieldButton from "../AddFieldButton.tsx";
import SchemaPropertyRows from "../SchemaPropertyRows.tsx";
import type { TypeEditorProps } from "../TypeEditor.tsx";

const ObjectEditor: React.FC<TypeEditorProps> = ({
  schema,
  validationNode,
  onChange,
  schemaKey,
  onAddEnum,
  onDeleteEnum,
  depth = 0,
  readOnly = false,
}) => {
  const t = useTranslation();

  // Get object properties
  const properties = getSchemaProperties(schema);
  const patternProperties = getSchemaPatternProperties(schema);

  // Create a normalized schema object
  const normalizedSchema: ObjectJSONSchema = isBooleanSchema(schema)
    ? { type: "object", properties: {} }
    : { ...schema, type: "object", properties: schema.properties || {} };

  const { additionalProperties } = normalizedSchema;

  const createPropertySchema = (newField: NewField): ObjectJSONSchema => {
    // Create field schema from the new field data
    const { type, description, validation, additionalProperties } = newField;

    return {
      type,
      description: description || undefined,
      ...(validation || {}),
      ...(additionalProperties === false ? { additionalProperties } : {}),
    } as ObjectJSONSchema;
  };

  // Handle adding a new property
  const handleAddProperty = (newField: NewField) => {
    const fieldSchema = createPropertySchema(newField);

    // Add the property to the schema
    let newSchema = updateObjectProperty(
      normalizedSchema,
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

  const handleAddPatternProperty = (newField: NewField) => {
    onChange(
      updateObjectPatternProperty(
        normalizedSchema,
        newField.name,
        createPropertySchema(newField),
      ),
    );
  };

  // Handle deleting a property
  const handleDeleteProperty = (propertyName: string) => {
    const newSchema = removeObjectProperty(normalizedSchema, propertyName);
    onChange(newSchema);
  };

  const handleDeletePatternProperty = (propertyName: string) => {
    const newSchema = removeObjectPatternProperty(
      normalizedSchema,
      propertyName,
    );
    onChange(newSchema);
  };

  // Handle property name change
  const handlePropertyNameChange = (oldName: string, newName: string) => {
    if (oldName === newName) return;

    const property = properties.find((p) => p.name === oldName);
    if (!property) return;

    onChange(renameObjectProperty(normalizedSchema, oldName, newName));
  };

  const handlePatternPropertyNameChange = (
    oldName: string,
    newName: string,
  ) => {
    if (oldName === newName) return;

    const property = patternProperties.find((p) => p.name === oldName);
    if (!property) return;

    onChange(renameObjectPatternProperty(normalizedSchema, oldName, newName));
  };

  // Handle property required status change
  const handlePropertyRequiredChange = (
    propertyName: string,
    required: boolean,
  ) => {
    const newSchema = updatePropertyRequired(
      normalizedSchema,
      propertyName,
      required,
    );
    onChange(newSchema);
  };

  const handlePropertySchemaChange = (
    propertyName: string,
    propertySchema: ObjectJSONSchema,
  ) => {
    const newSchema = updateObjectProperty(
      normalizedSchema,
      propertyName,
      propertySchema,
    );
    onChange(newSchema);
  };

  const handlePatternPropertySchemaChange = (
    propertyName: string,
    propertySchema: ObjectJSONSchema,
  ) => {
    const newSchema = updateObjectPatternProperty(
      normalizedSchema,
      propertyName,
      propertySchema,
    );
    onChange(newSchema);
  };

  const handleAdditionalPropertiesToggle = () => {
    const { additionalProperties, ...restOfSchema } = normalizedSchema;

    const updatedSchema = asObjectSchema(restOfSchema);

    if (additionalProperties !== false) {
      updatedSchema.additionalProperties = false;
    }

    onChange(updatedSchema);
  };

  return (
    <div className="space-y-4">
      {properties.length > 0 || patternProperties.length > 0 ? (
        <div className="space-y-2">
          <SchemaPropertyRows
            properties={properties}
            patternProperties={patternProperties}
            validationChildren={validationNode?.children}
            onAddEnum={onAddEnum}
            onDeleteEnum={onDeleteEnum}
            onDelete={handleDeleteProperty}
            onDeletePattern={handleDeletePatternProperty}
            onNameChange={handlePropertyNameChange}
            onPatternNameChange={handlePatternPropertyNameChange}
            onRequiredChange={handlePropertyRequiredChange}
            onSchemaChange={handlePropertySchemaChange}
            onPatternSchemaChange={handlePatternPropertySchemaChange}
            schemaKeyPrefix={schemaKey}
            readOnly={readOnly}
            depth={depth}
          />
        </div>
      ) : (
        <div className="text-sm text-muted-foreground italic p-2 text-center border rounded-md">
          {t.objectPropertiesNone}
        </div>
      )}

      {!readOnly && (
        <div className="mt-4 flex flex-row gap-x-4">
          <AddFieldButton
            onAddField={handleAddProperty}
            onAddPatternField={handleAddPatternProperty}
            variant="secondary"
          />
          {/* Additional properties */}
          <ButtonToggle
            onClick={handleAdditionalPropertiesToggle}
            className={
              additionalProperties === false
                ? "bg-amber-50 text-amber-600"
                : "bg-lime-50 text-lime-600"
            }
          >
            {additionalProperties === false
              ? t.additionalPropertiesForbid
              : t.additionalPropertiesAllow}
          </ButtonToggle>
        </div>
      )}
    </div>
  );
};

export default ObjectEditor;
