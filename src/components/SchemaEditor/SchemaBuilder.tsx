import { Maximize2 } from "lucide-react";
import {
  type FC,
  type MouseEvent as ReactMouseEvent,
  useRef,
  useState,
} from "react";
import { useControllableSchema } from "../../hooks/use-controllable-schema.ts";
import { useTranslation } from "../../hooks/use-translation.ts";
import { SchemaBuilderProvider } from "../../i18n/schema-builder-config.tsx";
import type { Translation } from "../../i18n/translation-keys.ts";
import { cn } from "../../lib/utils.ts";
import type { JsonSchema } from "../../types/jsonSchema.ts";
import SchemaFieldsEditor from "./SchemaFieldsEditor.tsx";
import SchemaJsonEditor from "./SchemaJsonEditor.tsx";

/** @public */
export interface SchemaBuilderProps {
  value?: JsonSchema;
  defaultValue?: JsonSchema;
  onChange?: (schema: JsonSchema) => void;
  readOnly?: boolean;
  className?: string;
  autoFocus?: boolean;
  locale?: Translation;
  messages?: Partial<Translation>;
}

/** @public */
const SchemaBuilder: FC<SchemaBuilderProps> = ({
  value,
  defaultValue,
  onChange,
  readOnly = false,
  className,
  autoFocus = true,
  locale,
  messages,
}) => {
  const [schema, setSchema] = useControllableSchema({
    value,
    defaultValue,
    onChange,
  });

  return (
    <SchemaBuilderProvider locale={locale} messages={messages}>
      <SchemaBuilderContent
        value={schema}
        onChange={setSchema}
        readOnly={readOnly}
        className={className}
        autoFocus={autoFocus}
      />
    </SchemaBuilderProvider>
  );
};

interface SchemaBuilderContentProps {
  value: JsonSchema;
  onChange: (schema: JsonSchema) => void;
  readOnly?: boolean;
  className?: string;
  autoFocus?: boolean;
}

const SchemaBuilderContent: FC<SchemaBuilderContentProps> = ({
  value,
  onChange,
  readOnly = false,
  className,
  autoFocus = true,
}) => {
  const t = useTranslation();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mobileMode, setMobileMode] = useState<"visual" | "json">("visual");
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage
  const resizeRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const fullscreenClass = isFullscreen
    ? "fixed inset-0 z-50 bg-background"
    : "";

  const handleMouseDown = (e: ReactMouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const newWidth =
      ((e.clientX - containerRect.left) / containerRect.width) * 100;

    // Limit the minimum and maximum width
    if (newWidth >= 20 && newWidth <= 80) {
      setLeftPanelWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className={cn(
        "json-editor-container w-full",
        fullscreenClass,
        className,
        "jsonjoy",
      )}
    >
      <div className="block lg:hidden w-full">
        <div className="flex items-center justify-between px-4 py-3 border-b w-full">
          <h3 className="font-medium">{t.schemaEditorTitle}</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleFullscreen}
              className="p-1.5 rounded-md hover:bg-secondary transition-colors"
              aria-label={t.schemaEditorToggleFullscreen}
            >
              <Maximize2 size={16} />
            </button>
            <div className="grid grid-cols-2 w-[200px] h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
                  mobileMode === "visual" &&
                    "bg-background text-foreground shadow-xs",
                )}
                onClick={() => setMobileMode("visual")}
              >
                {t.schemaEditorEditModeVisual}
              </button>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all",
                  mobileMode === "json" &&
                    "bg-background text-foreground shadow-xs",
                )}
                onClick={() => setMobileMode("json")}
              >
                {t.schemaEditorEditModeJson}
              </button>
            </div>
          </div>
        </div>

        <div
          className={cn(
            "focus:outline-hidden w-full",
            isFullscreen ? "h-screen" : "h-[500px]",
          )}
        >
          {mobileMode === "visual" ? (
            <SchemaFieldsEditor
              readOnly={readOnly}
              value={value}
              onChange={onChange}
              autoFocus={autoFocus}
            />
          ) : (
            <SchemaJsonEditor
              value={value}
              onChange={onChange}
              readOnly={readOnly}
              autoFocus={autoFocus}
            />
          )}
        </div>
      </div>

      {/* For large screens - show side by side */}
      <div
        ref={containerRef}
        className={cn(
          "hidden lg:flex lg:flex-col w-full",
          isFullscreen ? "h-screen" : "h-[600px]",
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b w-full shrink-0">
          <h3 className="font-medium">{t.schemaEditorTitle}</h3>
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
            aria-label={t.schemaEditorToggleFullscreen}
          >
            <Maximize2 size={16} />
          </button>
        </div>
        <div className="flex flex-row w-full grow min-h-0">
          <div
            className="h-full min-h-0"
            style={{ width: `${leftPanelWidth}%` }}
          >
            <SchemaFieldsEditor
              readOnly={readOnly}
              value={value}
              onChange={onChange}
              autoFocus={autoFocus}
            />
          </div>
          {/** biome-ignore lint/a11y/noStaticElementInteractions: What exactly does this div do? */}
          <div
            ref={resizeRef}
            className="w-1 bg-border hover:bg-primary cursor-col-resize shrink-0"
            onMouseDown={handleMouseDown}
          />
          <div
            className="h-full min-h-0"
            style={{ width: `${100 - leftPanelWidth}%` }}
          >
            <SchemaJsonEditor
              value={value}
              onChange={onChange}
              readOnly={readOnly}
              autoFocus={autoFocus}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchemaBuilder;
