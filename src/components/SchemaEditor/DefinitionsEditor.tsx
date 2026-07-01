import { CirclePlus } from "lucide-react";
import { type FC, type FormEvent, useMemo, useState } from "react";
import { useTranslation } from "../../hooks/use-translation.ts";
import {
  getRootDefinitions,
  removeDefinition,
  renameDefinition,
  updateDefinition,
} from "../../lib/refUtils.ts";
import { cn } from "../../lib/utils.ts";
import type { JsonSchema, ObjectJsonSchema } from "../../types/jsonSchema.ts";
import { asObjectSchema } from "../../types/jsonSchema.ts";
import { buildValidationTree } from "../../types/validation.ts";
import { Button } from "../ui/button.tsx";
import { Input } from "../ui/input.tsx";
import { DefinitionSchemaPropertyEditor } from "./SchemaPropertyEditor.tsx";

interface DefinitionsEditorProps {
  schema: JsonSchema;
  readOnly: boolean;
  onChange: (schema: JsonSchema) => void;
  autoFocus?: boolean;
}

/**
 * Edits the reusable definitions of the document ($defs and the legacy
 * definitions keyword), which can be referenced elsewhere with $ref.
 */
const DefinitionsEditor: FC<DefinitionsEditorProps> = ({
  schema,
  readOnly = false,
  onChange,
  autoFocus = true,
}) => {
  const t = useTranslation();
  const [newName, setNewName] = useState("");
  const [nameError, setNameError] = useState(false);

  const definitions = getRootDefinitions(schema);
  const validationTree = useMemo(
    () => buildValidationTree(schema, t),
    [schema, t],
  );

  if (readOnly && definitions.length === 0) return null;

  const nameExists = (name: string) =>
    definitions.some((definition) => definition.name === name);

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    if (nameExists(name)) {
      setNameError(true);
      return;
    }

    onChange(
      updateDefinition(asObjectSchema(schema), "$defs", name, {
        type: "object",
      }),
    );
    setNewName("");
    setNameError(false);
  };

  return (
    <div className="mt-6 pt-4 border-t">
      <h4 className="font-medium text-sm">{t.definitionsTitle}</h4>
      <p className="text-xs text-muted-foreground italic mt-1 mb-3">
        {t.definitionsDescription}
      </p>

      {definitions.map((definition) => (
        <DefinitionSchemaPropertyEditor
          key={`${definition.container}:${definition.name}`}
          name={definition.name}
          pointer={definition.pointer}
          schema={definition.schema}
          schemaKey={definition.pointer}
          readOnly={readOnly}
          autoFocus={autoFocus}
          validationNode={
            validationTree.children[
              `${definition.container}:${definition.name}`
            ]
          }
          onDelete={() =>
            onChange(
              removeDefinition(
                asObjectSchema(schema),
                definition.container,
                definition.name,
              ),
            )
          }
          onNameChange={(name) => {
            if (!name || nameExists(name)) return;
            onChange(
              renameDefinition(
                asObjectSchema(schema),
                definition.container,
                definition.name,
                name,
              ),
            );
          }}
          onSchemaChange={(updated: ObjectJsonSchema) =>
            onChange(
              updateDefinition(
                asObjectSchema(schema),
                definition.container,
                definition.name,
                updated,
              ),
            )
          }
        />
      ))}

      {!readOnly && (
        <form onSubmit={handleAdd} className="mt-3">
          <div className="flex items-center gap-2">
            <Input
              aria-label={t.definitionsTitle}
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setNameError(false);
              }}
              placeholder={t.definitionNamePlaceholder}
              aria-invalid={nameError ? true : undefined}
              className={cn(
                "h-8 text-sm font-mono max-w-[260px]",
                nameError && "border-destructive",
              )}
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="flex items-center gap-1.5"
            >
              <CirclePlus size={14} />
              {t.definitionAddButton}
            </Button>
          </div>
          {nameError && (
            <p className="text-xs text-destructive mt-1.5">
              {t.definitionNameExists}
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default DefinitionsEditor;
