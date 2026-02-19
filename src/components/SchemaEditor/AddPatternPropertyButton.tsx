import { CirclePlus, HelpCircle, Info } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip.tsx";
import { useTranslation } from "../../hooks/use-translation.ts";
import type { SchemaType } from "../../types/jsonSchema.ts";
import SchemaTypeSelector from "./SchemaTypeSelector.tsx";

export interface NewPatternProperty {
  pattern: string;
  type: SchemaType;
  description: string;
}

interface AddPatternPropertyButtonProps {
  onAddPatternProperty: (field: NewPatternProperty) => void;
  variant?: "primary" | "secondary";
}

const AddPatternPropertyButton: FC<AddPatternPropertyButtonProps> = ({
  onAddPatternProperty,
  variant = "primary",
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pattern, setPattern] = useState("");
  const [fieldType, setFieldType] = useState<SchemaType>("string");
  const [fieldDesc, setFieldDesc] = useState("");
  const [patternError, setPatternError] = useState<string | null>(null);
  const patternId = useId();
  const fieldDescId = useId();
  const fieldTypeId = useId();

  const t = useTranslation();

  const validatePattern = (value: string): boolean => {
    if (!value.trim()) {
      setPatternError("Pattern cannot be empty");
      return false;
    }
    try {
      new RegExp(value);
      setPatternError(null);
      return true;
    } catch {
      setPatternError(t.patternPropertyInvalidRegex);
      return false;
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!pattern.trim() || patternError) return;

    onAddPatternProperty({
      pattern: pattern.trim(),
      type: fieldType,
      description: fieldDesc,
    });

    setPattern("");
    setFieldType("string");
    setFieldDesc("");
    setPatternError(null);
    setDialogOpen(false);
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
        <span>{t.patternPropertiesAddButton}</span>
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="md:max-w-[1200px] max-h-[85vh] w-[95vw] p-4 sm:p-6 jsonjoy">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl flex flex-wrap items-center gap-2">
              {t.patternPropertiesAddNewLabel}
              <Badge variant="secondary" className="text-xs">
                {t.fieldAddNewBadge}
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-sm">
              {t.patternPropertiesAddNewDescription}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4 min-w-[280px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <label
                      htmlFor={patternId}
                      className="text-sm font-medium"
                    >
                      {t.patternPropertyNameLabel}
                    </label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[90vw]">
                          <p>{t.patternPropertyNameTooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id={patternId}
                    value={pattern}
                    onChange={(e) => {
                      setPattern(e.target.value);
                      validatePattern(e.target.value);
                    }}
                    placeholder={t.patternPropertyNamePlaceholder}
                    className={`font-mono text-sm w-full ${
                      patternError ? "border-destructive" : ""
                    }`}
                    required
                  />
                  {patternError && (
                    <p className="text-xs text-destructive mt-1">
                      {patternError}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <label
                      htmlFor={fieldDescId}
                      className="text-sm font-medium"
                    >
                      {t.fieldDescription}
                    </label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[90vw]">
                          <p>{t.fieldDescriptionTooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Input
                    id={fieldDescId}
                    value={fieldDesc}
                    onChange={(e) => setFieldDesc(e.target.value)}
                    placeholder={t.fieldDescriptionPlaceholder}
                    className="text-sm w-full"
                  />
                </div>
              </div>

              <div className="space-y-4 min-w-[280px]">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <label
                      htmlFor={fieldTypeId}
                      className="text-sm font-medium"
                    >
                      {t.fieldType}
                    </label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <HelpCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                        </TooltipTrigger>
                        <TooltipContent
                          side="left"
                          className="w-72 max-w-[90vw]"
                        >
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                            <div>• {t.fieldTypeTooltipString}</div>
                            <div>• {t.fieldTypeTooltipNumber}</div>
                            <div>• {t.fieldTypeTooltipBoolean}</div>
                            <div>• {t.fieldTypeTooltipObject}</div>
                            <div className="col-span-2">
                              • {t.fieldTypeTooltipArray}
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
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
                {t.patternPropertiesAddNewCancel}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={!pattern.trim() || !!patternError}
              >
                {t.patternPropertiesAddNewConfirm}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddPatternPropertyButton;
