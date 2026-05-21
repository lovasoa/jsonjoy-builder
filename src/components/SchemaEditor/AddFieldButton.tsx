import { CirclePlus } from "lucide-react";
import { type FC, type FormEvent, useId, useState } from "react";
import { Badge } from "../../components/ui/badge.tsx";
import { Button } from "../../components/ui/button.tsx";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog.tsx";
import { Input } from "../../components/ui/input.tsx";
import { useTranslation } from "../../hooks/use-translation.ts";
import { cn } from "../../lib/utils.ts";
import type { NewField, SchemaType } from "../../types/jsonSchema.ts";
import SchemaTypeSelector from "./SchemaTypeSelector.tsx";

interface AddFieldButtonProps {
  onAddField: (field: NewField) => void;
  onAddPatternField: (field: NewField) => void;
  variant?: "primary" | "secondary";
  autoFocus?: boolean;
}

const AddFieldButton: FC<AddFieldButtonProps> = ({
  onAddField,
  onAddPatternField,
  variant = "primary",
  autoFocus = true,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState<SchemaType>("string");
  const [fieldDesc, setFieldDesc] = useState("");
  const [fieldRequired, setFieldRequired] = useState(false);
  const [useNameRegex, setUseNameRegex] = useState(false);
  const [additionalProperties, setAdditionalProperties] = useState(true);
  const fieldNameId = useId();
  const fieldNameHelpId = useId();
  const fieldDescId = useId();
  const fieldRequiredId = useId();
  const fieldTypeId = useId();
  const additionalPropertiesId = useId();

  const t = useTranslation();
  const regexError = (() => {
    if (!useNameRegex || !fieldName.trim()) return "";
    try {
      new RegExp(fieldName);
      return "";
    } catch {
      return t.fieldNameRegexError;
    }
  })();

  const setNameRegexMode = (enabled: boolean) => {
    setUseNameRegex(enabled);
    if (enabled) {
      setFieldRequired(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim()) return;
    if (regexError) return;

    const field = {
      name: fieldName,
      type: fieldType,
      description: fieldDesc,
      required: useNameRegex ? false : fieldRequired,
      additionalProperties:
        fieldType === "object" ? additionalProperties : undefined,
    };

    if (useNameRegex) {
      onAddPatternField(field);
    } else {
      onAddField(field);
    }

    setFieldName("");
    setFieldType("string");
    setFieldDesc("");
    setFieldRequired(false);
    setUseNameRegex(false);
    setDialogOpen(false);
    setAdditionalProperties(true);
  };

  return (
    <>
      <Button
        type="button"
        onClick={() => setDialogOpen(true)}
        variant={variant === "primary" ? "default" : "outline"}
        size="sm"
        className="flex items-center gap-1.5 group"
      >
        <CirclePlus
          size={16}
          className="group-hover:scale-110 transition-transform"
        />
        <span>{t.fieldAddNewButton}</span>
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="md:max-w-[1200px] max-h-[85vh] w-[95vw] p-4 sm:p-6 jsonjoy">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl flex flex-wrap items-center gap-2">
              {t.fieldAddNewLabel}
              <Badge variant="secondary" className="text-xs">
                {t.fieldAddNewBadge}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-sm">
              {t.fieldAddNewDescription}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4 min-w-[280px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <label
                      htmlFor={fieldNameId}
                      className="text-sm font-medium"
                    >
                      {useNameRegex ? t.fieldNameRegexLabel : t.fieldNameLabel}
                    </label>
                    <button
                      type="button"
                      onClick={() => setNameRegexMode(!useNameRegex)}
                      className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                    >
                      {useNameRegex
                        ? t.fieldNameUseExactName
                        : t.fieldNameUseRegex}
                    </button>
                  </div>
                  <Input
                    id={fieldNameId}
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder={
                      useNameRegex
                        ? t.fieldNameRegexPlaceholder
                        : t.fieldNamePlaceholder
                    }
                    aria-describedby={
                      useNameRegex ? fieldNameHelpId : undefined
                    }
                    aria-invalid={regexError ? true : undefined}
                    className="font-mono text-sm w-full"
                    autoFocus={autoFocus}
                    required
                  />
                  {useNameRegex ? (
                    <p
                      id={fieldNameHelpId}
                      className={cn(
                        "text-xs mt-1.5",
                        regexError
                          ? "text-destructive"
                          : "text-muted-foreground",
                      )}
                    >
                      {regexError || t.fieldNameRegexHelp}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label
                    htmlFor={fieldDescId}
                    className="block text-sm font-medium mb-1.5"
                  >
                    {t.fieldDescription}
                  </label>
                  <Input
                    id={fieldDescId}
                    value={fieldDesc}
                    onChange={(e) => setFieldDesc(e.target.value)}
                    placeholder={t.fieldDescriptionPlaceholder}
                    className="text-sm w-full"
                  />
                </div>

                {useNameRegex ? null : (
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                    <input
                      type="checkbox"
                      id={fieldRequiredId}
                      checked={fieldRequired}
                      onChange={(e) => setFieldRequired(e.target.checked)}
                      className="rounded border-gray-300 shrink-0"
                    />
                    <label htmlFor={fieldRequiredId} className="text-sm">
                      {t.fieldRequiredLabel}
                    </label>
                  </div>
                )}
                {fieldType === "object" ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
                    <input
                      type="checkbox"
                      id={additionalPropertiesId}
                      checked={additionalProperties}
                      onChange={(e) =>
                        setAdditionalProperties(e.target.checked)
                      }
                      className="rounded border-gray-300 shrink-0"
                    />
                    <label htmlFor={additionalPropertiesId} className="text-sm">
                      {t.additionalPropertiesAllow}
                    </label>
                  </div>
                ) : null}
              </div>

              <div className="space-y-4 min-w-[280px]">
                <div>
                  <label
                    htmlFor={fieldTypeId}
                    className="block text-sm font-medium mb-1.5"
                  >
                    {t.fieldType}
                  </label>
                  <SchemaTypeSelector
                    id={fieldTypeId}
                    value={fieldType}
                    onChange={setFieldType}
                  />
                </div>

                <div className="rounded-lg border bg-muted/50 p-3 hidden md:block">
                  <p className="text-xs font-medium mb-2">
                    {t.fieldTypeExample}
                  </p>
                  <code className="text-sm bg-background/80 p-2 rounded block overflow-x-auto">
                    {fieldType === "string" && '"example"'}
                    {fieldType === "number" && "42"}
                    {fieldType === "boolean" && "true"}
                    {fieldType === "object" && '{ "key": "value" }'}
                    {fieldType === "array" && '["item1", "item2"]'}
                  </code>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6 gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(false)}
              >
                {t.fieldAddNewCancel}
              </Button>
              <Button type="submit" size="sm">
                {t.fieldAddNewConfirm}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddFieldButton;
