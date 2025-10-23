/**
 * Unevaluated Properties Editor Component
 * Provides UI for JSON Schema unevaluatedProperties
 * Enhanced in JSON Schema Draft 2020-12
 */

import { type FC, useState } from "react";
import { Label } from "../../components/ui/label.tsx";
import { Switch } from "../../components/ui/switch.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs.tsx";
import { useTranslation } from "../../hooks/use-translation.ts";
import type { JSONSchema } from "../../types/jsonSchema.ts";
import { asObjectSchema } from "../../types/jsonSchema.ts";
import type { JSONSchemaDraft } from "../../utils/schema-version.ts";
import JsonSchemaVisualizer from "../SchemaEditor/JsonSchemaVisualizer.tsx";
import SchemaVisualEditor from "../SchemaEditor/SchemaVisualEditor.tsx";

export interface UnevaluatedPropertiesEditorProps {
  schema: JSONSchema;
  onChange: (schema: JSONSchema) => void;
  draft?: JSONSchemaDraft;
}

/**
 * UnevaluatedPropertiesEditor Component
 * Controls validation of properties not explicitly evaluated by other keywords
 */
const UnevaluatedPropertiesEditor: FC<UnevaluatedPropertiesEditorProps> = ({
  schema,
  onChange,
  draft,
}) => {
  const t = useTranslation();
  const [editMode, setEditMode] = useState<'visual' | 'json'>('visual');
  const objSchema = asObjectSchema(schema);
  const unevaluatedProps = objSchema.unevaluatedProperties;
  const isDisabled = unevaluatedProps === false;
  const hasSchema = typeof unevaluatedProps === "object";

  const handleToggle = (enabled: boolean) => {
    if (enabled) {
      // Enable with empty schema
      onChange({
        ...objSchema,
        unevaluatedProperties: {},
      });
    } else {
      // Disable (set to false)
      onChange({
        ...objSchema,
        unevaluatedProperties: false,
      });
    }
  };

  const handleSchemaChange = (newSchema: JSONSchema) => {
    onChange({
      ...objSchema,
      unevaluatedProperties: newSchema,
    });
  };

  const handleRemove = () => {
    const newSchema = { ...objSchema };
    delete newSchema.unevaluatedProperties;
    onChange(newSchema);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <div>
        <h4 className="text-sm font-semibold">{t.unevaluatedPropsTitle}</h4>
        <p className="text-xs text-muted-foreground mt-1">
          {t.unevaluatedPropsDescription}
        </p>
      </div>

      {/* Enable/Disable toggle */}
      <div className="flex items-center justify-between">
        <div className="space-y-1 flex-1">
          <Label className="text-xs font-medium">
            {isDisabled ? t.unevaluatedPropsForbid : t.unevaluatedPropsAllow}
          </Label>
          <p className="text-xs text-muted-foreground">
            {isDisabled
              ? t.unevaluatedPropsNoAdditional
              : t.unevaluatedPropsAdditionalAllowed}
          </p>
        </div>
        <Switch checked={!isDisabled} onCheckedChange={(checked) => handleToggle(checked)} />
      </div>

      {/* Schema editor (only shown when not disabled) */}
      {hasSchema && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">
            {t.unevaluatedPropsSchema}
          </Label>
          <Tabs value={editMode} onValueChange={(v) => setEditMode(v as 'visual' | 'json')} className="w-full">
            <TabsList className="grid grid-cols-2 w-[200px] mb-2">
              <TabsTrigger value="visual" className="text-xs">Visual</TabsTrigger>
              <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
            </TabsList>
            <TabsContent value="visual" className="border rounded-md p-3 bg-background">
              <SchemaVisualEditor
                schema={unevaluatedProps}
                onChange={handleSchemaChange}
                draft={draft}
              />
            </TabsContent>
            <TabsContent value="json" className="border rounded-md p-3 bg-background h-64">
              <JsonSchemaVisualizer
                schema={unevaluatedProps}
                onChange={handleSchemaChange}
              />
            </TabsContent>
          </Tabs>
          <p className="text-xs text-muted-foreground italic">
            {t.unevaluatedPropsSchemaHint}
          </p>
        </div>
      )}

      {/* Remove button */}
      {unevaluatedProps !== undefined && (
        <button
          type="button"
          onClick={handleRemove}
          className="text-xs text-destructive hover:underline"
        >
          {t.unevaluatedPropsRemove}
        </button>
      )}

      {/* Info box */}
      <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
        <p className="text-xs text-green-900 dark:text-green-100 font-medium mb-1">
          {t.unevaluatedPropsInfoTitle}
        </p>
        <p className="text-xs text-green-800 dark:text-green-200">
          {t.unevaluatedPropsInfoDescription}
        </p>
        <p className="text-xs text-green-700 dark:text-green-300 mt-2">
          {t.unevaluatedPropsInfoExample}
        </p>
      </div>

      {unevaluatedProps === undefined && (
        <div className="text-xs text-muted-foreground italic pt-2 border-t">
          {t.unevaluatedPropsNoConstraint}
        </div>
      )}
    </div>
  );
};

export default UnevaluatedPropertiesEditor;