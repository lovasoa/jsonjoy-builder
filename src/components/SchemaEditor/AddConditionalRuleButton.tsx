import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { JSONSchema } from "@/types/jsonSchema"; // Assuming JSONSchema type is available
import { CirclePlus, Info } from "lucide-react";
import type React from "react";
import { useState } from "react";

// Define the structure for a conditional rule
export interface ConditionalRule {
  if: JSONSchema;
  then: JSONSchema;
  else?: JSONSchema;
}

interface AddConditionalRuleButtonProps {
  onAddConditionalRule: (rule: ConditionalRule) => void;
  variant?: "primary" | "secondary";
}

const AddConditionalRuleButton: React.FC<AddConditionalRuleButtonProps> = ({
  onAddConditionalRule,
  variant = "primary",
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ifSchemaStr, setIfSchemaStr] = useState("");
  const [thenSchemaStr, setThenSchemaStr] = useState("");
  const [elseSchemaStr, setElseSchemaStr] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let ifSchema: JSONSchema;
    let thenSchema: JSONSchema;
    let elseSchema: JSONSchema | undefined;

    if (!ifSchemaStr.trim() || !thenSchemaStr.trim()) {
      setError(
        "The 'If' and 'Then' schema parts are required and cannot be empty.",
      );
      return;
    }

    try {
      ifSchema = JSON.parse(ifSchemaStr);
    } catch (err) {
      setError(
        "Invalid JSON in 'If' schema. Please provide a valid JSON object.",
      );
      return;
    }

    try {
      thenSchema = JSON.parse(thenSchemaStr);
    } catch (err) {
      setError(
        "Invalid JSON in 'Then' schema. Please provide a valid JSON object.",
      );
      return;
    }

    if (elseSchemaStr.trim()) {
      try {
        elseSchema = JSON.parse(elseSchemaStr);
      } catch (err) {
        setError(
          "Invalid JSON in 'Else' schema. Please provide a valid JSON object or leave it empty.",
        );
        return;
      }
    }

    onAddConditionalRule({
      if: ifSchema,
      then: thenSchema,
      ...(elseSchema && { else: elseSchema }),
    });

    // Reset state
    setIfSchemaStr("");
    setThenSchemaStr("");
    setElseSchemaStr("");
    setDialogOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setDialogOpen(true)}
        variant={variant === "primary" ? "default" : "outline"}
        size="sm"
        className="flex items-center gap-1.5 group"
      >
        <CirclePlus
          size={16}
          className="group-hover:scale-110 transition-transform"
        />
        <span>Add Conditional Rule</span>
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="md:max-w-[800px] max-h-[85vh] w-[95vw] p-4 sm:p-6">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl flex flex-wrap items-center gap-2">
              Add Conditional Rule (If/Then/Else)
              <Badge variant="secondary" className="text-xs">
                Schema Builder
              </Badge>
            </DialogTitle>
            <DialogDescription className="text-sm">
              Define a conditional subschema. If the data validates against the
              'If' schema, then it must also validate against the 'Then' schema.
              Optionally, if it does not validate against 'If', it must validate
              against the 'Else' schema.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <label htmlFor="ifSchema" className="text-sm font-medium">
                  If Schema
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[90vw] sm:max-w-sm">
                      <p>
                        A schema that the data must validate against for the
                        'Then' schema to apply. (Required)
                        <br />
                        Example:{" "}
                        <code>
                          {'{ "properties": { "country": { "const": "US" } } }'}
                        </code>
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Textarea
                id="ifSchema"
                value={ifSchemaStr}
                onChange={(e) => setIfSchemaStr(e.target.value)}
                placeholder='{ "properties": { "field_name": { "type": "string" } } }'
                className="font-mono text-sm w-full min-h-[100px]"
                required
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <label htmlFor="thenSchema" className="text-sm font-medium">
                  Then Schema
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[90vw] sm:max-w-sm">
                      <p>
                        A schema that applies if the data validates against the
                        'If' schema. (Required)
                        <br />
                        Example: <code>{'{ "required": ["zip_code"] }'}</code>
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Textarea
                id="thenSchema"
                value={thenSchemaStr}
                onChange={(e) => setThenSchemaStr(e.target.value)}
                placeholder='{ "properties": { "dependent_field": { "type": "number" } } }'
                className="font-mono text-sm w-full min-h-[100px]"
                required
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <label htmlFor="elseSchema" className="text-sm font-medium">
                  Else Schema (Optional)
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="h-4 w-4 text-muted-foreground shrink-0" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[90vw] sm:max-w-sm">
                      <p>
                        A schema that applies if the data does NOT validate
                        against the 'If' schema. (Optional)
                        <br />
                        Example:{" "}
                        <code>
                          {
                            '{ "properties": { "reason": { "type": "string" } } }'
                          }
                        </code>
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Textarea
                id="elseSchema"
                value={elseSchemaStr}
                onChange={(e) => setElseSchemaStr(e.target.value)}
                placeholder='{ "properties": { "alternative_field": { "type": "boolean" } } }'
                className="font-mono text-sm w-full min-h-[100px]"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-100 p-2 rounded-md">
                {error}
              </p>
            )}

            <DialogFooter className="mt-6 gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setDialogOpen(false);
                  setError(null); // Clear error on cancel
                }}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Add Rule
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddConditionalRuleButton;
