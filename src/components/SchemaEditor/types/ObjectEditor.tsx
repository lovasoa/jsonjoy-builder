import { useTranslation } from "../../../hooks/use-translation.ts";
import {
  getSchemaPatternProperties,
  getSchemaProperties,
  removePatternProperty,
  removeObjectProperty,
  updateObjectProperty,
  updatePatternProperty,
  updatePropertyRequired,
} from "../../../lib/schemaEditor.ts";
import type { JSONSchema, NewField, ObjectJSONSchema } from "../../../types/jsonSchema.ts";
import { asObjectSchema, isBooleanSchema } from "../../../types/jsonSchema.ts";
import AddFieldButton from "../AddFieldButton.tsx";
import AddPatternPropertyButton from "../AddPatternPropertyButton.tsx";
import type { NewPatternProperty } from "../AddPatternPropertyButton.tsx";
import PatternPropertyEditor from "../PatternPropertyEditor.tsx";
import SchemaPropertyEditor from "../SchemaPropertyEditor.tsx";
import type { TypeEditorProps } from "../TypeEditor.tsx";

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

  // Get pattern properties
  const patternProperties = getSchemaPatternProperties(schema);

  // Create a normalized schema object
  const normalizedSchema: ObjectJSONSchema = isBooleanSchema(schema)
    ? { type: "object", properties: {} }
    : { ...schema, type: "object", properties: schema.properties || {} };

  // Handle adding a new property
  const handleAddProperty = (newField: NewField) => {
    // Create field schema from the new field data
    const fieldSchema = {
      type: newField.type,
      description: newField.description || undefined,
      ...(newField.validation || {}),
    } as ObjectJSONSchema;

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

  // Handle deleting a property
  const handleDeleteProperty = (propertyName: string) => {
    const newSchema = removeObjectProperty(normalizedSchema, propertyName);
    onChange(newSchema);
  };

  // Handle property name change
  const handlePropertyNameChange = (oldName: string, newName: string) => {
    if (oldName === newName) return;

    const property = properties.find((p) => p.name === oldName);
    if (!property) return;

    const propertySchemaObj = asObjectSchema(property.schema);

    // Add property with new name
    let newSchema = updateObjectProperty(
      normalizedSchema,
      newName,
      propertySchemaObj,
    );

    if (property.required) {
      newSchema = updatePropertyRequired(newSchema, newName, true);
    }

    newSchema = removeObjectProperty(newSchema, oldName);

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
  ) => {
    const newSchema = updateObjectProperty(
      normalizedSchema,
      propertyName,
      propertySchema,
    );
    onChange(newSchema);
  };

  // Handle adding a new pattern property
  const handleAddPatternProperty = (newPatternProp: NewPatternProperty) => {
    const fieldSchema: JSONSchema = {
      type: newPatternProp.type,
      description: newPatternProp.description || undefined,
    };

    const newSchema = updatePatternProperty(
      normalizedSchema,
      newPatternProp.pattern,
      fieldSchema,
    );

    onChange(newSchema);
  };

  // Handle deleting a pattern property
  const handleDeletePatternProperty = (pattern: string) => {
    const newSchema = removePatternProperty(normalizedSchema, pattern);
    onChange(newSchema);
  };

  // Handle pattern property pattern change
  const handlePatternPropertyPatternChange = (
    oldPattern: string,
    newPattern: string,
  ) => {
    if (oldPattern === newPattern) return;

    const patternProp = patternProperties.find((p) => p.pattern === oldPattern);
    if (!patternProp) return;

    // Add property with new pattern
    let newSchema = updatePatternProperty(
      normalizedSchema,
      newPattern,
      patternProp.schema,
    );

    // Remove old pattern property
    newSchema = removePatternProperty(newSchema, oldPattern);

    onChange(newSchema);
  };

  // Handle pattern property schema change
  const handlePatternPropertySchemaChange = (
    pattern: string,
    propertySchema: ObjectJSONSchema,
  ) => {
    const newSchema = updatePatternProperty(
      normalizedSchema,
      pattern,
      propertySchema,
    );
    onChange(newSchema);
  };

  return (
    <div className="space-y-6">
      {/* Regular Properties Section */}
      <div className="space-y-2">
        {properties.length > 0 ? (
          <div className="space-y-2">
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
              />
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic p-2 text-center border rounded-md">
            {t.objectPropertiesNone}
          </div>
        )}

        {!readOnly && (
          <div className="mt-4">
            <AddFieldButton onAddField={handleAddProperty} variant="secondary" />
          </div>
        )}
      </div>

      {/* Pattern Properties Section */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-muted-foreground">
          {t.patternPropertiesTitle}
        </h4>
        {patternProperties.length > 0 ? (
          <div className="space-y-2">
            {patternProperties.map((patternProp) => (
              <PatternPropertyEditor
                readOnly={readOnly}
                key={patternProp.pattern}
                pattern={patternProp.pattern}
                schema={patternProp.schema}
                validationNode={validationNode?.children[`pattern:${patternProp.pattern}`]}
                onDelete={() => handleDeletePatternProperty(patternProp.pattern)}
                onPatternChange={(newPattern) =>
                  handlePatternPropertyPatternChange(patternProp.pattern, newPattern)
                }
                onSchemaChange={(schema) =>
                  handlePatternPropertySchemaChange(patternProp.pattern, schema)
                }
                depth={depth}
              />
            ))}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground italic p-2 text-center border rounded-md">
            {t.patternPropertiesNone}
          </div>
        )}

        {!readOnly && (
          <div className="mt-4">
            <AddPatternPropertyButton
              onAddPatternProperty={handleAddPatternProperty}
              variant="secondary"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ObjectEditor;
