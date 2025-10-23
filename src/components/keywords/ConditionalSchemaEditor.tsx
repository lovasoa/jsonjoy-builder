/**
 * Conditional Schema Editor Component
 * Provides UI for JSON Schema if/then/else conditional validation
 * Supports JSON Schema Draft-07 and later (including 2020-12)
 */

import { X } from "lucide-react";
import { type FC, useState } from "react";
import { Button } from "../../components/ui/button.tsx";
import { Label } from "../../components/ui/label.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs.tsx";
import { useTranslation } from "../../hooks/use-translation.ts";
import type { JSONSchema } from "../../types/jsonSchema.ts";
import { asObjectSchema } from "../../types/jsonSchema.ts";
import type { JSONSchemaDraft } from "../../utils/schema-version.ts";
import JsonSchemaVisualizer from "../SchemaEditor/JsonSchemaVisualizer.tsx";
import SchemaVisualEditor from "../SchemaEditor/SchemaVisualEditor.tsx";

export interface ConditionalSchemaEditorProps {
  schema: JSONSchema;
  onChange: (schema: JSONSchema) => void;
  draft?: JSONSchemaDraft;
}

/**
 * ConditionalSchemaEditor Component
 * Allows editing if/then/else conditional validation schemas
 */
const ConditionalSchemaEditor: FC<ConditionalSchemaEditorProps> = ({
  schema,
  onChange,
  draft,
}) => {
  const t = useTranslation();
  const [editMode, setEditMode] = useState<'visual' | 'json'>('visual');
  // Ensure we have an object schema to work with
  const objSchema = asObjectSchema(schema);

  const handleIfChange = (ifSchema: JSONSchema) => {
    onChange({
      ...objSchema,
      if: ifSchema,
    });
  };

  const handleThenChange = (thenSchema: JSONSchema) => {
    onChange({
      ...objSchema,
      then: thenSchema,
    });
  };

  const handleElseChange = (elseSchema: JSONSchema) => {
    onChange({
      ...objSchema,
      else: elseSchema,
    });
  };

  const removeConditional = (key: "if" | "then" | "else") => {
    const newSchema = { ...objSchema };
    delete newSchema[key];

    // If removing 'if', also remove 'then' and 'else' as they depend on 'if'
    if (key === "if") {
      delete newSchema.then;
      delete newSchema.else;
    }

    onChange(newSchema);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">{t.conditionalTitle}</h4>
        {objSchema.if && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeConditional("if")}
            className="h-7"
          >
            <X size={14} className="mr-1" />
            {t.conditionalRemoveAll}
          </Button>
        )}
      </div>

      {/* IF condition */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground uppercase">
            {t.conditionalIfLabel}
          </Label>
          {objSchema.if && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeConditional("if")}
              className="h-6 text-xs"
            >
              <X size={12} className="mr-1" />
              {t.remove}
            </Button>
          )}
        </div>
        {objSchema.if ? (
          <Tabs value={editMode} onValueChange={(v) => setEditMode(v as 'visual' | 'json')} className="w-full">
            <TabsList className="grid grid-cols-2 w-[200px] mb-2">
              <TabsTrigger value="visual" className="text-xs">Visual</TabsTrigger>
              <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
            </TabsList>
            <TabsContent value="visual" className="border rounded-md p-3 bg-background">
              <SchemaVisualEditor
                schema={objSchema.if}
                onChange={handleIfChange}
                draft={draft}
              />
            </TabsContent>
            <TabsContent value="json" className="border rounded-md p-3 bg-background h-64">
              <JsonSchemaVisualizer
                schema={objSchema.if}
                onChange={handleIfChange}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <Button
            onClick={() => handleIfChange({ type: "object" })}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {t.conditionalAddIf}
          </Button>
        )}
        {objSchema.if && (
          <p className="text-xs text-muted-foreground italic">
            {t.conditionalIfHint}
          </p>
        )}
      </div>

      {/* THEN consequence */}
      {objSchema.if && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground uppercase">
              {t.conditionalThenLabel}
            </Label>
            {objSchema.then && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeConditional("then")}
                className="h-6 text-xs"
              >
                <X size={12} className="mr-1" />
                {t.remove}
              </Button>
            )}
          </div>
          {objSchema.then ? (
            <Tabs value={editMode} onValueChange={(v) => setEditMode(v as 'visual' | 'json')} className="w-full">
              <TabsList className="grid grid-cols-2 w-[200px] mb-2">
                <TabsTrigger value="visual" className="text-xs">Visual</TabsTrigger>
                <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="visual" className="border rounded-md p-3 bg-background">
                <SchemaVisualEditor
                  schema={objSchema.then}
                  onChange={handleThenChange}
                  draft={draft}
                />
              </TabsContent>
              <TabsContent value="json" className="border rounded-md p-3 bg-background h-64">
                <JsonSchemaVisualizer
                  schema={objSchema.then}
                  onChange={handleThenChange}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <Button
              onClick={() => handleThenChange({ type: "object" })}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {t.conditionalAddThen}
            </Button>
          )}
          {objSchema.then && (
            <p className="text-xs text-muted-foreground italic">
              {t.conditionalThenHint}
            </p>
          )}
        </div>
      )}

      {/* ELSE alternative */}
      {objSchema.if && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground uppercase">
              {t.conditionalElseLabel}
            </Label>
            {objSchema.else && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeConditional("else")}
                className="h-6 text-xs"
              >
                <X size={12} className="mr-1" />
                {t.remove}
              </Button>
            )}
          </div>
          {objSchema.else ? (
            <Tabs value={editMode} onValueChange={(v) => setEditMode(v as 'visual' | 'json')} className="w-full">
              <TabsList className="grid grid-cols-2 w-[200px] mb-2">
                <TabsTrigger value="visual" className="text-xs">Visual</TabsTrigger>
                <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
              </TabsList>
              <TabsContent value="visual" className="border rounded-md p-3 bg-background">
                <SchemaVisualEditor
                  schema={objSchema.else}
                  onChange={handleElseChange}
                  draft={draft}
                />
              </TabsContent>
              <TabsContent value="json" className="border rounded-md p-3 bg-background h-64">
                <JsonSchemaVisualizer
                  schema={objSchema.else}
                  onChange={handleElseChange}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <Button
              onClick={() => handleElseChange({ type: "object" })}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {t.conditionalAddElse}
            </Button>
          )}
          {objSchema.else && (
            <p className="text-xs text-muted-foreground italic">
              {t.conditionalElseHint}
            </p>
          )}
        </div>
      )}

      {!objSchema.if && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          <p className="mb-2">{t.conditionalNoCondition}</p>
          <p className="text-xs">
            {t.conditionalNoConditionHint}
          </p>
        </div>
      )}
    </div>
  );
};

export default ConditionalSchemaEditor;