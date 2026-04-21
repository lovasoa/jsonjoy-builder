import { ChevronDown, ChevronRight, CirclePlus, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "../../../components/ui/input.tsx";
import { useTranslation } from "../../../hooks/use-translation.ts";
import type { Translation } from "../../../i18n/translation-keys.ts";
import { cn } from "../../../lib/utils.ts";
import type {
  JSONSchema,
  ObjectJSONSchema,
  SchemaEditorType,
  SchemaType,
} from "../../../types/jsonSchema.ts";
import {
  getEditorType,
  getSchemaDescription,
  isBooleanSchema,
} from "../../../types/jsonSchema.ts";
import TypeDropdown from "../TypeDropdown.tsx";
import type { TypeEditorProps } from "../TypeEditor.tsx";
import TypeEditor from "../TypeEditor.tsx";

export type Combinator = "anyOf" | "oneOf" | "allOf";

interface CombinatorStrings {
  description: string;
  addButton: string;
  removeButton: string;
  itemLabel: string;
  noItems: string;
}

function getCombinatorStrings(
  t: Translation,
  combinator: Combinator,
): CombinatorStrings {
  switch (combinator) {
    case "anyOf":
      return {
        description: t.anyOfDescription,
        addButton: t.anyOfAddOption,
        removeButton: t.anyOfRemoveOption,
        itemLabel: t.anyOfOptionLabel,
        noItems: t.anyOfNoOptions,
      };
    case "oneOf":
      return {
        description: t.oneOfDescription,
        addButton: t.oneOfAddOption,
        removeButton: t.oneOfRemoveOption,
        itemLabel: t.oneOfOptionLabel,
        noItems: t.oneOfNoOptions,
      };
    case "allOf":
      return {
        description: t.allOfDescription,
        addButton: t.allOfAddSchema,
        removeButton: t.allOfRemoveSchema,
        itemLabel: t.allOfSchemaLabel,
        noItems: t.allOfNoSchemas,
      };
  }
}

const DEFAULT_SCHEMAS: Record<SchemaEditorType, ObjectJSONSchema> = {
  string: { type: "string" },
  number: { type: "number" },
  integer: { type: "integer" },
  boolean: { type: "boolean" },
  object: { type: "object" },
  array: { type: "array" },
  null: { type: "null" },
  anyOf: { anyOf: [{ type: "string" }, { type: "number" }] },
  oneOf: { oneOf: [{ type: "string" }, { type: "number" }] },
  allOf: { allOf: [{ type: "object" }] },
};

let idCounter = 0;
const nextId = () => `combinator-${++idCounter}`;

export interface CombinatorEditorProps extends TypeEditorProps {
  combinator: Combinator;
}

const CombinatorEditor: React.FC<CombinatorEditorProps> = ({
  schema,
  readOnly = false,
  validationNode,
  onChange,
  schemaKey,
  onAddEnum,
  onDeleteEnum,
  depth = 0,
  combinator,
}) => {
  const t = useTranslation();
  const strings = getCombinatorStrings(t, combinator);

  const rawOptions: JSONSchema[] = isBooleanSchema(schema)
    ? []
    : (schema[combinator] ?? []);

  // Stable IDs for each option to use as React keys
  const [ids, setIds] = useState<string[]>(() =>
    rawOptions.map(() => nextId()),
  );

  // Keep ids in sync with rawOptions length (e.g. when schema is replaced externally)
  const options = useMemo(() => {
    if (rawOptions.length !== ids.length) {
      setIds(rawOptions.map((_o, i) => ids[i] ?? nextId()));
    }
    return rawOptions;
  }, [rawOptions, ids]);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [descFocusId, setDescFocusId] = useState<string | null>(null);

  useEffect(() => {
    if (descFocusId !== null && !ids.includes(descFocusId)) {
      setDescFocusId(null);
    }
  }, [descFocusId, ids]);

  const updateOptions = useCallback(
    (newOptions: JSONSchema[]) => {
      const base = isBooleanSchema(schema) ? {} : schema;
      const {
        [combinator]: _old,
        type: _type,
        ...rest
      } = base as ObjectJSONSchema &
        Record<Combinator, JSONSchema[] | undefined>;
      onChange({ ...rest, [combinator]: newOptions });
    },
    [schema, onChange, combinator],
  );

  const handleAddOption = () => {
    const newId = nextId();
    setIds((prev) => [...prev, newId]);
    updateOptions([...options, { type: "string" }]);
    setExpandedId(newId);
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = options.filter((_, i) => i !== index);
    setIds((prev) => prev.filter((_, i) => i !== index));
    updateOptions(newOptions);
    if (expandedId === ids[index]) setExpandedId(null);
  };

  const handleOptionTypeChange = (index: number, newType: SchemaEditorType) => {
    const newOptions = [...options];
    const prevDesc = getSchemaDescription(options[index]);
    let next: ObjectJSONSchema = DEFAULT_SCHEMAS[newType as SchemaType] ??
      DEFAULT_SCHEMAS[newType as Combinator] ?? { type: "string" };
    if (prevDesc !== "") {
      next = { ...next, description: prevDesc };
    }
    newOptions[index] = next;
    updateOptions(newOptions);
  };

  const handleOptionDescriptionChange = (index: number, value: string) => {
    const opt = options[index];
    const description = value === "" ? undefined : value;

    let updated: JSONSchema;
    if (isBooleanSchema(opt)) {
      if (opt === true) {
        updated = description !== undefined ? { description } : true;
      } else {
        updated = description !== undefined ? { description } : false;
      }
    } else {
      const base = { ...(opt as ObjectJSONSchema) };
      if (description !== undefined) {
        base.description = description;
      } else {
        delete base.description;
      }
      updated = base;
    }

    const newOptions = [...options];
    newOptions[index] = updated;
    updateOptions(newOptions);
  };

  const handleOptionSchemaChange = (
    index: number,
    updatedSchema: ObjectJSONSchema,
  ) => {
    const newOptions = [...options];
    newOptions[index] = updatedSchema;
    updateOptions(newOptions);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground italic">
        {strings.description}
      </p>

      {options.length === 0 ? (
        <div className="text-sm text-muted-foreground italic p-2 text-center border rounded-md">
          {strings.noItems}
        </div>
      ) : (
        <div className="space-y-2">
          {options.map((option, index) => {
            const id = ids[index];
            const optionDescription = getSchemaDescription(option);
            const optionType = getEditorType(option);
            const isExpanded = expandedId === id;

            return (
              <div
                key={id}
                className={cn(
                  "group rounded-lg border transition-all duration-200",
                  depth > 0 && "ml-0 sm:ml-4 border-l border-l-border/40",
                )}
              >
                <div className="flex flex-wrap items-center gap-2 px-3 py-2 sm:flex-nowrap">
                  <button
                    type="button"
                    className="flex shrink-0 items-center gap-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : (id ?? null))
                    }
                  >
                    {isExpanded ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}

                    <span className="shrink-0">
                      {strings.itemLabel} {index + 1}
                    </span>
                  </button>

                  {readOnly ? (
                    optionDescription ? (
                      <span className="flex-1 truncate px-2 py-0.5 text-left text-xs text-muted-foreground italic">
                        {optionDescription}
                      </span>
                    ) : null
                  ) : descFocusId === id ? (
                    <Input
                      aria-label={t.propertyDescriptionPlaceholder}
                      autoFocus
                      className="z-10 min-w-40 flex-1 text-xs"
                      placeholder={t.propertyDescriptionPlaceholder}
                      value={optionDescription}
                      onBlur={(e) => {
                        handleOptionDescriptionChange(
                          index,
                          e.target.value.trim(),
                        );
                        setDescFocusId(null);
                      }}
                      onChange={(e) =>
                        handleOptionDescriptionChange(index, e.target.value)
                      }
                      onFocus={(e) => e.target.select()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                      }}
                    />
                  ) : optionDescription ? (
                    <button
                      type="button"
                      className="mr-2 min-w-0 flex-1 cursor-text truncate rounded-sm px-2 py-0.5 text-left text-xs text-muted-foreground italic transition-all -mx-0.5 hover:bg-secondary/30 hover:ring-1 hover:ring-ring/20 hover:shadow-xs"
                      onClick={() => setDescFocusId(id)}
                      onKeyDown={(e) => e.key === "Enter" && setDescFocusId(id)}
                    >
                      {optionDescription}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="mr-2 min-w-0 flex-1 cursor-text truncate rounded-sm px-2 py-0.5 text-left text-xs text-muted-foreground/50 italic opacity-0 transition-all -mx-0.5 hover:bg-secondary/30 hover:ring-1 hover:ring-ring/20 hover:shadow-xs group-hover:opacity-100"
                      onClick={() => setDescFocusId(id)}
                      onKeyDown={(e) => e.key === "Enter" && setDescFocusId(id)}
                    >
                      {t.propertyDescriptionButton}
                    </button>
                  )}

                  <div className="flex shrink-0 items-center gap-2 sm:ml-auto">
                    <TypeDropdown
                      value={optionType}
                      readOnly={readOnly}
                      onChange={(newType) =>
                        handleOptionTypeChange(index, newType)
                      }
                    />

                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="p-1 rounded-md hover:bg-secondary hover:text-destructive transition-colors text-muted-foreground"
                        aria-label={strings.removeButton}
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="pt-1 pb-2 px-3 border-t animate-in">
                    <TypeEditor
                      readOnly={readOnly}
                      schema={option}
                      validationNode={
                        validationNode?.children[`${combinator}:${index}`]
                      }
                      onChange={(updatedSchema) =>
                        handleOptionSchemaChange(index, updatedSchema)
                      }
                      schemaKey={
                        schemaKey
                          ? `${schemaKey}.${combinator}[${index}]`
                          : `${combinator}[${index}]`
                      }
                      onAddEnum={onAddEnum}
                      onDeleteEnum={onDeleteEnum}
                      depth={depth + 1}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!readOnly && (
        <button
          type="button"
          onClick={handleAddOption}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-secondary"
        >
          <CirclePlus size={14} />
          {strings.addButton}
        </button>
      )}
    </div>
  );
};

export default CombinatorEditor;
