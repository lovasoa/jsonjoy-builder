import type { FC } from "react";
import type { Property } from "../../lib/schemaEditor.ts";
import type { ObjectJsonSchema } from "../../types/jsonSchema.ts";
import type { ValidationTreeNode } from "../../types/validation.ts";
import SchemaPropertyEditor, {
  PatternSchemaPropertyEditor,
} from "./SchemaPropertyEditor.tsx";
import type { EnumChangeContext } from "./TypeEditor.tsx";

interface SchemaPropertyRowsProps {
  properties: Property[];
  patternProperties: Property[];
  readOnly: boolean;
  autoFocus?: boolean;
  depth?: number;
  schemaKeyPrefix?: string;
  validationChildren?: Record<string, ValidationTreeNode>;
  onAddEnum?: (ctx: EnumChangeContext) => void;
  onDeleteEnum?: (ctx: EnumChangeContext) => void;
  onDelete: (name: string) => void;
  onDeletePattern: (name: string) => void;
  onNameChange: (oldName: string, newName: string) => void;
  onPatternNameChange: (oldName: string, newName: string) => void;
  onRequiredChange: (name: string, required: boolean) => void;
  onSchemaChange: (name: string, schema: ObjectJsonSchema) => void;
  onPatternSchemaChange: (name: string, schema: ObjectJsonSchema) => void;
}

const getSchemaKey = (prefix: string | undefined, name: string) =>
  prefix ? `${prefix}.${name}` : name;

const SchemaPropertyRows: FC<SchemaPropertyRowsProps> = ({
  properties,
  patternProperties,
  readOnly,
  autoFocus,
  depth = 0,
  schemaKeyPrefix,
  validationChildren,
  onAddEnum,
  onDeleteEnum,
  onDelete,
  onDeletePattern,
  onNameChange,
  onPatternNameChange,
  onRequiredChange,
  onSchemaChange,
  onPatternSchemaChange,
}) => (
  <>
    {properties.map((property) => (
      <SchemaPropertyEditor
        readOnly={readOnly}
        key={property.name}
        name={property.name}
        schemaKey={getSchemaKey(schemaKeyPrefix, property.name)}
        schema={property.schema}
        required={property.required}
        validationNode={validationChildren?.[property.name]}
        onAddEnum={onAddEnum}
        onDeleteEnum={onDeleteEnum}
        onDelete={() => onDelete(property.name)}
        onNameChange={(newName) => onNameChange(property.name, newName)}
        onRequiredChange={(required) =>
          onRequiredChange(property.name, required)
        }
        onSchemaChange={(schema) => onSchemaChange(property.name, schema)}
        depth={depth}
        autoFocus={autoFocus}
      />
    ))}
    {patternProperties.map((property) => (
      <PatternSchemaPropertyEditor
        readOnly={readOnly}
        key={`pattern:${property.name}`}
        name={property.name}
        schemaKey={getSchemaKey(schemaKeyPrefix, property.name)}
        schema={property.schema}
        validationNode={validationChildren?.[`pattern:${property.name}`]}
        onAddEnum={onAddEnum}
        onDeleteEnum={onDeleteEnum}
        onDelete={() => onDeletePattern(property.name)}
        onNameChange={(newName) => onPatternNameChange(property.name, newName)}
        onSchemaChange={(schema) =>
          onPatternSchemaChange(property.name, schema)
        }
        depth={depth}
        autoFocus={autoFocus}
      />
    ))}
  </>
);

export default SchemaPropertyRows;
