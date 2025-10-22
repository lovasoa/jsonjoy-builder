/**
 * Prefix Items Editor Component
 * Provides UI for JSON Schema prefixItems (tuple validation)
 * New in JSON Schema Draft 2020-12
 */

import { Plus, X } from "lucide-react";
import { type FC, useState } from "react";
import { Button } from "../../components/ui/button.tsx";
import { Label } from "../../components/ui/label.tsx";
import { Switch } from "../../components/ui/switch.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs.tsx";
import { useTranslation } from "../../hooks/use-translation.ts";
import type { JSONSchema } from "../../types/jsonSchema.ts";
import { asObjectSchema } from "../../types/jsonSchema.ts";
import JsonSchemaVisualizer from "../SchemaEditor/JsonSchemaVisualizer.tsx";
import SchemaVisualEditor from "../SchemaEditor/SchemaVisualEditor.tsx";

export interface PrefixItemsEditorProps {
  schema: JSONSchema;
  onChange: (schema: JSONSchema) => void;
  draft?: string;
}

/**
 * PrefixItemsEditor Component  
 * Allows editing tuple validation with prefixItems
 */
const PrefixItemsEditor: FC<PrefixItemsEditorProps> = ({ schema, onChange, draft }) => {
  const t = useTranslation();
  const [editMode, setEditMode] = useState<'visual' | 'json'>('visual');
  const objSchema = asObjectSchema(schema);
  const prefixItems = objSchema.prefixItems || [];
  const itemsIsBoolean = typeof objSchema.items === "boolean";
  const itemsValue = objSchema.items;

  const handleAddTuplePosition = () => {
    const newPrefixItems = [...prefixItems, { type: "string" }];
    onChange({
      ...objSchema,
      type: "array",
      prefixItems: newPrefixItems,
    });
  };

  const handleRemoveTuplePosition = (index: number) => {
    const newPrefixItems = prefixItems.filter((_, i) => i !== index);
    onChange({
      ...objSchema,
      type: "array",
      prefixItems: newPrefixItems.length > 0 ? newPrefixItems : undefined,
    });
  };

  const handleTuplePositionChange = (index: number, newSchema: JSONSchema) => {
    const newPrefixItems = [...prefixItems];
    newPrefixItems[index] = newSchema;
    onChange({
      ...objSchema,
      type: "array",
      prefixItems: newPrefixItems,
    });
  };

  const handleItemsToggle = (allowAdditional: boolean) => {
    onChange({
      ...objSchema,
      type: "array",
      items: allowAdditional ? {} : false,
    });
  };

  const handleItemsSchemaChange = (newItemsSchema: JSONSchema) => {
    onChange({
      ...objSchema,
      type: "array",
      items: newItemsSchema,
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-semibold">{t.prefixItemsTitle}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {t.prefixItemsDescription}
          </p>
        </div>
        <Button
          onClick={handleAddTuplePosition}
          variant="outline"
          size="sm"
          className="h-7"
        >
          <Plus size={14} className="mr-1" />
          {t.prefixItemsAddPosition}
        </Button>
      </div>

      {prefixItems.length > 0 ? (
        <div className="space-y-3">
          {prefixItems.map((itemSchema, index) => (
            <div key={`prefix-${index}`} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground">
                  {t.prefixItemsPositionLabel.replace("{index}", String(index))}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveTuplePosition(index)}
                  className="h-6 text-xs"
                >
                  <X size={12} className="mr-1" />
                  {t.remove}
                </Button>
              </div>
              <Tabs value={editMode} onValueChange={(v) => setEditMode(v as 'visual' | 'json')} className="w-full">
                <TabsList className="grid grid-cols-2 w-[200px] mb-2">
                  <TabsTrigger value="visual" className="text-xs">Visual</TabsTrigger>
                  <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
                </TabsList>
                <TabsContent value="visual" className="border rounded-md p-3 bg-background">
                  <SchemaVisualEditor
                    schema={itemSchema}
                    onChange={(newSchema) => handleTuplePositionChange(index, newSchema)}
                    draft={draft}
                  />
                </TabsContent>
                <TabsContent value="json" className="border rounded-md p-3 bg-background h-64">
                  <JsonSchemaVisualizer
                    schema={itemSchema}
                    onChange={(newSchema) => handleTuplePositionChange(index, newSchema)}
                  />
                </TabsContent>
              </Tabs>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-md">
          <p className="mb-2">{t.prefixItemsNoPositions}</p>
          <p className="text-xs">
            {t.prefixItemsNoPositionsHint}
          </p>
        </div>
      )}

      {/* Additional items control */}
      {prefixItems.length > 0 && (
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-xs font-medium">
                {t.prefixItemsAllowAdditional}
              </Label>
              <p className="text-xs text-muted-foreground">
                {t.prefixItemsAllowAdditionalHint}
              </p>
            </div>
            <Switch
              checked={itemsValue !== false}
              onCheckedChange={handleItemsToggle}
            />
          </div>

          {itemsValue !== false && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">
                {t.prefixItemsAdditionalSchema}
              </Label>
              <Tabs value={editMode} onValueChange={(v) => setEditMode(v as 'visual' | 'json')} className="w-full">
                <TabsList className="grid grid-cols-2 w-[200px] mb-2">
                  <TabsTrigger value="visual" className="text-xs">Visual</TabsTrigger>
                  <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
                </TabsList>
                <TabsContent value="visual" className="border rounded-md p-3 bg-background">
                  <SchemaVisualEditor
                    schema={typeof itemsValue === "object" ? itemsValue : {}}
                    onChange={handleItemsSchemaChange}
                    draft={draft}
                  />
                </TabsContent>
                <TabsContent value="json" className="border rounded-md p-3 bg-background h-64">
                  <JsonSchemaVisualizer
                    schema={typeof itemsValue === "object" ? itemsValue : {}}
                    onChange={handleItemsSchemaChange}
                  />
                </TabsContent>
              </Tabs>
              <p className="text-xs text-muted-foreground italic">
                {t.prefixItemsAdditionalSchemaHint.replace("{count}", String(prefixItems.length - 1))}
              </p>
            </div>
          )}
        </div>
      )}

      {prefixItems.length === 0 && (
        <div className="text-xs text-muted-foreground italic pt-2">
          {t.prefixItemsTip}
        </div>
      )}
    </div>
  );
};

export default PrefixItemsEditor;