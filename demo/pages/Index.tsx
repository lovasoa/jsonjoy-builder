import {
  CheckCircle,
  CirclePlus,
  Code,
  FileJson,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { exampleSchema } from "../../demo/utils/schemaExample.ts";
import JsonSchemaEditor from "../../src/components/SchemaEditor/JsonSchemaEditor.tsx";
import { JsonValidator } from "../../src/components/features/JsonValidator.tsx";
import { SchemaInferencer } from "../../src/components/features/SchemaInferencer.tsx";
import { Button } from "../../src/components/ui/button.tsx";
import type { JSONSchema } from "../../src/types/jsonSchema.ts";
import { en } from "../../src/i18n/locales/en.ts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../src/components/ui/select.tsx";
import { TranslationContext } from "../../src/i18n/translation-context.ts";

const Index = () => {
  const [schema, setSchema] = useState<JSONSchema>(exampleSchema);
  const [inferDialogOpen, setInferDialogOpen] = useState(false);
  const [validateDialogOpen, setValidateDialogOpen] = useState(false);
  const [language, setLanguage] = useState("en");
  const [translation, setTranslation] = useState(en);

  const handleReset = () => setSchema(exampleSchema);

  const handleClear = () =>
    setSchema({
      type: "object",
      properties: {},
      required: [],
    });

  const handleInferSchema = () => {
    setInferDialogOpen(true);
  };

  const handleValidateJson = () => {
    setValidateDialogOpen(true);
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    import(`../../src/i18n/locales/${value}.ts`).then((module) => {
      setTranslation(module[value]);
    });
  };

  return (
    <TranslationContext value={translation}>
      <div className="min-h-screen bg-linear-to-b from-background to-background/95 relative overflow-hidden jsonjoy">
        {/* Background accent */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-50 animate-float"
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-50 animate-float"
          style={{ animationDelay: "1s" }}
          aria-hidden="true"
        />

        <div className="container mx-auto px-0 sm:px-2 md:px-6 lg:px-8 pt-16 pb-24 relative z-10">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="bg-primary/10 text-primary inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4">
                <FileJson size={16} className="mr-1.5" />
                Easy Schema Builder
              </div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 animate-in">
                Create JSON Schemas{" "}
                <span className="text-primary">Visually</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-in">
                Design your data structure effortlessly without writing a single
                line of code. Perfect for APIs, forms, and data validation.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-8 animate-in">
              <Button variant="outline" onClick={handleReset} className="gap-2">
                <RefreshCw size={16} />
                Reset to Example
              </Button>
              <Button variant="outline" onClick={handleClear} className="gap-2">
                <CirclePlus size={16} />
                Start from Scratch
              </Button>
              <Button
                variant="outline"
                onClick={handleInferSchema}
                className="gap-2"
              >
                <Code size={16} />
                Infer from JSON
              </Button>
              <Button
                variant="outline"
                onClick={handleValidateJson}
                className="gap-2"
              >
                <CheckCircle size={16} />
                Validate JSON
              </Button>
              <div>
                <Select value={language} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="h-10 font-medium">
                    <SelectValue placeholder="Language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="ru">Russian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex justify-center mb-6"></div>

          {/* Schema Editor - full width on large screens */}
          <div className="max-w-4xl mx-auto lg:max-w-none">
            <JsonSchemaEditor
              schema={schema}
              setSchema={setSchema}
              className="shadow-lg animate-in border-border/50 backdrop-blur-xs"
            />
          </div>

          {/* Schema inferencer component */}
          <SchemaInferencer
            open={inferDialogOpen}
            onOpenChange={setInferDialogOpen}
            onSchemaInferred={setSchema}
          />

          {/* JSON validator component */}
          <JsonValidator
            open={validateDialogOpen}
            onOpenChange={setValidateDialogOpen}
            schema={schema}
          />

          {/* How It Works - kept within max-w-4xl */}
          <div className="max-w-4xl mx-auto">
            <div className="mt-16 grid md:grid-cols-3 gap-6 text-center animate-in">
              <div className="glass-panel p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-xl">1</span>
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Define Schema Structure
                </h3>
                <p className="text-muted-foreground text-sm">
                  Create a user profile schema with name, email, and age fields.
                  Specify string formats for emails, min/max for ages, and
                  required fields.
                </p>
              </div>

              <div className="glass-panel p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-xl">2</span>
                </div>
                <h3 className="text-lg font-medium mb-2">
                  Create Complex Types
                </h3>
                <p className="text-muted-foreground text-sm">
                  Build product catalogs with nested objects for variants,
                  arrays for tags, and enums for predefined categories or status
                  values.
                </p>
              </div>

              <div className="glass-panel p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-xl">3</span>
                </div>
                <h3 className="text-lg font-medium mb-2">Use Your Schema</h3>
                <p className="text-muted-foreground text-sm">
                  Export for form validation in React Hook Form, API
                  documentation with OpenAPI, or backend validation with
                  libraries like Ajv.
                </p>
              </div>
            </div>

            {/* Use Case Examples */}
            <div className="mt-10 grid md:grid-cols-2 gap-6 animate-in">
              <div className="glass-panel p-6">
                <h3 className="text-lg font-medium mb-2">API Development</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Define request/response schemas for endpoints like{" "}
                  <code>/api/users</code> to ensure proper data validation and
                  consistent API documentation.
                </p>
                <div className="text-xs bg-muted/50 p-2 rounded text-left overflow-x-auto">
                  {`{
  "type": "object",
  "properties": {
    "username": { "type": "string", "minLength": 3 },
    "email": { "type": "string", "format": "email" }
  },
  "required": ["username", "email"]
}`}
                </div>
              </div>

              <div className="glass-panel p-6">
                <h3 className="text-lg font-medium mb-2">Form Validation</h3>
                <p className="text-muted-foreground text-sm mb-3">
                  Create schemas for checkout forms with shipping details,
                  payment information, and order specifics - all with proper
                  validation rules.
                </p>
                <div className="text-xs text-wrap bg-muted/50 p-2 rounded text-left overflow-x-auto">
                  {JSON.stringify(
                    {
                      type: "object",
                      properties: {
                        zipCode: { type: "string", pattern: "^\\d{5}$" },
                      },
                      paymentMethod: {
                        type: "string",
                        enum: ["credit", "paypal"],
                      },
                    },
                    null,
                    2,
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-16 text-center text-sm text-muted-foreground">
              <p>
                Built with simplicity in mind. Design beautiful data structures
                without technical knowledge.
              </p>
            </div>

            {/* Tools Section */}
            <div className="mt-12 animate-in">
              <h2 className="text-2xl font-bold text-center mb-6">
                Ecosystem & Tools
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Form Generation",
                    links: [
                      {
                        url: "https://github.com/rjsf-team/react-jsonschema-form?tab=readme-ov-file#react-jsonschema-form",
                        name: "React JSON Schema Form",
                        description: "Build forms from schemas",
                      },
                      {
                        url: "https://jsonforms.io/",
                        name: "JSON Forms",
                        description: "Framework-agnostic form generation",
                      },
                    ],
                  },
                  {
                    title: "Validation Libraries",
                    links: [
                      {
                        url: "https://ajv.js.org/",
                        name: "Ajv",
                        description: "The fastest JSON Schema validator",
                      },
                      {
                        url: "https://python-jsonschema.readthedocs.io/",
                        name: "jsonschema",
                        description: "Python validation library",
                      },
                    ],
                  },
                  {
                    title: "Documentation",
                    links: [
                      {
                        url: "https://www.openapis.org/",
                        name: "OpenAPI",
                        description: "API docs with JSON Schema",
                      },
                      {
                        url: "https://redocly.com/",
                        name: "Redoc",
                        description: "Interactive API documentation",
                      },
                    ],
                  },
                  {
                    title: "IDE Support",
                    links: [
                      {
                        url: "https://code.visualstudio.com/docs/languages/json#_json-schemas-and-settings",
                        name: "VS Code",
                        description: "Built-in schema validation",
                      },
                      {
                        url: "https://www.jetbrains.com/help/idea/json.html#ws_json_using_schemas",
                        name: "JetBrains Idea",
                        description: "Schema-aware completions",
                      },
                    ],
                  },
                  {
                    title: "API Integration",
                    links: [
                      {
                        url: "https://www.postman.com/",
                        name: "Postman",
                        description: "Test APIs with schema validation",
                      },
                      {
                        url: "https://swagger.io/",
                        name: "Swagger",
                        description: "Design and document APIs",
                      },
                    ],
                  },
                  {
                    title: "Data Processing",
                    links: [
                      {
                        url: "https://github.com/json-schema-faker/json-schema-faker",
                        name: "json-schema-faker",
                        description: "Generate mock data",
                      },
                      {
                        url: "https://quicktype.io/",
                        name: "QuickType",
                        description: "Generate code from schema",
                      },
                    ],
                  },
                ].map((section) => (
                  <div key={section.title} className="glass-panel p-4">
                    <h3 className="text-md font-medium mb-2">
                      {section.title}
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      {section.links.map((link) => (
                        <li key={link.url} className="flex items-start">
                          <span className="text-primary mr-2">•</span>
                          <span>
                            <strong>
                              <a
                                href={link.url}
                                target="_blank"
                                rel="nofollow noopener noreferrer"
                              >
                                {link.name}
                              </a>
                            </strong>
                            {" - "}
                            {link.description}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <a
                  href="https://json-schema.org/tools"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  Explore more JSON Schema tools →
                </a>
              </div>
            </div>

            {/* Author Footer */}
            <div className="mt-16 py-4 border-t border-border/30 backdrop-blur-xs">
              <div className="flex items-center justify-center gap-2 text-sm">
                <span className="text-muted-foreground">Built by</span>
                <a
                  href="https://ophir.dev"
                  className="font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                >
                  <span>@ophir.dev</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3.5 h-3.5 opacity-70"
                  >
                    <title>External link</title>
                    <path
                      fillRule="evenodd"
                      d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <span className="mx-1">•</span>
                <a
                  href="https://github.com/lovasoa/jsonjoy-builder"
                  className="font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                  target="_blank"
                  rel="nofollow noopener noreferrer"
                >
                  <span>GitHub</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3.5 h-3.5 opacity-70"
                  >
                    <title>GitHub repository</title>
                    <path
                      fillRule="evenodd"
                      d="M5.22 14.78a.75.75 0 001.06 0l7.22-7.22v5.69a.75.75 0 001.5 0v-7.5a.75.75 0 00-.75-.75h-7.5a.75.75 0 000 1.5h5.69l-7.22 7.22a.75.75 0 000 1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TranslationContext>
  );
};

export default Index;
