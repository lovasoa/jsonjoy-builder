import { useMemo, type FC } from "react";
import { useTranslation } from "../../hooks/use-translation.ts";
import {
  getSchemaProperties,
  type FieldDropTarget,
  type FieldMoveLocation,
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
  const containerId = useMemo(() => {
    const uniqueId = crypto.randomUUID();
    return `schema-field-list-${uniqueId}`;
  }, []);

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
      parentPath,
      sourceContainerId: containerId,
      propertySchema: property.schema,
      required: property.required,
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

  // Handle drop – delegate to the centralized handler in the visual editor
  const handleDrop = (e: React.DragEvent, targetName: string | null = null) => {
    e.preventDefault();
    if (!draggedItem || !onFieldDrop) {
      clearDragState();
      return;
    }

    const source: FieldMoveLocation = {
      parentPath: draggedItem.parentPath,
      name: draggedItem.id,
    };

    const target: FieldDropTarget = {
      parentPath,
      anchorName: targetName ?? dragOverItem,
      position: dropPosition,
    };

    onFieldDrop(source, target);
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

  // Handle keyboard events for accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Escape key cancels any active drag operation
    if (e.key === "Escape" && draggedItem) {
      clearDragState();
      e.preventDefault();
    }
  };

  // Handle focus events for accessibility
  const handleFocus = () => {
    // When container receives focus, announce its purpose
    if (draggedItem) {
      // Container is a valid drop target
    }
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
    <section
      className="space-y-2 animate-in pt-2"
      aria-label="Field list drop zone"
      tabIndex={readOnly ? -1 : 0}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
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
          parentPath={parentPath}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          onFieldDrop={onFieldDrop}
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
    </section>
  );
};

export default SchemaFieldList;
