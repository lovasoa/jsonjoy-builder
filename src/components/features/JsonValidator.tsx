import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { JSONSchema } from "@/types/jsonSchema";
import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import Ajv from "ajv";
import addFormats from "ajv-formats";
import { Loader2 } from "lucide-react";
import { useRef, useState } from "react";

interface JsonValidatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: JSONSchema;
}

// Initialize Ajv with all supported formats
const ajv = new Ajv({
  allErrors: true,
  strict: false,
});
addFormats(ajv);

export function JsonValidator({
  open,
  onOpenChange,
  schema,
}: JsonValidatorProps) {
  const [jsonInput, setJsonInput] = useState("");
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    errors?: string[];
  } | null>(null);
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);

  const handleBeforeMount: BeforeMount = (monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemaValidation: "error",
    });
  };

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleEditorChange = (value: string | undefined) => {
    setJsonInput(value || "");
  };

  const validateJsonAgainstSchema = () => {
    try {
      const jsonObject = JSON.parse(jsonInput);

      // Use Ajv to validate the JSON against the schema
      const validate = ajv.compile(schema);
      const valid = validate(jsonObject);

      if (!valid) {
        const errors =
          validate.errors?.map((error) => {
            const path = error.instancePath || "/";
            return `${path} ${error.message}`;
          }) || [];

        setValidationResult({
          valid: false,
          errors,
        });
      } else {
        setValidationResult({
          valid: true,
          errors: [],
        });
      }
    } catch (error) {
      console.error("Invalid JSON input:", error);
      setValidationResult({
        valid: false,
        errors: ["Invalid JSON format. Please check your input."],
      });
    }
  };

  const handleClose = () => {
    setJsonInput("");
    setValidationResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Validate JSON</DialogTitle>
          <DialogDescription>
            Paste your JSON document to validate against the current schema.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 flex flex-col md:flex-row gap-4 py-4 min-h-0">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="text-sm font-medium mb-2">Your JSON:</div>
            <div className="border rounded-md flex-1 overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={jsonInput}
                onChange={handleEditorChange}
                beforeMount={handleBeforeMount}
                onMount={handleEditorDidMount}
                className="monaco-editor-container h-full"
                loading={
                  <div className="flex items-center justify-center h-full w-full bg-secondary/30">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                }
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  roundedSelection: false,
                  scrollBeyondLastLine: false,
                  readOnly: false,
                  automaticLayout: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  tabSize: 2,
                  insertSpaces: true,
                  detectIndentation: true,
                  folding: true,
                  foldingStrategy: "indentation",
                  renderLineHighlight: "all",
                  matchBrackets: "always",
                  autoClosingBrackets: "always",
                  autoClosingQuotes: "always",
                  guides: {
                    bracketPairs: true,
                    indentation: true,
                  },
                }}
                theme="light"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col min-h-0">
            <div className="text-sm font-medium mb-2">Current Schema:</div>
            <div className="border rounded-md flex-1 overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="json"
                value={JSON.stringify(schema, null, 2)}
                beforeMount={handleBeforeMount}
                className="monaco-editor-container h-full"
                loading={
                  <div className="flex items-center justify-center h-full w-full bg-secondary/30">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                }
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: "on",
                  readOnly: true,
                  automaticLayout: true,
                  folding: true,
                  foldingStrategy: "indentation",
                }}
                theme="light"
              />
            </div>
          </div>
        </div>

        {validationResult && !validationResult.valid && (
          <div className="text-sm text-destructive space-y-1 border-t pt-4">
            <p className="font-semibold">Validation errors:</p>
            <ul className="list-disc pl-5">
              {validationResult.errors?.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}
        {validationResult?.valid && (
          <div className="text-sm text-green-500 font-semibold border-t pt-4">
            JSON is valid according to the schema! ✓
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={validateJsonAgainstSchema}>Validate</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
