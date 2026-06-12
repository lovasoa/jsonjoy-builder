import React, { Suspense } from "react";
import { useTranslation } from "../../hooks/use-translation.ts";
import type {
  JsonSchema as JsonSchemaType,
  NewField,
  ObjectJsonSchema,
} from "../../types/jsonSchema.ts";
import {
  asObjectSchema,
  getEditorType,
  getSchemaDescription,
} from "../../types/jsonSchema.ts";
import SchemaPropertyEditor from "./SchemaPropertyEditor.tsx";

// This component is now just a simple wrapper around SchemaPropertyEditor
// to maintain backward compatibility during migration
interface SchemaFieldProps {
  name: string;
  schema: JsonSchemaType;
  required?: boolean;
  readOnly: boolean;
  onDelete: () => void;
  onEdit: (updatedField: NewField) => void;
  onAddField?: (newField: NewField) => void;
  isNested?: boolean;
  depth?: number;
}

const SchemaField: React.FC<SchemaFieldProps> = (props) => {
  const {
    name,
    schema,
    required = false,
    onDelete,
    onEdit,
    depth = 0,
    readOnly = false,
  } = props;

  // Handle name change
  const handleNameChange = (newName: string) => {
    if (newName === name) return;

    onEdit({
      name: newName,
      type: getEditorType(schema),
      description: getSchemaDescription(schema),
      required,
      validation: asObjectSchema(schema),
    });
  };

  // Handle required status change
  const handleRequiredChange = (isRequired: boolean) => {
    if (isRequired === required) return;

    onEdit({
      name,
      type: getEditorType(schema),
      description: getSchemaDescription(schema),
      required: isRequired,
      validation: asObjectSchema(schema),
    });
  };

  // Handle schema change
  const handleSchemaChange = (newSchema: ObjectJsonSchema) => {
    onEdit({
      name,
      type: getEditorType(newSchema),
      description: newSchema.description || "",
      required,
      validation: newSchema,
    });
  };

  return (
    <SchemaPropertyEditor
      name={name}
      readOnly={readOnly}
      schema={schema}
      required={required}
      onDelete={onDelete}
      onNameChange={handleNameChange}
      onRequiredChange={handleRequiredChange}
      onSchemaChange={handleSchemaChange}
      depth={depth}
    />
  );
};

export default SchemaField;

// ExpandButton - extract for reuse
export interface ExpandButtonProps {
  expanded: boolean;
  onClick: () => void;
}

export const ExpandButton: React.FC<ExpandButtonProps> = ({
  expanded,
  onClick,
}) => {
  const t = useTranslation();
  const ChevronDown = React.lazy(() =>
    import("lucide-react").then((mod) => ({ default: mod.ChevronDown })),
  );
  const ChevronRight = React.lazy(() =>
    import("lucide-react").then((mod) => ({ default: mod.ChevronRight })),
  );

  return (
    <button
      type="button"
      className="text-muted-foreground hover:text-foreground transition-colors"
      onClick={onClick}
      aria-label={expanded ? t.collapse : t.expand}
    >
      <Suspense fallback={<div className="w-[18px] h-[18px]" />}>
        {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </Suspense>
    </button>
  );
};

// FieldActions - extract for reuse
export interface FieldActionsProps {
  onDelete: () => void;
}

export const FieldActions: React.FC<FieldActionsProps> = ({ onDelete }) => {
  const t = useTranslation();
  const X = React.lazy(() =>
    import("lucide-react").then((mod) => ({ default: mod.X })),
  );

  return (
    <div className="flex items-center gap-1 text-muted-foreground">
      <button
        type="button"
        onClick={onDelete}
        className="p-1 rounded-md hover:bg-secondary hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
        aria-label={t.fieldDelete}
      >
        <Suspense fallback={<div className="w-[16px] h-[16px]" />}>
          <X size={16} />
        </Suspense>
      </button>
    </div>
  );
};
