import { useMonacoTheme } from "@/hooks/use-monaco-theme";
import { cn } from "@/lib/utils";
import type { JSONSchema } from "@/types/jsonSchema";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { Download, FileJson, Loader2 } from "lucide-react";
import type React from "react";
import { useRef } from "react";

interface JsonSchemaVisualizerProps {
  schema: JSONSchema;
  className?: string;
  onChange?: (schema: JSONSchema) => void;
}

const JsonSchemaVisualizer: React.FC<JsonSchemaVisualizerProps> = ({
  schema,
  className,
  onChange,
}) => {
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const {
    currentTheme,
    defineMonacoThemes,
    configureJsonDefaults,
    defaultEditorOptions,
  } = useMonacoTheme();

  const handleBeforeMount: BeforeMount = (monaco) => {
    defineMonacoThemes(monaco);
    configureJsonDefaults(monaco);
  };

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleEditorChange = (value: string | undefined) => {
    if (!value) return;

    try {
      const parsedJson = JSON.parse(value);
      if (onChange) {
        onChange(parsedJson);
      }
    } catch (error) {
      // Monaco will show the error inline, no need for additional error handling
    }
  };

  const handleDownload = () => {
    const content = JSON.stringify(schema, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schema.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={cn("relative overflow-hidden h-full flex flex-col", className)}
    >
      <div className="flex items-center justify-between bg-secondary/80 backdrop-blur-sm px-4 py-2 border-b flex-shrink-0">
        <div className="flex items-center gap-2">
          <FileJson size={18} />
          <span className="font-medium text-sm">JSON Schema Source</span>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          className="p-1.5 hover:bg-secondary rounded-md transition-colors"
          title="Download Schema"
        >
          <Download size={16} />
        </button>
      </div>
      <div className="flex-grow flex min-h-0">
        <Editor
          height="100%"
          defaultLanguage="json"
          value={JSON.stringify(schema, null, 2)}
          onChange={handleEditorChange}
          beforeMount={handleBeforeMount}
          onMount={handleEditorDidMount}
          className="monaco-editor-container w-full h-full"
          loading={
            <div className="flex items-center justify-center h-full w-full bg-secondary/30">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          }
          options={defaultEditorOptions}
          theme={currentTheme}
        />
      </div>
    </div>
  );
};

export default JsonSchemaVisualizer;
