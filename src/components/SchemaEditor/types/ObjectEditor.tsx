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

const ObjectEditor: React.FC<TypeEditorProps> = ({
  schema,
  validationNode,
  onChange,
  depth = 0,
  readOnly = false,
  path,
  onFieldDrop,
}) => {
  const t = useTranslation();

  const properties = getSchemaProperties(schema);

  const normalizedSchema: ObjectJSONSchema = isBooleanSchema(schema)
    ? { type: "object", properties: {} }
    : { ...schema, type: "object", properties: schema.properties || {} };

  const { additionalProperties } = normalizedSchema;

  const handleAddProperty = (newField: NewField) => {
    const { type, description, validation, additionalProperties } = newField;

    const fieldSchema = {
      type,
      description: description || undefined,
      ...(validation || {}),
      ...(additionalProperties === false ? { additionalProperties } : {}),
    } as ObjectJSONSchema;

    let newSchema = updateObjectProperty(
      normalizedSchema,
      newField.name,
      fieldSchema,
    );

    if (newField.required) {
      newSchema = updatePropertyRequired(newSchema, newField.name, true);
    }

    onChange(newSchema);
  };

  const handleDeleteProperty = (propertyName: string) => {
    const newSchema = removeObjectProperty(normalizedSchema, propertyName);
    onChange(newSchema);
  };

  const handlePropertyNameChange = (oldName: string, newName: string) => {
    if (oldName === newName) return;

    const property = properties.find((p) => p.name === oldName);
    if (!property) return;

    const propertySchemaObj = asObjectSchema(property.schema);

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
      {properties.length > 0 ? (
        <ul className="space-y-2" aria-label="Object properties">
          {properties.map((property) => (
            <li key={property.name}>
              <SchemaPropertyEditor
                readOnly={readOnly}
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
                parentPath={path}
                onFieldDrop={onFieldDrop}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-muted-foreground italic p-2 text-center border rounded-md">
          {t.objectPropertiesNone}
        </div>
      )}

      {!readOnly && (
        <div className="mt-4 flex flex-row gap-x-4">
          <AddFieldButton onAddField={handleAddProperty} variant="secondary" />
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
