// exports for public API

import JsonSchemaEditor, {
  type JsonSchemaEditorProps,
} from "./components/SchemaEditor/JsonSchemaEditor.tsx";
import JsonSchemaVisualizer, {
  type JsonSchemaVisualizerProps,
} from "./components/SchemaEditor/JsonSchemaVisualizer.tsx";
import SchemaVisualEditor, {
  type SchemaVisualEditorProps,
} from "./components/SchemaEditor/SchemaVisualEditor.tsx";

export * from "./components/features/JsonValidator.tsx";
export * from "./components/features/SchemaInferencer.tsx";
export * from "./i18n/locales/de.ts";
export * from "./i18n/locales/en.ts";
export * from "./i18n/locales/es.ts";
export * from "./i18n/locales/fr.ts";
export * from "./i18n/locales/pl.ts";
export * from "./i18n/locales/ru.ts";
export * from "./i18n/locales/uk.ts";
export * from "./i18n/locales/zh.ts";
export * from "./i18n/translation-context.ts";
export * from "./i18n/translation-keys.ts";

export {
  JsonSchemaEditor,
  type JsonSchemaEditorProps,
  JsonSchemaVisualizer,
  type JsonSchemaVisualizerProps,
  SchemaVisualEditor,
  type SchemaVisualEditorProps,
};

export type { baseSchema, JSONSchema } from "./types/jsonSchema.ts";
