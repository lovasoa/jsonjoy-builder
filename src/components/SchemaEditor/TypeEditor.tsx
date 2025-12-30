import { lazy, Suspense } from "react";
import type {
  JSONSchema,
  ObjectJSONSchema,
  SchemaType,
} from "../../types/jsonSchema.ts";
import { withObjectSchema } from "../../types/jsonSchema.ts";
import type { ValidationTreeNode } from "../../types/validation.ts";
import { useTranslation } from "../../hooks/use-translation.ts";

// Lazy load specific type editors to avoid circular dependencies
const StringEditor = lazy(() => import("./types/StringEditor.tsx"));
const NumberEditor = lazy(() => import("./types/NumberEditor.tsx"));
const BooleanEditor = lazy(() => import("./types/BooleanEditor.tsx"));
const ObjectEditor = lazy(() => import("./types/ObjectEditor.tsx"));
const ArrayEditor = lazy(() => import("./types/ArrayEditor.tsx"));

export interface TypeEditorProps {
  schema: JSONSchema;
  readOnly: boolean;
  validationNode: ValidationTreeNode | undefined;
  onChange: (schema: ObjectJSONSchema) => void;
  depth?: number;
}

const TypeEditor: React.FC<TypeEditorProps> = ({
  schema,
  validationNode,
  onChange,
  depth = 0,
  readOnly = false,
}) => {
  const t = useTranslation();
  const type = withObjectSchema(
    schema,
    (s) => (s.type || "object") as SchemaType,
    "string" as SchemaType,
  );

  return (
    <Suspense fallback={<div>{t.schemaEditorLoading}</div>}>
      {type === "string" && (
        <StringEditor
          readOnly={readOnly}
          schema={schema}
          onChange={onChange}
          depth={depth}
          validationNode={validationNode}
        />
      )}
      {type === "number" && (
        <NumberEditor
          readOnly={readOnly}
          schema={schema}
          onChange={onChange}
          depth={depth}
          validationNode={validationNode}
        />
      )}
      {type === "integer" && (
        <NumberEditor
          readOnly={readOnly}
          schema={schema}
          onChange={onChange}
          depth={depth}
          validationNode={validationNode}
          integer
        />
      )}
      {type === "boolean" && (
        <BooleanEditor
          readOnly={readOnly}
          schema={schema}
          onChange={onChange}
          depth={depth}
          validationNode={validationNode}
        />
      )}
      {type === "object" && (
        <ObjectEditor
          readOnly={readOnly}
          schema={schema}
          onChange={onChange}
          depth={depth}
          validationNode={validationNode}
        />
      )}
      {type === "array" && (
        <ArrayEditor
          readOnly={readOnly}
          schema={schema}
          onChange={onChange}
          depth={depth}
          validationNode={validationNode}
        />
      )}
    </Suspense>
  );
};

export default TypeEditor;
