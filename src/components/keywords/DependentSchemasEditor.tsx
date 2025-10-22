/**
 * Dependent Schemas Editor Component
 * Provides UI for JSON Schema dependentSchemas
 * Supported in JSON Schema Draft 2020-12 and 2019-09
 */

import { Plus, X } from "lucide-react";
import { type FC, useState } from "react";
import { Button } from "../../components/ui/button.tsx";
import { Input } from "../../components/ui/input.tsx";
import { Label } from "../../components/ui/label.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs.tsx";
import { useTranslation } from "../../hooks/use-translation.ts";
import type { JSONSchema } from "../../types/jsonSchema.ts";
import { asObjectSchema } from "../../types/jsonSchema.ts";
import JsonSchemaVisualizer from "../SchemaEditor/JsonSchemaVisualizer.tsx";
import SchemaVisualEditor from "../SchemaEditor/SchemaVisualEditor.tsx";

export interface DependentSchemasEditorProps {
  schema: JSONSchema;
  onChange: (schema: JSONSchema) => void;
  draft?: string;
}

/**
 * DependentSchemasEditor Component
 * Allows editing property-dependent schema validation
 */
const DependentSchemasEditor: FC<DependentSchemasEditorProps> = ({
  schema,
  onChange,
  draft,
}) => {
  const t = useTranslation();
  const [editMode, setEditMode] = useState<'visual' | 'json'>('visual');
  const objSchema = asObjectSchema(schema);
  const [newPropertyName, setNewPropertyName] = useState("");

  const dependentSchemas = objSchema.dependentSchemas || {};

  const handleAddDependentSchema = () => {
    if (!newPropertyName.trim()) return;

    // Check if property already exists
    if (dependentSchemas[newPropertyName]) {
      return;
    }

    onChange({
      ...objSchema,
      dependentSchemas: {
        ...dependentSchemas,
        [newPropertyName]: { type: "object" },
      },
    });
    setNewPropertyName("");
  };

  const handleRemoveDependentSchema = (propertyName: string) => {
    const newDependentSchemas = { ...dependentSchemas };
    delete newDependentSchemas[propertyName];

    onChange({
      ...objSchema,
      dependentSchemas:
        Object.keys(newDependentSchemas).length > 0
          ? newDependentSchemas
          : undefined,
    });
  };

  const handleDependentSchemaChange = (
    propertyName: string,
    newSchema: JSONSchema,
  ) => {
    onChange({
      ...objSchema,
      dependentSchemas: {
        ...dependentSchemas,
        [propertyName]: newSchema,
      },
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <div>
        <h4 className="text-sm font-semibold">{t.dependentSchemasTitle}</h4>
        <p className="text-xs text-muted-foreground mt-1">
          {t.dependentSchemasDescription}
        </p>
      </div>

      {Object.keys(dependentSchemas).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(dependentSchemas).map(([propName, depSchema]) => (
            <div key={`dep-schema-${propName}`} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">
                  {t.dependentSchemasWhenPresent.replace("{property}", "")} <code className="bg-muted px-1 py-0.5 rounded">{propName}</code> {t.dependentSchemasWhenPresent.includes("is present") ? "" : ""}
                </Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveDependentSchema(propName)}
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
                    schema={depSchema}
                    onChange={(newSchema) => handleDependentSchemaChange(propName, newSchema)}
                    draft={draft}
                  />
                </TabsContent>
                <TabsContent value="json" className="border rounded-md p-3 bg-background h-64">
                  <JsonSchemaVisualizer
                    schema={depSchema}
                    onChange={(newSchema) => handleDependentSchemaChange(propName, newSchema)}
                  />
                </TabsContent>
              </Tabs>
              <p className="text-xs text-muted-foreground italic">
                {t.dependentSchemasAppliesWhen.replace("{property}", propName)}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-md">
          <p className="mb-2">{t.dependentSchemasNone}</p>
          <p className="text-xs">
            {t.dependentSchemasNoneHint}
          </p>
        </div>
      )}

      {/* Add new dependent schema */}
      <div className="pt-4 border-t space-y-2">
        <Label className="text-xs font-medium">{t.dependentSchemasAddLabel}</Label>
        <div className="flex items-center gap-2">
          <Input
            type="text"
            value={newPropertyName}
            onChange={(e) => setNewPropertyName(e.target.value)}
            placeholder={t.dependentSchemasPropertyPlaceholder}
            className="h-8 flex-1"
            onKeyDown={(e) => e.key === "Enter" && handleAddDependentSchema()}
          />
          <Button
            onClick={handleAddDependentSchema}
            variant="secondary"
            size="sm"
            disabled={!newPropertyName.trim()}
            className="h-8"
          >
            <Plus size={14} className="mr-1" />
            {t.add}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground italic">
          {t.dependentSchemasPropertyHint}
        </p>
      </div>

      {/* Example box */}
      <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-md">
        <p className="text-xs text-amber-900 dark:text-amber-100 font-medium mb-1">
          {t.dependentSchemasExampleTitle}
        </p>
        <p className="text-xs text-amber-800 dark:text-amber-200">
          {t.dependentSchemasExampleText}
        </p>
      </div>
    </div>
  );
};

export default DependentSchemasEditor;