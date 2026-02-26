import { useTranslation } from "../../../hooks/use-translation.ts";
import {
  getSchemaProperties,
  removeObjectProperty,
  updateObjectProperty,
  updatePropertyRequired,
} from "../../../lib/schemaEditor.ts";
import type { NewField, ObjectJSONSchema } from "../../../types/jsonSchema.ts";
import { asObjectSchema, isBooleanSchema } from "../../../types/jsonSchema.ts";
import { ButtonToggle } from "../../ui/button-toggle.tsx";
import AddFieldButton from "../AddFieldButton.tsx";
import SchemaPropertyEditor from "../SchemaPropertyEditor.tsx";
import type { TypeEditorProps } from "../TypeEditor.tsx";
import handlePropertyToggle from "../utils/handlePropertyToggle.tsx";

const ObjectEditor: React.FC<TypeEditorProps> = ({
  schema,
  validationNode,
  onChange,
  depth = 0,
  readOnly = false,
}) => {
  const t = useTranslation();

  // Get object properties
  const properties = getSchemaProperties(schema);
  const patternProperties = getSchemaProperties(schema, true);

  // Create a normalized schema object
  const normalizedSchema: ObjectJSONSchema = isBooleanSchema(schema)
    ? { type: "object", properties: {} }
    : { ...schema, type: "object", properties: schema.properties || {} };

  const { additionalProperties } = normalizedSchema;

  // Handle adding a new property
  const handleAddProperty = (newField: NewField, isPatternProperty = false) => {
    // Create field schema from the new field data
    const { type, description, validation, additionalProperties } = newField;

    const fieldSchema = {
      type,
      description: description || undefined,
      ...(validation || {}),
      ...(additionalProperties === false ? { additionalProperties } : {}),
    } as ObjectJSONSchema;

    // Add the property to the schema
    let newSchema = updateObjectProperty(
      normalizedSchema,
      newField.name,
      fieldSchema,
      isPatternProperty,
    );

    // Update required status if needed
    if (newField.required) {
      newSchema = updatePropertyRequired(newSchema, newField.name, true);
    }

    // Update the schema
    onChange(newSchema);
  };

  // Handle deleting a property
  const handleDeleteProperty = (
    propertyName: string,
    isPatternProperty = false,
  ) => {
    const newSchema = removeObjectProperty(
      normalizedSchema,
      propertyName,
      isPatternProperty,
    );
    onChange(newSchema);
  };

  // Handle property name change
  const handlePropertyNameChange = (
    oldName: string,
    newName: string,
    isPatternProperty = false,
  ) => {
    if (oldName === newName) return;

    const property = properties.find((p) => p.name === oldName);
    if (!property) return;

    const propertySchemaObj = asObjectSchema(property.schema);

    // Add property with new name
    let newSchema = updateObjectProperty(
      normalizedSchema,
      newName,
      propertySchemaObj,
      isPatternProperty,
    );

    if (property.required) {
      newSchema = updatePropertyRequired(newSchema, newName, true);
    }

    newSchema = removeObjectProperty(newSchema, oldName, isPatternProperty);

    onChange(newSchema);
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
    isPatternProperty = false,
  ) => {
    const newSchema = updateObjectProperty(
      normalizedSchema,
      propertyName,
      propertySchema,
      isPatternProperty,
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

  const hasProperties = properties.length > 0 || patternProperties.length > 0;

  return (
    <div className="space-y-6">
      {/* Regular Properties Section */}
      <div className="space-y-2">
        {hasProperties ? (
          <div className="space-y-2">
            {properties.length > 0 ? (
              <h3 className="ml-5">{t.regularPropertiesTitle}:</h3>
            ) : null}
            {properties.map((property) => (
              <SchemaPropertyEditor
                readOnly={readOnly}
                key={property.name}
                name={property.name}
                schema={property.schema}
                required={property.required}
                validationNode={validationNode?.children[property.name]}
                onDelete={() => handleDeleteProperty(property.name)}
                onNameChange={(newName) =>
                  handlePropertyNameChange(property.name, newName)
                }
                onRequiredChange={(required) =>
                  handlePropertyRequiredChange(property.name, required)
                }
                onSchemaChange={(schema) =>
                  handlePropertySchemaChange(property.name, schema)
                }
                depth={depth}
                onPropertyToggle={(name, isPatternProperty) =>
                  handlePropertyToggle(
                    onChange,
                    normalizedSchema,
                    name,
                    isPatternProperty,
                  )
                }
              />
            ))}
            {patternProperties.length > 0 ? (
              <h3 className="ml-5">{t.patternPropertiesTitle}:</h3>
            ) : null}
            {patternProperties.map((property) => (
              <SchemaPropertyEditor
                readOnly={readOnly}
                key={property.name}
                name={property.name}
                schema={property.schema}
                required={property.required}
                validationNode={validationNode?.children[property.name]}
                onDelete={() => handleDeleteProperty(property.name, true)}
                onNameChange={(newName) =>
                  handlePropertyNameChange(property.name, newName, true)
                }
                onRequiredChange={(required) =>
                  handlePropertyRequiredChange(property.name, required)
                }
                onSchemaChange={(schema) =>
                  handlePropertySchemaChange(property.name, schema, true)
                }
                depth={depth}
                onPropertyToggle={(name, isPatternProperty) =>
                  handlePropertyToggle(
                    onChange,
                    normalizedSchema,
                    name,
                    isPatternProperty,
                  )
                }
                isPatternProperty
              />
            ))}
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
    </div>
  );
};

export default ObjectEditor;
