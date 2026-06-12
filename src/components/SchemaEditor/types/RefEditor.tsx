import { Check, ChevronDown, Eye, EyeOff, TriangleAlert } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "../../../components/ui/input.tsx";
import { useRootSchema } from "../../../hooks/use-root-schema.ts";
import { useTranslation } from "../../../hooks/use-translation.ts";
import { collectRefTargets, resolveRef } from "../../../lib/refUtils.ts";
import { cn, getTypeColor, getTypeLabel } from "../../../lib/utils.ts";
import {
  asObjectSchema,
  getEditorType,
  withObjectSchema,
} from "../../../types/jsonSchema.ts";
import type { TypeEditorProps } from "../TypeEditor.tsx";
import TypeEditor from "../TypeEditor.tsx";

const RefEditor: React.FC<TypeEditorProps> = ({
  schema,
  readOnly = false,
  onChange,
  schemaKey,
  depth = 0,
}) => {
  const t = useTranslation();
  const rootSchema = useRootSchema(schema);

  const refValue = withObjectSchema(schema, (s) => s.$ref ?? "", "");
  const [draft, setDraft] = useState(refValue);
  const [isOpen, setIsOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDraft(refValue);
  }, [refValue]);

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

  const targets = useMemo(() => collectRefTargets(rootSchema), [rootSchema]);
  const resolution = useMemo(
    () => resolveRef(rootSchema, refValue),
    [rootSchema, refValue],
  );

  const commitTarget = (target: string) => {
    if (target !== refValue) {
      onChange({ ...asObjectSchema(schema), $ref: target });
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground italic">{t.refDescription}</p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium">{t.refTargetLabel}</span>

        {readOnly ? (
          <code className="text-xs bg-secondary px-2 py-1 rounded-md">
            {refValue}
          </code>
        ) : (
          <>
            <Input
              aria-label={t.refTargetLabel}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => commitTarget(draft.trim())}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  e.currentTarget.blur();
                }
              }}
              placeholder={t.refTargetPlaceholder}
              className="h-8 font-mono text-xs flex-1 min-w-[200px]"
            />

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                className="text-xs px-3 py-1.5 rounded-md font-medium flex items-center gap-1 bg-secondary text-muted-foreground hover:text-foreground hover:shadow-xs hover:ring-1 hover:ring-ring/30 active:scale-95 transition-all"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span>{t.refSelectTarget}</span>
                <ChevronDown size={14} />
              </button>

              {isOpen && (
                <div className="absolute right-0 z-50 mt-1 w-[260px] rounded-md border bg-popover shadow-lg animate-in fade-in-50 zoom-in-95">
                  <div className="py-1 max-h-[260px] overflow-auto">
                    {targets.length === 0 && (
                      <div className="px-3 py-1.5 text-xs text-muted-foreground italic">
                        {t.refNoDefinitions}
                      </div>
                    )}
                    {targets.map((target) => (
                      <button
                        key={target.pointer}
                        type="button"
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-xs flex items-center justify-between gap-2",
                          "hover:bg-muted/50 transition-colors",
                          refValue === target.pointer && "font-medium",
                        )}
                        onClick={() => {
                          commitTarget(target.pointer);
                          setIsOpen(false);
                        }}
                      >
                        <span className="truncate">
                          <span className="font-medium">{target.name}</span>{" "}
                          <span className="text-muted-foreground font-mono">
                            {target.pointer}
                          </span>
                        </span>
                        {refValue === target.pointer && (
                          <Check size={14} className="shrink-0" />
                        )}
                      </button>
                    ))}
                    <button
                      type="button"
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-xs flex items-center justify-between gap-2 border-t",
                        "hover:bg-muted/50 transition-colors",
                        refValue === "#" && "font-medium",
                      )}
                      onClick={() => {
                        commitTarget("#");
                        setIsOpen(false);
                      }}
                    >
                      <span>
                        {t.refRootLabel}{" "}
                        <span className="text-muted-foreground font-mono">
                          #
                        </span>
                      </span>
                      {refValue === "#" && <Check size={14} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {resolution.kind === "unresolved" && (
        <p className="text-xs text-destructive flex items-center gap-1.5">
          <TriangleAlert size={14} className="shrink-0" />
          {t.refBrokenWarning}
        </p>
      )}

      {resolution.kind === "external" && (
        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
          <TriangleAlert size={14} className="shrink-0" />
          {t.refExternalInfo}
        </p>
      )}

      {resolution.kind === "resolved" && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded-md font-medium",
                getTypeColor(getEditorType(resolution.schema)),
              )}
            >
              {getTypeLabel(t, getEditorType(resolution.schema))}
            </span>
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-secondary"
            >
              {showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
              {showPreview ? t.refPreviewHide : t.refPreviewShow}
            </button>
          </div>

          {showPreview && (
            <div className="rounded-lg border p-3 animate-in">
              <TypeEditor
                schema={resolution.schema}
                readOnly
                validationNode={undefined}
                onChange={() => {}}
                schemaKey={schemaKey ? `${schemaKey}.$ref` : "$ref"}
                depth={depth + 1}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RefEditor;
