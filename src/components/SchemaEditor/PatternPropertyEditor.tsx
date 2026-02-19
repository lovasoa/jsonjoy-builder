import { ChevronDown, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "../../components/ui/input.tsx";
import { useTranslation } from "../../hooks/use-translation.ts";
import { cn } from "../../lib/utils.ts";
import type {
  JSONSchema,
  ObjectJSONSchema,
  SchemaType,
} from "../../types/jsonSchema.ts";
import {
  asObjectSchema,
  getSchemaDescription,
  withObjectSchema,
} from "../../types/jsonSchema.ts";
import type { ValidationTreeNode } from "../../types/validation.ts";
import TypeDropdown from "./TypeDropdown.tsx";
import TypeEditor from "./TypeEditor.tsx";

export interface PatternPropertyEditorProps {
  pattern: string;
  schema: JSONSchema;
  readOnly: boolean;
  validationNode?: ValidationTreeNode;
  onDelete: () => void;
  onPatternChange: (newPattern: string) => void;
  onSchemaChange: (schema: ObjectJSONSchema) => void;
  depth?: number;
}

export const PatternPropertyEditor: React.FC<PatternPropertyEditorProps> = ({
  pattern,
  schema,
  readOnly = false,
  validationNode,
  onDelete,
  onPatternChange,
  onSchemaChange,
  depth = 0,
}) => {
  const t = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [isEditingPattern, setIsEditingPattern] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [tempPattern, setTempPattern] = useState(pattern);
  const [tempDesc, setTempDesc] = useState(getSchemaDescription(schema));
  const [patternError, setPatternError] = useState<string | null>(null);
  const type = withObjectSchema(
    schema,
    (s) => (s.type || "object") as SchemaType,
    "object" as SchemaType,
  );

  // Update temp values when props change
  useEffect(() => {
    setTempPattern(pattern);
    setTempDesc(getSchemaDescription(schema));
  }, [pattern, schema]);

  const validatePattern = (value: string): boolean => {
    if (!value.trim()) {
      setPatternError("Pattern cannot be empty");
      return false;
    }
    try {
      new RegExp(value);
      setPatternError(null);
      return true;
    } catch {
      setPatternError(t.patternPropertyInvalidRegex);
      return false;
    }
  };

  const handlePatternSubmit = () => {
    const trimmedPattern = tempPattern.trim();
    if (validatePattern(trimmedPattern) && trimmedPattern !== pattern) {
      onPatternChange(trimmedPattern);
    } else {
      setTempPattern(pattern);
    }
    setIsEditingPattern(false);
    setPatternError(null);
  };

  const handleDescSubmit = () => {
    const trimmedDesc = tempDesc.trim();
    if (trimmedDesc !== getSchemaDescription(schema)) {
      onSchemaChange({
        ...asObjectSchema(schema),
        description: trimmedDesc || undefined,
      });
    } else {
      setTempDesc(getSchemaDescription(schema));
    }
    setIsEditingDesc(false);
  };

  // Handle schema changes, preserving description
  const handleSchemaUpdate = (updatedSchema: ObjectJSONSchema) => {
    const description = getSchemaDescription(schema);
    onSchemaChange({
      ...updatedSchema,
      description: description || undefined,
    });
  };

  return (
    <div
      className={cn(
        "mb-2 animate-in rounded-lg border transition-all duration-200",
        depth > 0 && "ml-0 sm:ml-4 border-l border-l-border/40",
      )}
    >
      <div className="relative json-field-row justify-between group">
        <div className="flex items-center gap-2 grow min-w-0">
          {/* Expand/collapse button */}
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? t.collapse : t.expand}
          >
            {expanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>

          {/* Property pattern */}
          <div className="flex items-center gap-2 grow min-w-0 overflow-visible">
            <div className="flex items-center gap-2 min-w-0 grow overflow-visible">
              {!readOnly && isEditingPattern ? (
                <div className="flex flex-col gap-1">
                  <Input
                    value={tempPattern}
                    onChange={(e) => {
                      setTempPattern(e.target.value);
                      validatePattern(e.target.value);
                    }}
                    onBlur={handlePatternSubmit}
                    onKeyDown={(e) => e.key === "Enter" && handlePatternSubmit()}
                    className={cn(
                      "h-8 text-sm font-mono min-w-[120px] max-w-full z-10",
                      patternError && "border-destructive",
                    )}
                    autoFocus
                    onFocus={(e) => e.target.select()}
                  />
                  {patternError && (
                    <span className="text-xs text-destructive">
                      {patternError}
                    </span>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingPattern(true)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingPattern(true)}
                  className="json-field-label font-mono text-sm cursor-text px-2 py-0.5 -mx-0.5 rounded-sm hover:bg-secondary/30 hover:shadow-xs hover:ring-1 hover:ring-ring/20 transition-all text-left truncate min-w-[80px] max-w-[50%] bg-secondary/50"
                >
                  /{pattern}/
                </button>
              )}

              {/* Description */}
              {!readOnly && isEditingDesc ? (
                <Input
                  value={tempDesc}
                  onChange={(e) => setTempDesc(e.target.value)}
                  onBlur={handleDescSubmit}
                  onKeyDown={(e) => e.key === "Enter" && handleDescSubmit()}
                  placeholder={t.propertyDescriptionPlaceholder}
                  className="h-8 text-xs text-muted-foreground italic flex-1 min-w-[150px] z-10"
                  autoFocus
                  onFocus={(e) => e.target.select()}
                />
              ) : tempDesc ? (
                <button
                  type="button"
                  onClick={() => setIsEditingDesc(true)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingDesc(true)}
                  className="text-xs text-muted-foreground italic cursor-text px-2 py-0.5 -mx-0.5 rounded-sm hover:bg-secondary/30 hover:shadow-xs hover:ring-1 hover:ring-ring/20 transition-all text-left truncate flex-1 max-w-[40%] mr-2"
                >
                  {tempDesc}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditingDesc(true)}
                  onKeyDown={(e) => e.key === "Enter" && setIsEditingDesc(true)}
                  className="text-xs text-muted-foreground/50 italic cursor-text px-2 py-0.5 -mx-0.5 rounded-sm hover:bg-secondary/30 hover:shadow-xs hover:ring-1 hover:ring-ring/20 transition-all opacity-0 group-hover:opacity-100 text-left truncate flex-1 max-w-[40%] mr-2"
                >
                  {t.propertyDescriptionButton}
                </button>
              )}

              {/* Type display */}
              <div className="flex items-center gap-2 justify-end shrink-0">
                <TypeDropdown
                  value={type}
                  readOnly={readOnly}
                  onChange={(newType) => {
                    onSchemaChange({
                      ...asObjectSchema(schema),
                      type: newType,
                    });
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error badge */}
        {validationNode?.cumulativeChildrenErrors > 0 && (
          <span className="h-5 min-w-5 rounded-full px-1 font-mono tabular-nums justify-center text-xs bg-destructive text-destructive-foreground">
            {validationNode.cumulativeChildrenErrors}
          </span>
        )}

        {/* Delete button */}
        {!readOnly && (
          <div className="flex items-center gap-1 text-muted-foreground">
            <button
              type="button"
              onClick={onDelete}
              className="p-1 rounded-md hover:bg-secondary hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
              aria-label={t.patternPropertyDelete}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* Type-specific editor */}
      {expanded && (
        <div className="pt-1 pb-2 px-2 sm:px-3 animate-in">
          {readOnly && tempDesc && <p className="pb-2">{tempDesc}</p>}
          <TypeEditor
            schema={schema}
            readOnly={readOnly}
            validationNode={validationNode}
            onChange={handleSchemaUpdate}
            depth={depth + 1}
          />
        </div>
      )}
    </div>
  );
};

export default PatternPropertyEditor;
