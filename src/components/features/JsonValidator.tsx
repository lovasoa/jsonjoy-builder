import Editor, { type BeforeMount, type OnMount } from "@monaco-editor/react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import type * as Monaco from "monaco-editor";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select.tsx";
import { useMonacoTheme } from "../../hooks/use-monaco-theme.ts";
import type { JSONSchema } from "../../types/jsonSchema.ts";
import {
  type ValidationResult,
  validateJson,
} from "../../utils/jsonValidator.ts";
import {
  formatTranslation,
  useTranslation,
} from "../../hooks/use-translation.ts";
import type { JSONSchemaDraft } from "../../utils/schema-version.ts";
import { detectSchemaVersion, getDraftDisplayName } from "../../utils/schema-version.ts";

/** @public */
export interface JsonValidatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schema: JSONSchema;
}

/** @public */
export function JsonValidator({
  open,
  onOpenChange,
  schema,
}: JsonValidatorProps) {
  const t = useTranslation();
  const [jsonInput, setJsonInput] = useState("");
  const [validationResult, setValidationResult] =
    useState<ValidationResult | null>(null);
  const [selectedDraft, setSelectedDraft] = useState<JSONSchemaDraft>(() =>
    detectSchemaVersion(schema)
  );
  const editorRef = useRef<Parameters<OnMount>[0] | null>(null);
  const debounceTimerRef = useRef<number | null>(null);
  const monacoRef = useRef<typeof Monaco | null>(null);
  const schemaMonacoRef = useRef<typeof Monaco | null>(null);
  const {
    currentTheme,
    defineMonacoThemes,
    configureJsonDefaults,
    defaultEditorOptions,
  } = useMonacoTheme();

  // Update selected draft when schema changes
  useEffect(() => {
    setSelectedDraft(detectSchemaVersion(schema));
  }, [schema]);

  const validateJsonAgainstSchema = useCallback(() => {
    if (!jsonInput.trim()) {
      setValidationResult(null);
      return;
    }

    const result = validateJson(jsonInput, schema, selectedDraft);
    setValidationResult(result);
  }, [jsonInput, schema, selectedDraft]);

  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      validateJsonAgainstSchema();
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [validateJsonAgainstSchema]);

  const handleJsonEditorBeforeMount: BeforeMount = (monaco) => {
    monacoRef.current = monaco;
    defineMonacoThemes(monaco);
    configureJsonDefaults(monaco, schema);
  };

  const handleSchemaEditorBeforeMount: BeforeMount = (monaco) => {
    schemaMonacoRef.current = monaco;
    defineMonacoThemes(monaco);
  };

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    
    // Unfold all content by default (users can fold manually if needed)
    try {
      editor.getAction('editor.unfoldAll')?.run();
    } catch (e) {
      // Ignore if action not available
    }
    
    editor.focus();
  };

  const handleEditorChange = (value: string | undefined) => {
    setJsonInput(value || "");
  };

  const goToError = (line: number, column: number) => {
    if (editorRef.current) {
      editorRef.current.revealLineInCenter(line);
      editorRef.current.setPosition({ lineNumber: line, column: column });
      editorRef.current.focus();
    }
  };

  // Create a modified version of defaultEditorOptions for the editor
  const editorOptions = {
    ...defaultEditorOptions,
    readOnly: false,
  };

  // Create read-only options for the schema viewer
  const schemaViewerOptions = {
    ...defaultEditorOptions,
    readOnly: true,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[700px] flex flex-col jsonjoy">
        <DialogHeader>
          <DialogTitle>{t.validatorTitle}</DialogTitle>
          <DialogDescription>{t.validatorDescription}</DialogDescription>
        </DialogHeader>
        
        {/* Draft Version Selector */}
        <div className="flex items-center gap-3 pb-2 border-b">
          <label className="text-sm font-medium">JSON Schema Draft:</label>
          <Select value={selectedDraft} onValueChange={(value) => setSelectedDraft(value as JSONSchemaDraft)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue>{getDraftDisplayName(selectedDraft)}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft-07">Draft 07</SelectItem>
              <SelectItem value="2019-09">Draft 2019-09</SelectItem>
              <SelectItem value="2020-12">Draft 2020-12 (Latest)</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-muted-foreground">
            Auto-detected: {getDraftDisplayName(detectSchemaVersion(schema))}
          </span>
        </div>

        <div className="flex-1 flex flex-col md:flex-row gap-4 py-4 overflow-hidden h-[600px]">
          <div className="flex-1 flex flex-col h-full">
            <div className="text-sm font-medium mb-2">{t.validatorContent}</div>
            <div className="border rounded-md flex-1 h-full">
              <Editor
                height="600px"
                defaultLanguage="json"
                value={jsonInput}
                onChange={handleEditorChange}
                beforeMount={handleJsonEditorBeforeMount}
                onMount={handleEditorDidMount}
                loading={
                  <div className="flex items-center justify-center h-full w-full bg-secondary/30">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                }
                options={editorOptions}
                theme={currentTheme}
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col h-full">
            <div className="text-sm font-medium mb-2">
              {t.validatorCurrentSchema}
            </div>
            <div className="border rounded-md flex-1 h-full">
              <Editor
                height="600px"
                defaultLanguage="json"
                value={JSON.stringify(schema, null, 2)}
                beforeMount={handleSchemaEditorBeforeMount}
                loading={
                  <div className="flex items-center justify-center h-full w-full bg-secondary/30">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                }
                options={schemaViewerOptions}
                theme={currentTheme}
              />
            </div>
          </div>
        </div>

        {validationResult && (
          <div
            className={`rounded-md p-4 ${validationResult.valid ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"} transition-all duration-300 ease-in-out`}
          >
            <div className="flex items-center">
              {validationResult.valid ? (
                <>
                  <Check className="h-5 w-5 text-green-500 mr-2" />
                  <p className="text-green-700 font-medium">
                    {t.validatorValid}
                  </p>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-red-700 font-medium">
                    {validationResult.errors.length === 1
                      ? validationResult.errors[0].path === "/"
                        ? t.validatorErrorInvalidSyntax
                        : t.validatorErrorSchemaValidation
                      : formatTranslation(t.validatorErrorCount, {
                          count: validationResult.errors.length,
                        })}
                  </p>
                </>
              )}
            </div>

            {!validationResult.valid &&
              validationResult.errors &&
              validationResult.errors.length > 0 && (
                <div className="mt-3 max-h-[200px] overflow-y-auto">
                  {validationResult.errors[0] && (
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-red-700">
                        {validationResult.errors[0].path === "/"
                          ? t.validatorErrorPathRoot
                          : validationResult.errors[0].path}
                      </span>
                      {validationResult.errors[0].line && (
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                          {validationResult.errors[0].column
                            ? formatTranslation(
                                t.validatorErrorLocationLineAndColumn,
                                {
                                  line: validationResult.errors[0].line,
                                  column: validationResult.errors[0].column,
                                },
                              )
                            : formatTranslation(
                                t.validatorErrorLocationLineOnly,
                                { line: validationResult.errors[0].line },
                              )}
                        </span>
                      )}
                    </div>
                  )}
                  <ul className="space-y-2">
                    {validationResult.errors.map((error, index) => (
                      <button
                        key={`error-${error.path}-${index}`}
                        type="button"
                        className="w-full text-left bg-white border border-red-100 rounded-md p-3 shadow-xs hover:shadow-md transition-shadow duration-200 cursor-pointer"
                        onClick={() =>
                          error.line &&
                          error.column &&
                          goToError(error.line, error.column)
                        }
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-red-700">
                              {error.path === "/"
                                ? t.validatorErrorPathRoot
                                : error.path}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {error.message}
                            </p>
                          </div>
                          {error.line && (
                            <div className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                              {error.column
                                ? formatTranslation(
                                    t.validatorErrorLocationLineAndColumn,
                                    { line: error.line, column: error.column },
                                  )
                                : formatTranslation(
                                    t.validatorErrorLocationLineOnly,
                                    { line: error.line },
                                  )}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
