import { type FC, useMemo } from "react";
import { useTranslation } from "../../hooks/use-translation.ts";
import {
  getSchemaPatternProperties,
  getSchemaProperties,
  type Property,
} from "../../lib/schemaEditor.ts";
import type {
  JSONSchema as JSONSchemaType,
  NewField,
  ObjectJSONSchema,
  SchemaType,
} from "../../types/jsonSchema.ts";
import {
  isAllOfSchema,
  isAnyOfSchema,
  isOneOfSchema,
} from "../../types/jsonSchema.ts";
import { buildValidationTree } from "../../types/validation.ts";
import SchemaPropertyRows from "./SchemaPropertyRows.tsx";
import type { EnumChangeContext } from "./TypeEditor.tsx";

interface SchemaFieldListProps {
  schema: JSONSchemaType;
  readOnly: boolean;
  onAddEnum?: (ctx: EnumChangeContext) => void;
  onDeleteEnum?: (ctx: EnumChangeContext) => void;
  onEditField: (name: string, updatedField: NewField) => void;
  onDeleteField: (name: string) => void;
  onEditPatternField: (name: string, updatedField: NewField) => void;
  onDeletePatternField: (name: string) => void;
  autoFocus?: boolean;
}

const SchemaFieldList: FC<SchemaFieldListProps> = ({
  schema,
  onEditField,
  onDeleteField,
  onEditPatternField,
  onDeletePatternField,
  onAddEnum,
  onDeleteEnum,
  readOnly = false,
  autoFocus = true,
}) => {
  const t = useTranslation();

  // Get the properties from the schema
  const properties = getSchemaProperties(schema);
  const patternProperties = getSchemaPatternProperties(schema);

  // Get schema type as a valid SchemaType
  const getValidSchemaType = (propSchema: JSONSchemaType): SchemaType => {
    if (typeof propSchema === "boolean") return "object";

    // combinator schemas don't have a direct type — default to object for NewField purposes
    if (
      isAnyOfSchema(propSchema) ||
      isOneOfSchema(propSchema) ||
      isAllOfSchema(propSchema)
    )
      return "object";

    // Handle array of types by picking the first one
    const type = propSchema.type;
    if (Array.isArray(type)) {
      return type[0] || "object";
    }

    return type || "object";
  };

  const createUpdatedField = (
    property: Property,
    overrides: Partial<NewField> = {},
  ): NewField => ({
    name: property.name,
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
    ...overrides,
  });

  const updateProperty = (
    schemaProperties: Property[],
    name: string,
    editField: (name: string, updatedField: NewField) => void,
    overrides: Partial<NewField>,
  ) => {
    const property = schemaProperties.find((prop) => prop.name === name);
    if (!property) return;

    editField(name, createUpdatedField(property, overrides));
  };

  // Handle field name change (generates an edit event)
  const handleNameChange = (
    schemaProperties: Property[],
    editField: (name: string, updatedField: NewField) => void,
    oldName: string,
    newName: string,
  ) => {
    updateProperty(schemaProperties, oldName, editField, { name: newName });
  };

  // Handle required status change
  const handleRequiredChange = (name: string, required: boolean) => {
    updateProperty(properties, name, onEditField, { required });
  };

  const createFieldForSchemaChange = (
    property: Property,
    updatedSchema: ObjectJSONSchema,
  ): NewField => {
    // combinator schemas have no direct type field
    if (
      isAnyOfSchema(updatedSchema) ||
      isOneOfSchema(updatedSchema) ||
      isAllOfSchema(updatedSchema)
    ) {
      return createUpdatedField(property, {
        type: "object",
        description: updatedSchema.description || "",
        validation: updatedSchema,
      });
    }

    const type = updatedSchema.type || "object";
    // Ensure we're using a single type, not an array of types
    const validType = Array.isArray(type) ? type[0] || "object" : type;

    return createUpdatedField(property, {
      type: validType,
      description: updatedSchema.description || "",
      validation: updatedSchema,
    });
  };

  // Handle schema change
  const handleSchemaChange = (
    schemaProperties: Property[],
    editField: (name: string, updatedField: NewField) => void,
    name: string,
    updatedSchema: ObjectJSONSchema,
  ) => {
    const property = schemaProperties.find((prop) => prop.name === name);
    if (!property) return;

    editField(name, createFieldForSchemaChange(property, updatedSchema));
  };

  const validationTree = useMemo(
    () => buildValidationTree(schema, t),
    [schema, t],
  );

  return (
    <div className="space-y-2 animate-in">
      <SchemaPropertyRows
        properties={properties}
        patternProperties={patternProperties}
        validationChildren={validationTree.children}
        onAddEnum={onAddEnum}
        onDeleteEnum={onDeleteEnum}
        onDelete={onDeleteField}
        onDeletePattern={onDeletePatternField}
        onNameChange={(oldName, newName) =>
          handleNameChange(properties, onEditField, oldName, newName)
        }
        onPatternNameChange={(oldName, newName) =>
          handleNameChange(
            patternProperties,
            onEditPatternField,
            oldName,
            newName,
          )
        }
        onRequiredChange={handleRequiredChange}
        onSchemaChange={(name, updatedSchema) =>
          handleSchemaChange(properties, onEditField, name, updatedSchema)
        }
        onPatternSchemaChange={(name, updatedSchema) =>
          handleSchemaChange(
            patternProperties,
            onEditPatternField,
            name,
            updatedSchema,
          )
        }
        readOnly={readOnly}
        autoFocus={autoFocus}
      />
    </div>
  );
};

export default SchemaFieldList;
