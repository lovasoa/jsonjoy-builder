// exports for public API

import {
  InferSchemaDialog,
  type InferSchemaDialogProps,
} from "./components/features/InferSchemaDialog.tsx";
import {
  ValidateJsonDialog,
  type ValidateJsonDialogProps,
} from "./components/features/ValidateJsonDialog.tsx";
import SchemaBuilder, {
  type SchemaBuilderProps,
} from "./components/SchemaEditor/SchemaBuilder.tsx";
import SchemaFieldsEditor, {
  type SchemaFieldsEditorProps,
} from "./components/SchemaEditor/SchemaFieldsEditor.tsx";
import SchemaJsonEditor, {
  type SchemaJsonEditorProps,
} from "./components/SchemaEditor/SchemaJsonEditor.tsx";

export { de } from "./i18n/locales/de.ts";
export { en } from "./i18n/locales/en.ts";
export { es } from "./i18n/locales/es.ts";
export { fr } from "./i18n/locales/fr.ts";
export { pl } from "./i18n/locales/pl.ts";
export { ru } from "./i18n/locales/ru.ts";
export { uk } from "./i18n/locales/uk.ts";
export { zh } from "./i18n/locales/zh.ts";
export {
  SchemaBuilderProvider,
  useSchemaBuilderConfig,
} from "./i18n/schema-builder-config.tsx";
export type { Translation } from "./i18n/translation-keys.ts";
export {
  createSchemaFromJson,
  inferSchema,
} from "./lib/schema-inference.ts";
export type {
  SchemaBuilderComponents,
  SchemaBuilderRegistry,
  SchemaBuilderSlots,
} from "./registry/index.ts";
export {
  mergeRegistry,
  SchemaBuilderRegistryProvider,
  useComponent,
  useRegistry,
  useSlot,
  useSlotProps,
} from "./registry/index.ts";
export type { JsonSchema } from "./types/jsonSchema.ts";
export {
  type ValidationError,
  type ValidationResult,
  validateJson,
} from "./utils/jsonValidator.ts";
export {
  InferSchemaDialog,
  type InferSchemaDialogProps,
  SchemaBuilder,
  type SchemaBuilderProps,
  SchemaFieldsEditor,
  type SchemaFieldsEditorProps,
  SchemaJsonEditor,
  type SchemaJsonEditorProps,
  ValidateJsonDialog,
  type ValidateJsonDialogProps,
};
