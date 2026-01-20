import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";
import type { JSONSchema } from "../../types/jsonSchema.ts";

export interface DraggedItem {
  /**
   * The property name being dragged.
   */
  id: string;
  /**
   * Path (from the root schema of the visual editor) to the object schema
   * that currently owns this property. This is the container whose
   * `properties` collection includes `id`.
   *
   * For example, the root object has path [], and a nested object field
   * `address` would live at ["properties", "address"].
   */
  parentPath: string[];
  /**
   * Original container identifier, still used for quick equality checks in
   * the UI (e.g. highlighting the dragged row). This is purely a view-level
   * identifier and not used for schema updates anymore.
   */
  sourceContainerId: string;
  /**
   * The JSON Schema for the dragged property.
   */
  propertySchema: JSONSchema;
  /**
   * Whether the dragged property is required in its source container.
   */
  required: boolean;
}

interface DragContextType {
  draggedItem: DraggedItem | null;
  setDraggedItem: (item: DraggedItem | null) => void;
  dragOverItem: string | null;
  setDragOverItem: (item: string | null) => void;
  dropPosition: "top" | "bottom" | null;
  setDropPosition: (position: "top" | "bottom" | null) => void;
  clearDragState: () => void;
}

const DragContext = createContext<DragContextType | undefined>(undefined);

export const useDragContext = () => {
  const context = useContext(DragContext);
  if (!context) {
    throw new Error("useDragContext must be used within a DragProvider");
  }
  return context;
};

interface DragProviderProps {
  children: ReactNode;
}

export const DragProvider: React.FC<DragProviderProps> = ({ children }) => {
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [dragOverItem, setDragOverItem] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<"top" | "bottom" | null>(
    null,
  );

  const clearDragState = () => {
    setDraggedItem(null);
    setDragOverItem(null);
    setDropPosition(null);
  };

  return (
    <DragContext.Provider
      value={{
        draggedItem,
        setDraggedItem,
        dragOverItem,
        setDragOverItem,
        dropPosition,
        setDropPosition,
        clearDragState,
      }}
    >
      {children}
    </DragContext.Provider>
  );
};

export default DragContext;
