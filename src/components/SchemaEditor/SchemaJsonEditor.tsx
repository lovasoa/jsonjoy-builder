import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { Download, FileJson, Loader2 } from "lucide-react";
import { type FC, useRef } from "react";
import { useControllableSchema } from "../../hooks/use-controllable-schema.ts";
import { useMonacoTheme } from "../../hooks/use-monaco-theme.ts";
import { useTranslation } from "../../hooks/use-translation.ts";
import { SchemaBuilderProvider } from "../../i18n/schema-builder-config.tsx";
import type { Translation } from "../../i18n/translation-keys.ts";
import { cn } from "../../lib/utils.ts";
import { SchemaBuilderRegistryProvider } from "../../registry/SchemaBuilderRegistryContext.tsx";
import type { SchemaBuilderRegistry } from "../../registry/types.ts";
import type { JsonSchema } from "../../types/jsonSchema.ts";

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
  const {
    currentTheme,
    defineMonacoThemes,
    configureJsonDefaults,
    defaultEditorOptions,
  } = useMonacoTheme();

  const t = useTranslation();

  const handleBeforeMount: BeforeMount = (monaco) => {
    defineMonacoThemes(monaco);
    configureJsonDefaults(monaco);
  };

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    if (autoFocus) {
      editor.focus();
    }
  };

  const handleEditorChange = (nextValue: string | undefined) => {
    if (readOnly || !nextValue) return;

    try {
      const parsedJson = JSON.parse(nextValue);
      onChange(parsedJson);
    } catch (_error) {
      // Monaco will show the error inline, no need for additional error handling
    }
  };

  const handleDownload = () => {
    const content = JSON.stringify(value, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = t.visualizerDownloadFileName;
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
          <FileJson size={18} />
          <span className="font-medium text-sm">{t.visualizerSource}</span>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="p-1.5 hover:bg-secondary rounded-md transition-colors"
          title={t.visualizerDownloadTitle}
        >
          <Download size={16} />
        </button>
      </div>
      <div className="grow flex min-h-0">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={JSON.stringify(value, null, 2)}
          onChange={handleEditorChange}
          beforeMount={handleBeforeMount}
          onMount={handleEditorDidMount}
          className="monaco-editor-container w-full h-full"
          loading={
            <div className="flex items-center justify-center h-full w-full bg-secondary/30">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          }
          options={{ ...defaultEditorOptions, readOnly }}
          theme={currentTheme}
        />
      </div>
    </div>
  );
};

export default SchemaJsonEditor;
