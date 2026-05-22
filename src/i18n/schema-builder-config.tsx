import { createContext, type ReactNode, useContext, useMemo } from "react";
import { en } from "./locales/en.ts";
import type { Translation } from "./translation-keys.ts";

/** @public */
export interface SchemaBuilderProviderProps {
  locale?: Translation;
  messages?: Partial<Translation>;
  children?: ReactNode;
}

const SchemaBuilderConfigContext = createContext<Translation>(en);

/** @public */
export function SchemaBuilderProvider({
  locale,
  messages,
  children,
}: SchemaBuilderProviderProps) {
  const parentLocale = useContext(SchemaBuilderConfigContext);
  const mergedLocale = useMemo(
    () => ({ ...parentLocale, ...locale, ...messages }),
    [parentLocale, locale, messages],
  );

  return (
    <SchemaBuilderConfigContext value={mergedLocale}>
      {children}
    </SchemaBuilderConfigContext>
  );
}

/** @public */
export function useSchemaBuilderConfig() {
  return useContext(SchemaBuilderConfigContext);
}
