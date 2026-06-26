import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { Download, FileCode, Loader2 } from "lucide-react";
import { type FC, useEffect, useMemo, useRef, useState } from "react";
import { useControllableSchema } from "../../hooks/use-controllable-schema.ts";
import { useMonacoTheme } from "../../hooks/use-monaco-theme.ts";
import { useTranslation } from "../../hooks/use-translation.ts";
import { SchemaBuilderProvider } from "../../i18n/schema-builder-config.tsx";
import type { Translation } from "../../i18n/translation-keys.ts";
import {
  getSchemaSourceFileName,
  getSchemaSourceMimeType,
  type SchemaSourceFormat,
  schemaToSource,
  sourceToSchema,
} from "../../lib/schema-source.ts";
import { cn } from "../../lib/utils.ts";
import { SchemaBuilderRegistryProvider } from "../../registry/SchemaBuilderRegistryContext.tsx";
import type { SchemaBuilderRegistry } from "../../registry/types.ts";
import type { JsonSchema } from "../../types/jsonSchema.ts";

const schemaSourceFormats: SchemaSourceFormat[] = ["yaml", "json"];
const schemaSourceFormatLabels: Record<SchemaSourceFormat, string> = {
  yaml: "YAML",
  json: "JSON",
};

/** @public */
export interface SchemaJsonEditorProps {
  value?: JsonSchema;
  defaultValue?: JsonSchema;
  onChange?: (schema: JsonSchema) => void;
  readOnly?: boolean;
  autoFocus?: boolean;
  className?: string;
  locale?: Translation;
  messages?: Partial<Translation>;
  registry?: SchemaBuilderRegistry;
}

/** @public */
const SchemaJsonEditor: FC<SchemaJsonEditorProps> = ({
  value,
  defaultValue,
  onChange,
  readOnly = false,
  autoFocus = true,
  className,
  locale,
  messages,
  registry,
}) => {
  const [schema, setSchema] = useControllableSchema({
    value,
    defaultValue,
    onChange,
  });

  return (
    <SchemaBuilderProvider locale={locale} messages={messages}>
      <SchemaBuilderRegistryProvider value={registry}>
        <SchemaJsonEditorContent
          value={schema}
          onChange={setSchema}
          readOnly={readOnly}
          autoFocus={autoFocus}
          className={className}
        />
      </SchemaBuilderRegistryProvider>
    </SchemaBuilderProvider>
  );
};

interface SchemaJsonEditorContentProps {
  value: JsonSchema;
  onChange: (schema: JsonSchema) => void;
  readOnly?: boolean;
  autoFocus?: boolean;
  className?: string;
}

const SchemaJsonEditorContent: FC<SchemaJsonEditorContentProps> = ({
  value,
  onChange,
  readOnly = false,
  autoFocus = true,
  className,
}) => {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const { currentTheme, defineMonacoThemes, defaultEditorOptions } =
    useMonacoTheme();

  const t = useTranslation();
  const valueJson = useMemo(() => JSON.stringify(value), [value]);
  const [sourceFormat, setSourceFormat] = useState<SchemaSourceFormat>("yaml");
  const [source, setSource] = useState(() => schemaToSource(value, "yaml"));
  const lastEmittedJsonRef = useRef<string | null>(null);

  useEffect(() => {
    if (lastEmittedJsonRef.current === valueJson) {
      lastEmittedJsonRef.current = null;
      return;
    }

    setSource(schemaToSource(value, sourceFormat));
  }, [value, valueJson, sourceFormat]);

  const handleBeforeMount: BeforeMount = (monaco) => {
    defineMonacoThemes(monaco);
  };

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    if (autoFocus) {
      editor.focus();
    }
  };

  const handleEditorChange = (nextValue: string | undefined) => {
    if (readOnly || nextValue === undefined) return;

    setSource(nextValue);

    try {
      const parsedSchema = sourceToSchema(nextValue, sourceFormat);
      lastEmittedJsonRef.current = JSON.stringify(parsedSchema);
      onChange(parsedSchema);
    } catch (_error) {
      // Keep invalid source as an editable draft until it parses successfully.
    }
  };

  const handleSourceFormatChange = (nextFormat: SchemaSourceFormat) => {
    if (nextFormat === sourceFormat) return;

    lastEmittedJsonRef.current = null;
    setSourceFormat(nextFormat);
    setSource(schemaToSource(value, nextFormat));
  };

  const handleDownload = () => {
    const content = schemaToSource(value, sourceFormat);
    const blob = new Blob([content], {
      type: getSchemaSourceMimeType(sourceFormat),
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = getSchemaSourceFileName(
      sourceFormat,
      t.visualizerDownloadFileName,
    );
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden h-full flex flex-col",
        className,
        "jsonjoy",
      )}
    >
      <div className="flex items-center justify-between bg-secondary/80 backdrop-blur-xs px-4 py-2 border-b shrink-0">
        <div className="flex items-center gap-2">
          <FileCode size={18} />
          <span className="font-medium text-sm">{t.visualizerSource}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="grid h-8 grid-cols-2 items-center rounded-md bg-muted p-0.5 text-muted-foreground">
            {schemaSourceFormats.map((format) => (
              <button
                key={format}
                type="button"
                aria-pressed={sourceFormat === format}
                onClick={() => handleSourceFormatChange(format)}
                className={cn(
                  "inline-flex h-7 min-w-12 items-center justify-center rounded-sm px-2 text-xs font-medium transition-colors",
                  sourceFormat === format
                    ? "bg-background text-foreground shadow-xs"
                    : "hover:text-foreground",
                )}
              >
                {schemaSourceFormatLabels[format]}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={handleDownload}
            className="p-1.5 hover:bg-secondary rounded-md transition-colors"
            title={`${t.visualizerDownloadTitle} (${schemaSourceFormatLabels[sourceFormat]})`}
          >
            <Download size={16} />
          </button>
        </div>
      </div>
      <div className="grow flex min-h-0">
        <Editor
          height="100%"
          language={sourceFormat}
          value={source}
          onChange={handleEditorChange}
          beforeMount={handleBeforeMount}
          onMount={handleEditorDidMount}
          className="monaco-editor-container w-full h-full"
          loading={
            <div className="flex items-center justify-center h-full w-full bg-secondary/30">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          }
          options={{
            ...defaultEditorOptions,
            fontFamily:
              "'SF Mono', Monaco, Menlo, Consolas, 'Liberation Mono', monospace",
            readOnly,
          }}
          theme={currentTheme}
        />
      </div>
    </div>
  );
};

export default SchemaJsonEditor;
