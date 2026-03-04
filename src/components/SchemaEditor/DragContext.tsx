import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

interface DragStateContextType {
  draggingId: string | null;
  overId: string | null;
  overEdge: "top" | "bottom" | null;
  setDragging: (id: string | null) => void;
  setOver: (id: string | null, edge: "top" | "bottom" | null) => void;
}

const DragContext = createContext<DragStateContextType>({
  draggingId: null,
  overId: null,
  overEdge: null,
  setDragging: () => {},
  setOver: () => {},
});

export const useDragContext = () => useContext(DragContext);

interface DragProviderProps {
  children: ReactNode;
}

export const DragProvider: React.FC<DragProviderProps> = ({ children }) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [overEdge, setOverEdge] = useState<"top" | "bottom" | null>(null);

  const setDragging = (id: string | null) => setDraggingId(id);

  const setOver = (id: string | null, edge: "top" | "bottom" | null) => {
    setOverId(id);
    setOverEdge(edge);
  };

  return (
    <DragContext.Provider value={{ draggingId, overId, overEdge, setDragging, setOver }}>
      {children}
    </DragContext.Provider>
  );
};

export default DragContext;
