import { useMemo } from "react";
import { useTranslation } from "../../../hooks/use-translation.ts";
import {
  type FieldDropTarget,
  type FieldMoveLocation,
  getSchemaProperties,
  removeObjectProperty,
  updateObjectProperty,
  updatePropertyRequired,
} from "../../../lib/schemaEditor.ts";
import type { NewField, ObjectJSONSchema } from "../../../types/jsonSchema.ts";
import { asObjectSchema, isBooleanSchema } from "../../../types/jsonSchema.ts";
import { ButtonToggle } from "../../ui/button-toggle.tsx";
import AddFieldButton from "../AddFieldButton.tsx";
import { useDragContext } from "../DragContext.tsx";
import SchemaPropertyEditor from "../SchemaPropertyEditor.tsx";
import type { TypeEditorProps } from "../TypeEditor.tsx";

const ObjectEditor: React.FC<TypeEditorProps> = ({
  schema,
  validationNode,
  onChange,
  depth = 0,
  readOnly = false,
  path,
  onFieldDrop,
}) => {
  const t = useTranslation();
  const containerId = useMemo(
    () => `object-editor-${depth}-${Math.random().toString(36).substr(2, 9)}`,
    [depth],
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

  // Get object properties
  const properties = getSchemaProperties(schema);

  // Create a normalized schema object
  const normalizedSchema: ObjectJSONSchema = isBooleanSchema(schema)
    ? { type: "object", properties: {} }
    : { ...schema, type: "object", properties: schema.properties || {} };

  const { additionalProperties } = normalizedSchema;

  // Handle adding a new property
  const handleAddProperty = (newField: NewField) => {
    // Create field schema from the new field data
    const { type, description, validation, additionalProperties } = newField;

    const fieldSchema = {
      type,
      description: description || undefined,
      ...(validation || {}),
      ...(additionalProperties === false ? { additionalProperties } : {}),
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
      parentPath: path,
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
      parentPath: path,
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

  const handleAdditionalPropertiesToggle = () => {
    const { additionalProperties, ...restOfSchema } = normalizedSchema;

    const updatedSchema = asObjectSchema(restOfSchema);

    if (additionalProperties !== false) {
      updatedSchema.additionalProperties = false;
    }

    onChange(updatedSchema);
  };

  return (
    <div className="space-y-4">
      {properties.length > 0 ? (
        <ul
          className="space-y-2"
          aria-label="Object properties drop zone"
          onDragOver={handleContainerDragOver}
          onDrop={handleContainerDrop}
        >
          {properties.map((property) => (
            <li key={property.name}>
              <SchemaPropertyEditor
                readOnly={readOnly}
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
                parentPath={path}
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
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-sm text-muted-foreground italic p-2 text-center border rounded-md">
          {t.objectPropertiesNone}
        </div>
      )}

      {!readOnly && (
        <div className="mt-4 flex flex-row gap-x-4">
          <AddFieldButton onAddField={handleAddProperty} variant="secondary" />
          {/* Additional properties */}
          <ButtonToggle
            onClick={handleAdditionalPropertiesToggle}
            className={
              additionalProperties === false
                ? "bg-amber-50 text-amber-600"
                : "bg-lime-50 text-lime-600"
            }
          >
            {additionalProperties === false
              ? t.additionalPropertiesForbid
              : t.additionalPropertiesAllow}
          </ButtonToggle>
        </div>
      )}
    </div>
  );
};

export default ObjectEditor;
