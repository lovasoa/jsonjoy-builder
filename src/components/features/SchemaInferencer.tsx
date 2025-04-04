import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMonacoTheme } from "@/hooks/use-monaco-theme";
import { createSchemaFromJson } from "@/lib/schema-inference";
import type { JSONSchema } from "@/types/jsonSchema";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";

interface SchemaInferencerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSchemaInferred: (schema: JSONSchema) => void;
}

export function SchemaInferencer({
  open,
  onOpenChange,
  onSchemaInferred,
}: SchemaInferencerProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState<string | null>(null);
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
    setJsonInput(value || "");
  };

  const inferSchemaFromJson = () => {
    try {
      const jsonObject = JSON.parse(jsonInput);
      setError(null);

      // Use the schema inference service to create a schema
      const inferredSchema = createSchemaFromJson(jsonObject);

      onSchemaInferred(inferredSchema);
      onOpenChange(false);
    } catch (error) {
      console.error("Invalid JSON input:", error);
      setError("Invalid JSON format. Please check your input.");
    }
  };

  const handleClose = () => {
    setJsonInput("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Infer JSON Schema</DialogTitle>
          <DialogDescription>
            Paste your JSON document below to generate a schema from it.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 min-h-0 py-4 flex flex-col">
          <div className="border rounded-md flex-1 overflow-hidden h-full">
            <Editor
              height="450px"
              defaultLanguage="json"
              value={jsonInput}
              onChange={handleEditorChange}
              beforeMount={handleBeforeMount}
              onMount={handleEditorDidMount}
              options={defaultEditorOptions}
              theme={currentTheme}
              loading={
                <div className="flex items-center justify-center h-full w-full bg-secondary/30">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              }
            />
          </div>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={inferSchemaFromJson}>Generate Schema</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
