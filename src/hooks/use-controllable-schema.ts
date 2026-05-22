import { useCallback, useState } from "react";
import type { JsonSchema } from "../types/jsonSchema.ts";

const fallbackSchema: JsonSchema = { type: "object" };

interface UseControllableSchemaOptions {
  value?: JsonSchema;
  defaultValue?: JsonSchema;
  onChange?: (schema: JsonSchema) => void;
}

export function useControllableSchema({
  value,
  defaultValue = fallbackSchema,
  onChange,
}: UseControllableSchemaOptions) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const isControlled = value !== undefined;
  const schema = isControlled ? value : internalValue;

  const setSchema = useCallback(
    (nextSchema: JsonSchema) => {
      if (!isControlled) {
        setInternalValue(nextSchema);
      }

      onChange?.(nextSchema);
    },
    [isControlled, onChange],
  );

  return [schema, setSchema] as const;
}
