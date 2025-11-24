import { Check, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "../../hooks/use-translation.ts";
import { cn, getTypeColor, getTypeLabel } from "../../lib/utils.ts";
import type { SchemaType } from "../../types/jsonSchema.ts";

export interface TypeDropdownProps {
  value: SchemaType;
  onChange: (value: SchemaType) => void;
  className?: string;
  readOnly: boolean;
}

const typeOptions: SchemaType[] = [
  "string",
  "number",
  "boolean",
  "object",
  "array",
  "null",
];

export const TypeDropdown: React.FC<TypeDropdownProps> = ({
  value,
  onChange,
  className,
  readOnly,
}) => {
  const t = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className={cn(
          "text-xs px-3.5 py-1.5 rounded-md font-medium text-center flex items-center justify-between",
          getTypeColor(value),
          "hover:shadow-xs hover:ring-1 hover:ring-ring/30 active:scale-95 transition-all",
          readOnly ? "" : "w-[92px]",
          className,
        )}
        onClick={() => !readOnly && setIsOpen(!isOpen)}
      >
        <span>{getTypeLabel(t, value)}</span>
        {!readOnly && <ChevronDown size={14} className="ml-1" />}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-[140px] rounded-md border bg-popover shadow-lg animate-in fade-in-50 zoom-in-95">
          <div className="py-1">
            {typeOptions.map((type) => (
              <button
                key={type}
                type="button"
                className={cn(
                  "w-full text-left px-3 py-1.5 text-xs flex items-center justify-between",
                  "hover:bg-muted/50 transition-colors",
                  value === type && "font-medium",
                )}
                onClick={() => {
                  onChange(type);
                  setIsOpen(false);
                }}
              >
                <span className={cn("px-2 py-0.5 rounded", getTypeColor(type))}>
                  {getTypeLabel(t, type)}
                </span>
                {value === type && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TypeDropdown;
