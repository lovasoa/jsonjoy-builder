/**
 * Unevaluated Items Editor Component
 * Provides UI for JSON Schema unevaluatedItems
 * Enhanced in JSON Schema Draft 2020-12
 */

import { type FC, useState } from "react";
import { Label } from "../../components/ui/label.tsx";
import { Switch } from "../../components/ui/switch.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs.tsx";
import { useTranslation } from "../../hooks/use-translation.ts";
import type { JSONSchema } from "../../types/jsonSchema.ts";
import { asObjectSchema } from "../../types/jsonSchema.ts";
import JsonSchemaVisualizer from "../SchemaEditor/JsonSchemaVisualizer.tsx";
import SchemaVisualEditor from "../SchemaEditor/SchemaVisualEditor.tsx";

export interface UnevaluatedItemsEditorProps {
  schema: JSONSchema;
  onChange: (schema: JSONSchema) => void;
  draft?: string;
}

/**
 * UnevaluatedItemsEditor Component
 * Controls validation of array items not explicitly evaluated by other keywords
 */
const UnevaluatedItemsEditor: FC<UnevaluatedItemsEditorProps> = ({
  schema,
  onChange,
  draft,
}) => {
  const t = useTranslation();
  const [editMode, setEditMode] = useState<'visual' | 'json'>('visual');
  const objSchema = asObjectSchema(schema);
  const unevaluatedItems = objSchema.unevaluatedItems;
  const isDisabled = unevaluatedItems === false;
  const hasSchema = typeof unevaluatedItems === "object";

  const handleToggle = (enabled: boolean) => {
    if (enabled) {
      // Enable with empty schema
      onChange({
        ...objSchema,
        type: "array",
        unevaluatedItems: {},
      });
    } else {
      // Disable (set to false)
      onChange({
        ...objSchema,
        type: "array",
        unevaluatedItems: false,
      });
    }
  };

  const handleSchemaChange = (newSchema: JSONSchema) => {
    onChange({
      ...objSchema,
      type: "array",
      unevaluatedItems: newSchema,
    });
  };

  const handleRemove = () => {
    const newSchema = { ...objSchema };
    delete newSchema.unevaluatedItems;
    onChange(newSchema);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <div>
        <h4 className="text-sm font-semibold">{t.unevaluatedItemsTitle}</h4>
        <p className="text-xs text-muted-foreground mt-1">
          {t.unevaluatedItemsDescription}
        </p>
      </div>

      {/* Enable/Disable toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-1 flex-1">
          <Label className="text-xs font-medium">
            {isDisabled ? t.unevaluatedItemsForbid : t.unevaluatedItemsAllow}
          </Label>
          <p className="text-xs text-muted-foreground">
            {isDisabled
              ? t.unevaluatedItemsNoAdditional
              : t.unevaluatedItemsAdditionalAllowed}
          </p>
        </div>
        <Switch checked={!isDisabled} onCheckedChange={(checked) => handleToggle(checked)} />
      </div>

      {/* Schema editor (only shown when not disabled) */}
      {hasSchema && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            {t.unevaluatedItemsSchema}
          </Label>
          <Tabs value={editMode} onValueChange={(v) => setEditMode(v as 'visual' | 'json')} className="w-full">
            <TabsList className="grid grid-cols-2 w-[200px] mb-2">
              <TabsTrigger value="visual" className="text-xs">Visual</TabsTrigger>
              <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
            </TabsList>
            <TabsContent value="visual" className="border rounded-md p-3 bg-background">
              <SchemaVisualEditor
                schema={unevaluatedItems}
                onChange={handleSchemaChange}
                draft={draft}
              />
            </TabsContent>
            <TabsContent value="json" className="border rounded-md p-3 bg-background h-64">
              <JsonSchemaVisualizer
                schema={unevaluatedItems}
                onChange={handleSchemaChange}
              />
            </TabsContent>
          </Tabs>
          <p className="text-xs text-muted-foreground italic">
            {t.unevaluatedItemsSchemaHint}
          </p>
        </div>
      )}

      {/* Remove button */}
      {unevaluatedItems !== undefined && (
        <button
          type="button"
          onClick={handleRemove}
          className="text-xs text-destructive hover:underline"
        >
          {t.unevaluatedItemsRemove}
        </button>
      )}

      {/* Info box */}
      <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
        <p className="text-xs text-green-900 dark:text-green-100 font-medium mb-1">
          {t.unevaluatedItemsInfoTitle}
        </p>
        <p className="text-xs text-green-800 dark:text-green-200">
          {t.unevaluatedItemsInfoDescription}
        </p>
        <p className="text-xs text-green-700 dark:text-green-300 mt-2">
          {t.unevaluatedItemsInfoExample}
        </p>
      </div>

      {unevaluatedItems === undefined && (
        <div className="text-xs text-muted-foreground italic pt-2 border-t">
          {t.unevaluatedItemsNoConstraint}
        </div>
      )}
    </div>
  );
};

export default UnevaluatedItemsEditor;