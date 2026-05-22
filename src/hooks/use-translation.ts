import { en } from "../i18n/locales/en.ts";
import { useSchemaBuilderConfig } from "../i18n/schema-builder-config.tsx";

export function useTranslation() {
  const translation = useSchemaBuilderConfig();
  return translation ?? en;
}

export function formatTranslation(
  template: string,
  values: Record<string, string | number>,
) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    const value = values[key];
    return value !== undefined ? String(value) : `{${key}}`;
  });
}
