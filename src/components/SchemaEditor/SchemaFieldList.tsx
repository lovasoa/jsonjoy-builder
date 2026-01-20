import { type FC, useMemo } from "react";
import { useTranslation } from "../../hooks/use-translation.ts";
import {
  getSchemaProperties,
  moveProperty,
  removeObjectProperty,
  reorderProperty,
  updateObjectProperty,
  updatePropertyRequired,
} from "../../lib/schemaEditor.ts";
import type {
  JSONSchema as JSONSchemaType,
  NewField,
  ObjectJSONSchema,
  SchemaType,
} from "../../types/jsonSchema.ts";
import { asObjectSchema, isBooleanSchema } from "../../types/jsonSchema.ts";
import { buildValidationTree } from "../../types/validation.ts";
import { useDragContext } from "./DragContext.tsx";
import SchemaPropertyEditor from "./SchemaPropertyEditor.tsx";

interface SchemaFieldListProps {
  schema: JSONSchemaType;
  readOnly: boolean;
  onAddField: (newField: NewField) => void;
  onEditField: (name: string, updatedField: NewField) => void;
  onDeleteField: (name: string) => void;
  onSchemaChange?: (schema: JSONSchemaType) => void;
}

const SchemaFieldList: FC<SchemaFieldListProps> = ({
  schema,
  onEditField,
  onDeleteField,
  readOnly = false,
  onSchemaChange,
}) => {
  const t = useTranslation();
  const containerId = useMemo(
    () => `schema-field-list-${Math.random().toString(36).substr(2, 9)}`,
    [],
  );

  const {
    draggedItem,
    setDraggedItem,
    dragOverItem,
    setDragOverItem,
    dropPosition,
    setDropPosition,
    clearDragState,
  } = useDragContext();

  // Get the properties from the schema
  const properties = getSchemaProperties(schema);

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
  ) => {
    const property = properties.find((prop) => prop.name === name);
    if (!property) return;

    const type = updatedSchema.type || "object";
    // Ensure we're using a single type, not an array of types
    const validType = Array.isArray(type) ? type[0] || "object" : type;

    onEditField(name, {
      name,
      type: validType,
      description: updatedSchema.description || "",
      required: property.required,
      validation: updatedSchema,
    });
  };

  // Handle drag start
  const handleDragStart = (_e: React.DragEvent, name: string) => {
    const property = properties.find((prop) => prop.name === name);
    if (!property) return;

    setDraggedItem({
      id: name,
      sourceContainerId: containerId,
      propertySchema: property.schema,
      required: property.required,
      // Enable true move semantics for cross-container drops by providing
      // a callback that removes this property from the current schema.
      removeFromSource: () => {
        if (!onSchemaChange || isBooleanSchema(schema)) return;
        const objectSchema = asObjectSchema(schema);
        const updated = removeObjectProperty(objectSchema, name);
        onSchemaChange(updated);
      },
    });
  };

  // Handle drag over for items
  const handleDragOver = (e: React.DragEvent, name: string) => {
    e.preventDefault();
    if (
      !draggedItem ||
      (draggedItem.sourceContainerId === containerId && draggedItem.id === name)
    ) {
      setDropPosition(null);
      return;
    }

    setDragOverItem(name);

    // Calculate drop position based on mouse Y position relative to element
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const threshold = rect.height / 2;

    if (relativeY < threshold) {
      setDropPosition("top");
    } else {
      setDropPosition("bottom");
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetName: string | null = null) => {
    e.preventDefault();
    if (!draggedItem) {
      clearDragState();
      return;
    }

    if (onSchemaChange && !isBooleanSchema(schema)) {
      const objectSchema = asObjectSchema(schema);

      let newSchema: ObjectJSONSchema;

      // Check if this is a cross-container drop
      if (draggedItem.sourceContainerId !== containerId) {
        // Cross-container drop: move the property to this container.
        // Compute the intended insertion index based on the current
        // target name and drop position (top/bottom), which matches
        // the visual separator shown in the UI.
        const propertyKeys = Object.keys(objectSchema.properties || {});
        const baseIndex = targetName ? propertyKeys.indexOf(targetName) : -1;
        const targetIndex =
          baseIndex >= 0
            ? baseIndex + (dropPosition === "bottom" ? 1 : 0)
            : propertyKeys.length;

        // Generate a unique name for the moved property in this container
        let newName = draggedItem.id;
        let counter = 1;
        while (objectSchema.properties && objectSchema.properties[newName]) {
          newName = `${draggedItem.id}_${counter}`;
          counter++;
        }

        // Add the property to the schema
        newSchema = updateObjectProperty(
          objectSchema,
          newName,
          draggedItem.propertySchema,
        );

        // Update required status if needed
        if (draggedItem.required) {
          newSchema = updatePropertyRequired(newSchema, newName, true);
        }

        // Reorder the newly added property so it matches the visual
        // drop position indicated by the separator.
        newSchema = reorderProperty(newSchema, newName, targetIndex);

        // Finally, remove the field from its original container to
        // implement move (not copy) semantics across containers.
        draggedItem.removeFromSource?.();
      } else if (targetName) {
        // Same container drop: move relative to target item
        if (dropPosition === "top") {
          // Move before the target item
          newSchema = moveProperty(
            objectSchema,
            draggedItem.id,
            targetName,
            false,
          );
        } else {
          // Move after the target item (default)
          newSchema = moveProperty(
            objectSchema,
            draggedItem.id,
            targetName,
            true,
          );
        }
      } else {
        newSchema = objectSchema;
      }

      onSchemaChange(newSchema);
    }

    clearDragState();
  };

  // Handle drag end
  const handleDragEnd = () => {
    clearDragState();
  };

  // Handle drag over on the container to allow drops anywhere in the list
  const handleContainerDragOver = (e: React.DragEvent) => {
    // Only handle drag events that are directly on this container, not
    // those bubbled from child elements (like nested object editors).
    if (e.target !== e.currentTarget) return;

    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  // Handle drop on the container using the existing dragOverItem and dropPosition state
  const handleContainerDrop = (e: React.DragEvent) => {
    // Ignore drops that originated from child elements; those components
    // handle their own drag-and-drop behavior.
    if (e.target !== e.currentTarget) return;

    // Use the existing dragOverItem and dropPosition state
    // This allows dropping in dead zones while respecting the UI state
    handleDrop(e, dragOverItem);
  };

  const validationTree = useMemo(
    () => buildValidationTree(schema, t),
    [schema, t],
  );

  return (
    <div
      className="space-y-2 animate-in pt-2"
      onDragOver={handleContainerDragOver}
      onDrop={handleContainerDrop}
    >
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
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          isDragging={
            draggedItem?.id === property.name &&
            draggedItem.sourceContainerId === containerId
          }
          isDragOver={dragOverItem === property.name}
          dropPosition={
            dragOverItem === property.name &&
            (dropPosition === "top" || dropPosition === "bottom")
              ? dropPosition
              : null
          }
        />
      ))}
    </div>
  );
};

export default SchemaFieldList;
