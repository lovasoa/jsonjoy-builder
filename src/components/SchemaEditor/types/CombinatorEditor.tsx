import { CirclePlus, X } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
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

  const updateOptions = useCallback(
    (newOptions: JSONSchema[]) => {
      const base = isBooleanSchema(schema) ? {} : schema;
      const {
        [combinator]: _old,
        type: _type,
        ...rest
      } = base as ObjectJSONSchema & Record<Combinator, JSONSchema[] | undefined>;
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

  const handleOptionTypeChange = (
    index: number,
    newType: SchemaEditorType,
  ) => {
    const newOptions = [...options];
    newOptions[index] = DEFAULT_SCHEMAS[newType as SchemaType] ??
      DEFAULT_SCHEMAS[newType as Combinator] ?? { type: "string" };
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
            const optionType = getEditorType(option);
            const isExpanded = expandedId === id;

            return (
              <div
                key={id}
                className={cn(
                  "rounded-lg border transition-all duration-200",
                  depth > 0 && "ml-0 sm:ml-4 border-l border-l-border/40",
                )}
              >
                <div className="flex items-center gap-2 px-3 py-2">
                  <button
                    type="button"
                    className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors min-w-[72px] text-left"
                    onClick={() =>
                      setExpandedId(isExpanded ? null : (id ?? null))
                    }
                  >
                    {strings.itemLabel} {index + 1}
                  </button>

                  <div className="flex items-center gap-2 ml-auto">
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
