import JsonSchemaEditor from "@/components/SchemaEditor/JsonSchemaEditor";
import { SchemaInferencer } from "@/components/features/SchemaInferencer";
import { JsonValidator } from "@/components/features/JsonValidator";
import { exampleSchema } from "@/components/SchemaEditor/SchemaExample";
import { Button } from "@/components/ui/button";
import type { JSONSchema } from "@/types/jsonSchema";
import { CheckCircle, CirclePlus, Code, FileJson, RefreshCw } from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [schema, setSchema] = useState<JSONSchema>(exampleSchema);
  const [inferDialogOpen, setInferDialogOpen] = useState(false);
  const [validateDialogOpen, setValidateDialogOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 relative overflow-hidden">
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
              Create JSON Schemas <span className="text-primary">Visually</span>
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
            <Button variant="outline" onClick={handleInferSchema} className="gap-2">
              <Code size={16} />
              Infer from JSON
            </Button>
            <Button variant="outline" onClick={handleValidateJson} className="gap-2">
              <CheckCircle size={16} />
              Validate JSON
            </Button>
          </div>
        </div>

        {/* Schema Editor - full width on large screens */}
        <div className="max-w-4xl mx-auto lg:max-w-none">
          <JsonSchemaEditor
            schema={schema}
            setSchema={setSchema}
            className="shadow-lg animate-in border-border/50 backdrop-blur-sm"
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
              <h3 className="text-lg font-medium mb-2">Add Fields</h3>
              <p className="text-muted-foreground text-sm">
                Define your data structure by adding fields with just a few
                clicks
              </p>
            </div>

            <div className="glass-panel p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">2</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Organize</h3>
              <p className="text-muted-foreground text-sm">
                Group related fields and create nested structures easily
              </p>
            </div>

            <div className="glass-panel p-6">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-primary font-bold text-xl">3</span>
              </div>
              <h3 className="text-lg font-medium mb-2">Export</h3>
              <p className="text-muted-foreground text-sm">
                Get your JSON schema and use it in your application
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 text-center text-sm text-muted-foreground">
            <p>
              Built with simplicity in mind. Design beautiful data structures
              without technical knowledge.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
