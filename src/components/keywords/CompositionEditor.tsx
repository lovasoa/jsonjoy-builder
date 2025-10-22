/**
 * Composition Editor Component
 * Provides UI for JSON Schema composition keywords: allOf, anyOf, oneOf, not
 * Supported in all JSON Schema drafts
 */

import { Plus, X } from "lucide-react";
import { type FC, useState } from "react";
import { Button } from "../../components/ui/button.tsx";
import { Label } from "../../components/ui/label.tsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs.tsx";
import { useTranslation } from "../../hooks/use-translation.ts";
import type { JSONSchema } from "../../types/jsonSchema.ts";
import { asObjectSchema } from "../../types/jsonSchema.ts";
import JsonSchemaVisualizer from "../SchemaEditor/JsonSchemaVisualizer.tsx";
import SchemaVisualEditor from "../SchemaEditor/SchemaVisualEditor.tsx";

export interface CompositionEditorProps {
  schema: JSONSchema;
  onChange: (schema: JSONSchema) => void;
  draft?: string;
}

type CompositionType = "allOf" | "anyOf" | "oneOf" | "not";

/**
 * CompositionEditor Component
 * Allows editing schema composition with allOf, anyOf, oneOf, and not
 */
const CompositionEditor: FC<CompositionEditorProps> = ({ schema, onChange, draft }) => {
  const t = useTranslation();
  const [editMode, setEditMode] = useState<'visual' | 'json'>('visual');
  const objSchema = asObjectSchema(schema);

  const allOf = objSchema.allOf || [];
  const anyOf = objSchema.anyOf || [];
  const oneOf = objSchema.oneOf || [];
  const notSchema = objSchema.not;

  const handleAddCompositionSchema = (type: "allOf" | "anyOf" | "oneOf") => {
    const currentArray = objSchema[type] || [];
    onChange({
      ...objSchema,
      [type]: [...currentArray, { type: "object" }],
    });
  };

  const handleRemoveCompositionSchema = (
    type: "allOf" | "anyOf" | "oneOf",
    index: number,
  ) => {
    const currentArray = objSchema[type] || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    onChange({
      ...objSchema,
      [type]: newArray.length > 0 ? newArray : undefined,
    });
  };

  const handleCompositionSchemaChange = (
    type: "allOf" | "anyOf" | "oneOf",
    index: number,
    newSchema: JSONSchema,
  ) => {
    const currentArray = objSchema[type] || [];
    const newArray = [...currentArray];
    newArray[index] = newSchema;
    onChange({
      ...objSchema,
      [type]: newArray,
    });
  };

  const handleNotSchemaChange = (newSchema: JSONSchema) => {
    onChange({
      ...objSchema,
      not: newSchema,
    });
  };

  const handleRemoveNot = () => {
    const newSchema = { ...objSchema };
    delete newSchema.not;
    onChange(newSchema);
  };

  const renderCompositionArray = (
    type: "allOf" | "anyOf" | "oneOf",
    array: JSONSchema[],
    title: string,
    description: string,
  ) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-xs font-medium uppercase">{title}</Label>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
        <Button
          onClick={() => handleAddCompositionSchema(type)}
          variant="outline"
          size="sm"
          className="h-7"
        >
          <Plus size={14} className="mr-1" />
          {t.compositionAddSchema}
        </Button>
      </div>

      {array.length > 0 ? (
        <div className="space-y-2">
          {array.map((itemSchema, index) => (
            <div key={`${type}-${index}`} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {t.compositionSchemaNumber.replace("{number}", String(index + 1))}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCompositionSchema(type, index)}
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
                <TabsContent value="visual" className="border rounded-md p-2 bg-background">
                  <SchemaVisualEditor
                    schema={itemSchema}
                    onChange={(newSchema) => handleCompositionSchemaChange(type, index, newSchema)}
                    draft={draft}
                  />
                </TabsContent>
                <TabsContent value="json" className="border rounded-md p-2 bg-background h-64">
                  <JsonSchemaVisualizer
                    schema={itemSchema}
                    onChange={(newSchema) => handleCompositionSchemaChange(type, index, newSchema)}
                  />
                </TabsContent>
              </Tabs>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-4 text-muted-foreground text-xs border border-dashed rounded-md">
          {t.compositionNoSchemas.replace("{type}", type)}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6 p-4 border rounded-lg bg-muted/20">
      <div>
        <h4 className="text-sm font-semibold">{t.compositionTitle}</h4>
        <p className="text-xs text-muted-foreground mt-1">
          {t.compositionDescription}
        </p>
      </div>

      {/* allOf */}
      {renderCompositionArray(
        "allOf",
        allOf,
        t.compositionAllOfLabel,
        t.compositionAllOfDescription,
      )}

      {/* anyOf */}
      {renderCompositionArray(
        "anyOf",
        anyOf,
        t.compositionAnyOfLabel,
        t.compositionAnyOfDescription,
      )}

      {/* oneOf */}
      {renderCompositionArray(
        "oneOf",
        oneOf,
        t.compositionOneOfLabel,
        t.compositionOneOfDescription,
      )}

      {/* not */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs font-medium uppercase">{t.compositionNotLabel}</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              {t.compositionNotDescription}
            </p>
          </div>
          {notSchema && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveNot}
              className="h-6 text-xs"
            >
              <X size={12} className="mr-1" />
              {t.remove}
            </Button>
          )}
        </div>

        {notSchema ? (
          <Tabs value={editMode} onValueChange={(v) => setEditMode(v as 'visual' | 'json')} className="w-full">
            <TabsList className="grid grid-cols-2 w-[200px] mb-2">
              <TabsTrigger value="visual" className="text-xs">Visual</TabsTrigger>
              <TabsTrigger value="json" className="text-xs">JSON</TabsTrigger>
            </TabsList>
            <TabsContent value="visual" className="border rounded-md p-2 bg-background">
              <SchemaVisualEditor
                schema={notSchema}
                onChange={handleNotSchemaChange}
                draft={draft}
              />
            </TabsContent>
            <TabsContent value="json" className="border rounded-md p-2 bg-background h-64">
              <JsonSchemaVisualizer
                schema={notSchema}
                onChange={handleNotSchemaChange}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <Button
            onClick={() => handleNotSchemaChange({ type: "object" })}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {t.compositionAddNot}
          </Button>
        )}
      </div>

      {/* Info box */}
      <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-md">
        <p className="text-xs text-purple-900 dark:text-purple-100 font-medium mb-1">
          {t.compositionInfoTitle}
        </p>
        <ul className="text-xs text-purple-800 dark:text-purple-200 space-y-1">
          <li>{t.compositionInfoAllOf}</li>
          <li>{t.compositionInfoAnyOf}</li>
          <li>{t.compositionInfoOneOf}</li>
          <li>{t.compositionInfoNot}</li>
        </ul>
      </div>
    </div>
  );
};

export default CompositionEditor;