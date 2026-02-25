import { type FC, useMemo } from "react";
import { useTranslation } from "../../hooks/use-translation.ts";
import { getSchemaProperties } from "../../lib/schemaEditor.ts";
import type {
  JSONSchema as JSONSchemaType,
  NewField,
  ObjectJSONSchema,
  SchemaType,
} from "../../types/jsonSchema.ts";
import { buildValidationTree } from "../../types/validation.ts";
import SchemaPropertyEditor from "./SchemaPropertyEditor.tsx";

interface SchemaFieldListProps {
  schema: JSONSchemaType;
  readOnly: boolean;
  onAddField: (newField: NewField, isPatternProperty?: boolean) => void;
  onEditField: (
    name: string,
    updatedField: NewField,
    isPatternProperty?: boolean,
  ) => void;
  onDeleteField: (name: string, isPatternProperty?: boolean) => void;
  onPropertyToggle: (name: string, isPatternProperty?: boolean) => void;
}

const SchemaFieldList: FC<SchemaFieldListProps> = ({
  schema,
  onEditField,
  onDeleteField,
  onPropertyToggle,
  readOnly = false,
}) => {
  const t = useTranslation();

  // Get the properties from the schema
  const properties = getSchemaProperties(schema);
  const patternProperties = getSchemaProperties(schema, true);

  // Get schema type as a valid SchemaType
  const getValidSchemaType = (propSchema: JSONSchemaType): SchemaType => {
    if (typeof propSchema === "boolean") return "object";

    // Handle array of types by picking the first one
    const type = propSchema.type;
    if (Array.isArray(type)) {
      return type[0] || "object";
    }

    return type || "object";
  };

  // Handle field name change (generates an edit event)
  const handleNameChange = (
    oldName: string,
    newName: string,
    isPatternProperty = false,
  ) => {
    const schemaProperties = isPatternProperty ? patternProperties : properties;
    const property = schemaProperties.find((prop) => prop.name === oldName);

    if (!property) return;

    onEditField(
      oldName,
      {
        name: newName,
        type: getValidSchemaType(property.schema),
        description:
          typeof property.schema === "boolean"
            ? ""
            : property.schema.description || "",
        required: property.required,
        validation:
          typeof property.schema === "boolean"
            ? { type: "object" }
            : property.schema,
      },
      isPatternProperty,
    );
  };

  // Handle required status change
  const handleRequiredChange = (name: string, required: boolean) => {
    const property = properties.find((prop) => prop.name === name);
    if (!property) return;

    onEditField(name, {
      name,
      type: getValidSchemaType(property.schema),
      description:
        typeof property.schema === "boolean"
          ? ""
          : property.schema.description || "",
      required,
      validation:
        typeof property.schema === "boolean"
          ? { type: "object" }
          : property.schema,
    });
  };

  // Handle schema change
  const handleSchemaChange = (
    name: string,
    updatedSchema: ObjectJSONSchema,
    isPatternProperty = false,
  ) => {
    const schemaProperties = isPatternProperty ? patternProperties : properties;
    const property = schemaProperties.find((prop) => prop.name === name);

    if (!property) return;

    const type = updatedSchema.type || "object";
    // Ensure we're using a single type, not an array of types
    const validType = Array.isArray(type) ? type[0] || "object" : type;

    onEditField(
      name,
      {
        name,
        type: validType,
        description: updatedSchema.description || "",
        required: property.required,
        validation: updatedSchema,
      },
      isPatternProperty,
    );
  };

  const validationTree = useMemo(
    () => buildValidationTree(schema, t),
    [schema, t],
  );

  return (
    <div className="space-y-2 animate-in">
      {properties.length > 0 ? <h3>{t.regularPropertiesTitle}:</h3> : null}
      {properties.map((property) => (
        <SchemaPropertyEditor
          key={property.name}
          name={property.name}
          schema={property.schema}
          required={property.required}
          validationNode={validationTree.children[property.name] ?? undefined}
          onDelete={() => onDeleteField(property.name)}
          onNameChange={(newName) => handleNameChange(property.name, newName)}
          onRequiredChange={(required) =>
            handleRequiredChange(property.name, required)
          }
          onSchemaChange={(schema) => handleSchemaChange(property.name, schema)}
          readOnly={readOnly}
          onPropertyToggle={onPropertyToggle}
        />
      ))}
      {patternProperties.length > 0 ? (
        <h3>{t.patternPropertiesTitle}:</h3>
      ) : null}
      {patternProperties.map((property) => (
        <SchemaPropertyEditor
          key={property.name}
          name={property.name}
          schema={property.schema}
          required={property.required}
          validationNode={validationTree.children[property.name] ?? undefined}
          onDelete={() => onDeleteField(property.name, true)}
          onNameChange={(newName) =>
            handleNameChange(property.name, newName, true)
          }
          onRequiredChange={(required) =>
            handleRequiredChange(property.name, required)
          }
          onSchemaChange={(schema) =>
            handleSchemaChange(property.name, schema, true)
          }
          readOnly={readOnly}
          onPropertyToggle={onPropertyToggle}
          isPatternProperty
        />
      ))}
    </div>
  );
};

export default SchemaFieldList;
