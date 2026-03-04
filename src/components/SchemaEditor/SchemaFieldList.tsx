import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { type FC, useEffect, useMemo } from "react";
import { useTranslation } from "../../hooks/use-translation.ts";
import {
  type FieldDropTarget,
  type FieldMoveLocation,
  getSchemaProperties,
} from "../../lib/schemaEditor.ts";
import type {
  JSONSchema as JSONSchemaType,
  NewField,
  ObjectJSONSchema,
  SchemaType,
} from "../../types/jsonSchema.ts";
import { buildValidationTree } from "../../types/validation.ts";
import { useDragContext } from "./DragContext.tsx";
import SchemaPropertyEditor from "./SchemaPropertyEditor.tsx";

interface SchemaFieldListProps {
  schema: JSONSchemaType;
  readOnly: boolean;
  onEditField: (name: string, updatedField: NewField) => void;
  onDeleteField: (name: string) => void;
  parentPath: string[];
  onFieldDrop?: (source: FieldMoveLocation, target: FieldDropTarget) => void;
}

const SchemaFieldList: FC<SchemaFieldListProps> = ({
  schema,
  onEditField,
  onDeleteField,
  readOnly = false,
  parentPath,
  onFieldDrop,
}) => {
  const t = useTranslation();
  const { setDragging, setOver } = useDragContext();

  const properties = getSchemaProperties(schema);

  const getValidSchemaType = (propSchema: JSONSchemaType): SchemaType => {
    if (typeof propSchema === "boolean") return "object";
    const type = propSchema.type;
    if (Array.isArray(type)) return type[0] || "object";
    return type || "object";
  };

  const handleNameChange = (oldName: string, newName: string) => {
    const property = properties.find((prop) => prop.name === oldName);
    if (!property) return;

    onEditField(oldName, {
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
    });
  };

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

  const handleSchemaChange = (
    name: string,
    updatedSchema: ObjectJSONSchema,
  ) => {
    const property = properties.find((prop) => prop.name === name);
    if (!property) return;

    const type = updatedSchema.type || "object";
    const validType = Array.isArray(type) ? type[0] || "object" : type;

    onEditField(name, {
      name,
      type: validType,
      description: updatedSchema.description || "",
      required: property.required,
      validation: updatedSchema,
    });
  };

  // Global monitor — drives both the drop indicator and the actual field move.
  useEffect(() => {
    // Returns the innermost drop target that is not an ancestor of the source.
    const resolveTarget = (
      sourceData: { parentPath: string[]; name: string },
      dropTargets: Array<{ data: Record<string | symbol, unknown> }>,
    ) => {
      const isAncestor = (td: { parentPath: string[]; name: string }) => {
        const prefix = [...td.parentPath, "properties", td.name];
        return (
          sourceData.parentPath.length >= prefix.length &&
          prefix.every((s, i) => s === sourceData.parentPath[i])
        );
      };
      return (
        dropTargets.find(
          (t) => !isAncestor(t.data as { parentPath: string[]; name: string }),
        ) ?? null
      );
    };

    return monitorForElements({
      onDragStart: ({ source }) => {
        const src = source.data as { parentPath: string[]; name: string };
        setDragging([...src.parentPath, src.name].join("/") || src.name);
      },
      onDrag: ({ source, location }) => {
        const src = source.data as { parentPath: string[]; name: string };
        const target = resolveTarget(src, location.current.dropTargets);
        if (!target) {
          setOver(null, null);
          return;
        }
        const td = target.data as { parentPath: string[]; name: string };
        const overId = [...td.parentPath, td.name].join("/") || td.name;
        const edge = extractClosestEdge(target.data) as "top" | "bottom" | null;
        setOver(overId, edge);
      },
      onDrop: ({ source, location }) => {
        setDragging(null);
        setOver(null, null);
        if (!onFieldDrop) return;
        const src = source.data as { parentPath: string[]; name: string };
        const target = resolveTarget(src, location.current.dropTargets);
        if (!target) return;
        const td = target.data as { parentPath: string[]; name: string };
        const edge = extractClosestEdge(target.data);
        onFieldDrop(
          { parentPath: src.parentPath, name: src.name },
          {
            parentPath: td.parentPath,
            anchorName: td.name,
            position: (edge as "top" | "bottom") ?? "bottom",
          },
        );
      },
    });
  }, [onFieldDrop, setDragging, setOver]);

  const validationTree = useMemo(
    () => buildValidationTree(schema, t),
    [schema, t],
  );

  return (
    <section className="space-y-2 animate-in pt-2" aria-label="Field list">
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
          parentPath={parentPath}
          onFieldDrop={onFieldDrop}
        />
      ))}
    </section>
  );
};

export default SchemaFieldList;
