import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface DraggedItem {
  id: string;
  sourceContainerId: string;
  propertySchema: any;
  required: boolean;
  /**
   * Optional callback that removes this property from its source container.
   * Used to implement true "move" semantics when dragging between containers.
   */
  removeFromSource?: () => void;
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
  const [dropPosition, setDropPosition] = useState<"top" | "bottom" | null>(null);

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
