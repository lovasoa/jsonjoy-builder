import { useMemo } from "react";
import { useTranslation } from "../../../hooks/use-translation.ts";
import {
  getSchemaProperties,
  moveProperty,
  removeObjectProperty,
  updateObjectProperty,
  updatePropertyRequired,
  reorderProperty,
} from "../../../lib/schemaEditor.ts";
import type { NewField, ObjectJSONSchema } from "../../../types/jsonSchema.ts";
import { asObjectSchema, isBooleanSchema } from "../../../types/jsonSchema.ts";
import AddFieldButton from "../AddFieldButton.tsx";
import SchemaPropertyEditor from "../SchemaPropertyEditor.tsx";
import type { TypeEditorProps } from "../TypeEditor.tsx";
import { useDragContext } from "../DragContext.tsx";

const ObjectEditor: React.FC<TypeEditorProps> = ({
  schema,
  validationNode,
  onChange,
  depth = 0,
  readOnly = false,
}) => {
  const t = useTranslation();
  const containerId = useMemo(() => `object-editor-${depth}-${Math.random().toString(36).substr(2, 9)}`, [depth]);
  
  const {
    draggedItem,
    setDraggedItem,
    dragOverItem,
    setDragOverItem,
    dropPosition,
    setDropPosition,
    clearDragState,
  } = useDragContext();

  // Get object properties
  const properties = getSchemaProperties(schema);

  // Create a normalized schema object
  const normalizedSchema: ObjectJSONSchema = isBooleanSchema(schema)
    ? { type: "object", properties: {} }
    : { ...schema, type: "object", properties: schema.properties || {} };

  // Handle adding a new property
  const handleAddProperty = (newField: NewField) => {
    // Create field schema from the new field data
    const fieldSchema = {
      type: newField.type,
      description: newField.description || undefined,
      ...(newField.validation || {}),
    } as ObjectJSONSchema;

    // Add the property to the schema
    let newSchema = updateObjectProperty(
      normalizedSchema,
      newField.name,
      fieldSchema,
    );

    // Update required status if needed
    if (newField.required) {
      newSchema = updatePropertyRequired(newSchema, newField.name, true);
    }

    // Update the schema
    onChange(newSchema);
  };

  // Handle deleting a property
  const handleDeleteProperty = (propertyName: string) => {
    const newSchema = removeObjectProperty(normalizedSchema, propertyName);
    onChange(newSchema);
  };

  // Handle property name change
  const handlePropertyNameChange = (oldName: string, newName: string) => {
    if (oldName === newName) return;

    const property = properties.find((p) => p.name === oldName);
    if (!property) return;

    const propertySchemaObj = asObjectSchema(property.schema);

    // Add property with new name
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

  // Handle property required status change
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

  // Handle drag start
  const handleDragStart = (_e: React.DragEvent, name: string) => {
    const property = properties.find((p) => p.name === name);
    if (!property) return;

    setDraggedItem({
      id: name,
      sourceContainerId: containerId,
      propertySchema: property.schema,
      required: property.required,
      // Allow moving this field out into another container by providing
      // a callback that removes it from this object schema.
      removeFromSource: () => {
        const updated = removeObjectProperty(normalizedSchema, name);
        onChange(updated);
      },
    });
  };

  // Handle drag over for items
  const handleDragOver = (e: React.DragEvent, name: string) => {
    e.preventDefault();
    if (!draggedItem || (draggedItem.sourceContainerId === containerId && draggedItem.id === name)) {
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

    let newSchema: ObjectJSONSchema;

    // Check if this is a cross-container drop
    if (draggedItem.sourceContainerId !== containerId) {
      // Cross-container drop: move the property to this object.
      // Compute the intended insertion index from the target name and
      // drop position so it matches the visual separator.
      const propertyKeys = Object.keys(normalizedSchema.properties || {});
      const baseIndex = targetName ? propertyKeys.indexOf(targetName) : -1;
      const targetIndex =
        baseIndex >= 0
          ? baseIndex + (dropPosition === "bottom" ? 1 : 0)
          : propertyKeys.length;

      // Generate a unique name for the moved property in this object
      let newName = draggedItem.id;
      let counter = 1;
      while (normalizedSchema.properties && normalizedSchema.properties[newName]) {
        newName = `${draggedItem.id}_${counter}`;
        counter++;
      }

      // Add the property to the schema
      newSchema = updateObjectProperty(
        normalizedSchema,
        newName,
        draggedItem.propertySchema,
      );

      // Update required status if needed
      if (draggedItem.required) {
        newSchema = updatePropertyRequired(newSchema, newName, true);
      }

      // Reorder the newly added property into the intended position
      // indicated by the separator.
      newSchema = reorderProperty(newSchema, newName, targetIndex);

      // Remove the field from its original container to complete the move.
      draggedItem.removeFromSource?.();
    } else if (targetName) {
      // Same container drop: move relative to target item
      if (dropPosition === "top") {
        // Move before the target item
        newSchema = moveProperty(
          normalizedSchema,
          draggedItem.id,
          targetName,
          false,
        );
      } else {
        // Move after the target item (default)
        newSchema = moveProperty(
          normalizedSchema,
          draggedItem.id,
          targetName,
          true,
        );
      }
    } else {
      newSchema = normalizedSchema;
    }

    onChange(newSchema);

    clearDragState();
  };

  // Handle drag end
  const handleDragEnd = () => {
    clearDragState();
  };

  // Handle drag over on the container to allow drops anywhere in the list
  const handleContainerDragOver = (e: React.DragEvent) => {
    // Only handle drag events that are directly on this container, not
    // those bubbled from child elements (like deeper nested editors).
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

  return (
    <div className="space-y-4">
      {properties.length > 0 ? (
        <div
          className="space-y-2"
          onDragOver={handleContainerDragOver}
          onDrop={handleContainerDrop}
        >
          {properties.map((property) => (
            <SchemaPropertyEditor
              readOnly={readOnly}
              key={property.name}
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
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              isDragging={draggedItem?.id === property.name && draggedItem.sourceContainerId === containerId}
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
      ) : (
        <div className="text-sm text-muted-foreground italic p-2 text-center border rounded-md">
          {t.objectPropertiesNone}
        </div>
      )}

      {!readOnly && (
        <div className="mt-4">
          <AddFieldButton onAddField={handleAddProperty} variant="secondary" />
        </div>
      )}
    </div>
  );
};

export default ObjectEditor;
