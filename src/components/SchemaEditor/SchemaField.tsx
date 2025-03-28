import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { hasChildren } from "@/lib/schemaEditor";
import { cn } from "@/lib/utils";
import type {
  JSONSchema as JSONSchemaType,
  NewField,
  SchemaType,
} from "@/types/jsonSchema";
import { ChevronDown, ChevronRight, ChevronUp, Edit, X } from "lucide-react";
import type React from "react";
import { Suspense, lazy, useEffect, useRef, useState } from "react";
import AddFieldButton from "./AddFieldButton";

// Lazy load the field type components to avoid circular dependencies
const ObjectSchemaField = lazy(() => import("./fields/ObjectSchemaField.tsx"));
const ArraySchemaField = lazy(() => import("./fields/ArraySchemaField.tsx"));
const PrimitiveSchemaField = lazy(
  () => import("./fields/PrimitiveSchemaField.tsx"),
);

interface SchemaFieldProps {
  name: string;
  schema: JSONSchemaType;
  required?: boolean;
  onDelete: () => void;
  onEdit: (updatedField: NewField) => void;
  onAddField?: (newField: NewField) => void;
  isNested?: boolean;
  depth?: number;
}

// Factory component that renders the appropriate field type
const SchemaField: React.FC<SchemaFieldProps> = (props) => {
  const { schema } = props;
  const type = typeof schema === "boolean" ? "object" : schema.type || "object";

  // Wrap in Suspense to handle lazy loading
  return (
    <Suspense fallback={<div>Loading field...</div>}>
      {/* Render the appropriate field type based on the schema */}
      {type === "object" && <ObjectSchemaField {...props} />}
      {type === "array" && <ArraySchemaField {...props} />}
      {type !== "object" && type !== "array" && (
        <PrimitiveSchemaField {...props} />
      )}
    </Suspense>
  );
};

export default SchemaField;

// Export common utilities that can be used by field type components
export const getTypeColor = (type: SchemaType): string => {
  switch (type) {
    case "string":
      return "text-blue-500 bg-blue-50";
    case "number":
    case "integer":
      return "text-purple-500 bg-purple-50";
    case "boolean":
      return "text-green-500 bg-green-50";
    case "object":
      return "text-orange-500 bg-orange-50";
    case "array":
      return "text-pink-500 bg-pink-50";
    case "null":
      return "text-gray-500 bg-gray-50";
  }
};

export const getTypeLabel = (type: SchemaType): string => {
  switch (type) {
    case "string":
      return "Text";
    case "number":
    case "integer":
      return "Number";
    case "boolean":
      return "Yes/No";
    case "object":
      return "Group";
    case "array":
      return "List";
    case "null":
      return "Empty";
  }
};

export interface FieldDisplayProps {
  name: string;
  schema: JSONSchemaType;
  required: boolean;
  onTypeChange: (type: SchemaType) => void;
  onRequiredChange: (required: boolean) => void;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
}

export const FieldDisplay: React.FC<FieldDisplayProps> = ({
  name,
  schema,
  required,
  onTypeChange,
  onRequiredChange,
  onNameChange,
  onDescriptionChange,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [isTypeOpen, setIsTypeOpen] = useState(false);
  const [tempName, setTempName] = useState(name);
  const [tempDesc, setTempDesc] = useState(
    typeof schema === "boolean" ? "" : schema.description || "",
  );
  const typeDropdownRef = useRef<HTMLDivElement>(null);
  const type =
    typeof schema === "boolean"
      ? "object"
      : ((schema.type || "object") as SchemaType);
  const description =
    typeof schema === "boolean" ? "" : schema.description || "";

  useEffect(() => {
    setTempName(name);
    setTempDesc(description);
  }, [name, description]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTypeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNameSubmit = () => {
    const trimmedName = tempName.trim();
    if (trimmedName && trimmedName !== name) {
      onNameChange(trimmedName);
    } else {
      setTempName(name);
    }
    setIsEditingName(false);
  };

  const handleDescSubmit = () => {
    const trimmedDesc = tempDesc.trim();
    if (trimmedDesc !== description) {
      onDescriptionChange(trimmedDesc);
    } else {
      setTempDesc(description);
    }
    setIsEditingDesc(false);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 flex-grow group">
      <div className="flex-grow flex flex-wrap items-center gap-2 min-w-[200px]">
        {isEditingName ? (
          <Input
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
            className="h-8 text-sm font-medium min-w-[120px] max-w-full"
            autoFocus
            onFocus={(e) => e.target.select()}
          />
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingName(true)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditingName(true)}
            className="json-field-label font-medium cursor-text px-2 py-0.5 -mx-0.5 rounded-sm hover:bg-secondary/30 hover:shadow-sm hover:ring-1 hover:ring-ring/20 transition-all text-left max-w-full truncate"
          >
            {name}
          </button>
        )}
        {isEditingDesc ? (
          <Input
            value={tempDesc}
            onChange={(e) => setTempDesc(e.target.value)}
            onBlur={handleDescSubmit}
            onKeyDown={(e) => e.key === "Enter" && handleDescSubmit()}
            placeholder="Add description..."
            className="h-8 text-xs text-muted-foreground italic flex-1 min-w-[150px]"
            autoFocus
            onFocus={(e) => e.target.select()}
          />
        ) : description ? (
          <button
            type="button"
            onClick={() => setIsEditingDesc(true)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditingDesc(true)}
            className="text-xs text-muted-foreground italic max-w-full truncate cursor-text px-2 py-0.5 -mx-0.5 rounded-sm hover:bg-secondary/30 hover:shadow-sm hover:ring-1 hover:ring-ring/20 transition-all text-left min-w-0 flex-1"
          >
            {description}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingDesc(true)}
            onKeyDown={(e) => e.key === "Enter" && setIsEditingDesc(true)}
            className="text-xs text-muted-foreground/50 italic cursor-text px-2 py-0.5 -mx-0.5 rounded-sm hover:bg-secondary/30 hover:shadow-sm hover:ring-1 hover:ring-ring/20 transition-all opacity-0 group-hover:opacity-100 text-left min-w-0 flex-1"
          >
            Add description...
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 justify-end">
        <div className="relative" ref={typeDropdownRef}>
          <button
            type="button"
            onClick={() => setIsTypeOpen(!isTypeOpen)}
            onKeyDown={(e) => e.key === "Enter" && setIsTypeOpen(!isTypeOpen)}
            className={cn(
              "text-xs px-3.5 py-1.5 rounded-md font-medium w-[92px] text-left cursor-pointer hover:shadow-sm hover:ring-1 hover:ring-ring/20 active:scale-[0.98] transition-all flex items-center justify-between gap-2 whitespace-nowrap",
              getTypeColor(type),
              isTypeOpen && "ring-2 ring-ring/30",
            )}
          >
            {getTypeLabel(type)}
            <ChevronDown
              size={14}
              className={cn(
                "text-current opacity-60 transition-transform duration-200",
                isTypeOpen && "rotate-180",
              )}
            />
          </button>
          <div
            className={cn(
              "fixed sm:absolute sm:right-0 left-4 sm:left-auto bottom-4 sm:bottom-auto sm:top-[calc(100%+6px)] w-[calc(100%-32px)] sm:w-[160px] rounded-lg shadow-lg border border-border/40 bg-popover/95 backdrop-blur-sm p-2 transition-all duration-200 origin-bottom sm:origin-top-right z-50",
              isTypeOpen
                ? "scale-100 opacity-100"
                : "scale-95 opacity-0 pointer-events-none",
            )}
          >
            {(["string", "number", "boolean", "object", "array"] as const).map(
              (t, i) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => {
                    onTypeChange(t);
                    setIsTypeOpen(false);
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-all duration-150 flex items-center justify-between gap-2 group relative",
                    getTypeColor(t),
                    "hover:ring-1 hover:ring-ring/20 hover:shadow-sm",
                    t === type && "ring-1 ring-ring/40 shadow-sm",
                    i > 0 && "mt-2",
                  )}
                >
                  <span className="font-medium">{getTypeLabel(t)}</span>
                  {t === type && (
                    <ChevronRight
                      size={14}
                      className="text-current opacity-60"
                    />
                  )}
                </button>
              ),
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRequiredChange(!required)}
          className={cn(
            "text-xs px-2 py-1 rounded-md font-medium min-w-[80px] text-center cursor-pointer hover:shadow-sm hover:ring-2 hover:ring-ring/30 active:scale-95 transition-all whitespace-nowrap",
            required
              ? "bg-red-50 text-red-500"
              : "bg-secondary text-muted-foreground",
          )}
        >
          {required ? "Required" : "Optional"}
        </button>
      </div>
    </div>
  );
};

export interface ExpandButtonProps {
  expanded: boolean;
  onClick: () => void;
}

export const ExpandButton: React.FC<ExpandButtonProps> = ({
  expanded,
  onClick,
}) => (
  <button
    type="button"
    className="text-muted-foreground hover:text-foreground transition-colors"
    onClick={onClick}
    aria-label={expanded ? "Collapse" : "Expand"}
  >
    {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
  </button>
);

export interface FieldActionsProps {
  onDelete: () => void;
}

export const FieldActions: React.FC<FieldActionsProps> = ({ onDelete }) => (
  <div className="flex items-center gap-1 text-muted-foreground">
    <button
      type="button"
      onClick={onDelete}
      className="p-1 rounded-md hover:bg-secondary hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
      aria-label="Delete field"
    >
      <X size={16} />
    </button>
  </div>
);
