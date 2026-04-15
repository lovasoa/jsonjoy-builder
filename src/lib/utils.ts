import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Translation } from "../i18n/translation-keys.ts";
import type { SchemaEditorType } from "../types/jsonSchema.ts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Helper functions for backward compatibility
export const getTypeColor = (type: SchemaEditorType): string => {
  switch (type) {
    case "string":
      return "text-blue-500 bg-blue-50";
    case "number":
    case "integer":
      return "text-purple-500 bg-purple-50";
    case "boolean":
      return "text-green-500 bg-green-50";
    case "object":
      return "text-orange-500 bg-orange-50";
    case "array":
      return "text-pink-500 bg-pink-50";
    case "null":
      return "text-gray-500 bg-gray-50";
    case "anyOf":
      return "text-teal-500 bg-teal-50";
    case "oneOf":
      return "text-cyan-500 bg-cyan-50";
    case "allOf":
      return "text-indigo-500 bg-indigo-50";
  }
};

// Get type display label
export const getTypeLabel = (t: Translation, type: SchemaEditorType): string => {
  switch (type) {
    case "string":
      return t.schemaTypeString;
    case "number":
    case "integer":
      return t.schemaTypeNumber;
    case "boolean":
      return t.schemaTypeBoolean;
    case "object":
      return t.schemaTypeObject;
    case "array":
      return t.schemaTypeArray;
    case "null":
      return t.schemaTypeNull;
    case "anyOf":
      return t.schemaTypeAnyOf;
    case "oneOf":
      return t.schemaTypeOneOf;
    case "allOf":
      return t.schemaTypeAllOf;
  }
};
