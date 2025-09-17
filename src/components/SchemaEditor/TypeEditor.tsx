import { lazy, Suspense } from "react";
import type {
  JSONSchema,
  ObjectJSONSchema,
  SchemaType,
} from "../../types/jsonSchema.ts";
import { withObjectSchema } from "../../types/jsonSchema.ts";
import type { ValidationTreeNode } from "../../types/validation.ts";

// Lazy load specific type editors to avoid circular dependencies
const StringEditor = lazy(() => import("./types/StringEditor.tsx"));
const NumberEditor = lazy(() => import("./types/NumberEditor.tsx"));
const BooleanEditor = lazy(() => import("./types/BooleanEditor.tsx"));
const ObjectEditor = lazy(() => import("./types/ObjectEditor.tsx"));
const ArrayEditor = lazy(() => import("./types/ArrayEditor.tsx"));

export interface TypeEditorProps {
  schema: JSONSchema;
  validationNode: ValidationTreeNode | undefined;
  onChange: (schema: ObjectJSONSchema) => void;
  depth?: number;
}

const TypeEditor: React.FC<TypeEditorProps> = ({
  schema,
  validationNode,
  onChange,
  depth = 0,
}) => {
  const type = withObjectSchema(
    schema,
    (s) => (s.type || "object") as SchemaType,
    "string" as SchemaType,
  );

  return (
    <Suspense fallback={<div>Loading editor...</div>}>
      {type === "string" && (
        <StringEditor
          schema={schema}
          onChange={onChange}
          depth={depth}
          validationNode={validationNode}
        />
      )}
      {type === "number" && (
        <NumberEditor
          schema={schema}
          onChange={onChange}
          depth={depth}
          validationNode={validationNode}
        />
      )}
      {type === "integer" && (
        <NumberEditor
          schema={schema}
          onChange={onChange}
          depth={depth}
          validationNode={validationNode}
          integer
        />
      )}
      {type === "boolean" && (
        <BooleanEditor
          schema={schema}
          onChange={onChange}
          depth={depth}
          validationNode={validationNode}
        />
      )}
      {type === "object" && (
        <ObjectEditor
          schema={schema}
          onChange={onChange}
          depth={depth}
          validationNode={validationNode}
        />
      )}
      {type === "array" && (
        <ArrayEditor
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
