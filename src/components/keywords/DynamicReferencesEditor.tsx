/**
 * Dynamic References Editor Component
 * Provides UI for JSON Schema $dynamicRef and $dynamicAnchor
 * New in JSON Schema Draft 2020-12
 */

import type { FC } from "react";
import { Input } from "../../components/ui/input.tsx";
import { Label } from "../../components/ui/label.tsx";
import { useTranslation } from "../../hooks/use-translation.ts";
import type { JSONSchema } from "../../types/jsonSchema.ts";
import { asObjectSchema } from "../../types/jsonSchema.ts";

export interface DynamicReferencesEditorProps {
  schema: JSONSchema;
  onChange: (schema: JSONSchema) => void;
}

/**
 * DynamicReferencesEditor Component
 * Allows editing $dynamicRef and $dynamicAnchor for advanced schema composition
 */
const DynamicReferencesEditor: FC<DynamicReferencesEditorProps> = ({
  schema,
  onChange,
}) => {
  const t = useTranslation();
  const objSchema = asObjectSchema(schema);

  const handleDynamicAnchorChange = (value: string) => {
    onChange({
      ...objSchema,
      $dynamicAnchor: value || undefined,
    });
  };

  const handleDynamicRefChange = (value: string) => {
    onChange({
      ...objSchema,
      $dynamicRef: value || undefined,
    });
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
      <div>
        <h4 className="text-sm font-semibold">{t.dynamicRefsTitle}</h4>
        <p className="text-xs text-muted-foreground mt-1">
          {t.dynamicRefsDescription}
        </p>
      </div>

      {/* Dynamic Anchor */}
      <div className="space-y-2">
        <Label htmlFor="dynamic-anchor" className="text-xs font-medium">
          {t.dynamicAnchorLabel}
        </Label>
        <Input
          id="dynamic-anchor"
          type="text"
          value={objSchema.$dynamicAnchor || ""}
          onChange={(e) => handleDynamicAnchorChange(e.target.value)}
          placeholder={t.dynamicAnchorPlaceholder}
          className="h-8"
        />
        <p className="text-xs text-muted-foreground italic">
          {t.dynamicAnchorHint}
        </p>
      </div>

      {/* Dynamic Reference */}
      <div className="space-y-2">
        <Label htmlFor="dynamic-ref" className="text-xs font-medium">
          {t.dynamicRefLabel}
        </Label>
        <Input
          id="dynamic-ref"
          type="text"
          value={objSchema.$dynamicRef || ""}
          onChange={(e) => handleDynamicRefChange(e.target.value)}
          placeholder={t.dynamicRefPlaceholder}
          className="h-8"
        />
        <p className="text-xs text-muted-foreground italic">
          {t.dynamicRefHint}
        </p>
      </div>

      {/* Info box */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-md">
        <p className="text-xs text-blue-900 dark:text-blue-100 font-medium mb-1">
          {t.dynamicRefsInfoTitle}
        </p>
        <p className="text-xs text-blue-800 dark:text-blue-200">
          {t.dynamicRefsInfoDescription}
        </p>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-2">
          <strong>{t.dynamicRefsInfoExample.split(":")[0]}:</strong> {t.dynamicRefsInfoExample.split(": ")[1]}
        </p>
      </div>

      {/* Migration note */}
      {(objSchema.$dynamicRef || objSchema.$dynamicAnchor) && (
        <div className="text-xs text-muted-foreground italic pt-2 border-t">
          {t.dynamicRefsMigrationNote}
        </div>
      )}
    </div>
  );
};

export default DynamicReferencesEditor;