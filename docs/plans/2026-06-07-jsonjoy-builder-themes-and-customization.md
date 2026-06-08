# jsonjoy-builder Registry API — Architecture & Implementation Plan

**Date:** 2026-06-07  
**Status:** Final, approved for implementation  
**Presented to:** @lovasoa (maintainer)

---

## Problem

The `jsonjoy-builder` library currently renders its UI with hardcoded internal components. Users who want to make the editor **look like their own design system** must fork the library or override CSS. Users who want to **add custom JSON Schema constraint editors** (e.g. a uniqueness toggle) must patch the source.

These two goals motivate a component extension API, inspired by `react-jsonschema-form` (registry/themes) and Material UI (slots/slotProps):

1. **Visual indistinguishability** — the final editor should be impossible to tell apart from the user's own design system;
2. **Custom constraint editors** — users should be able to add new JSON Schema property editors (e.g. `uniqueItems`, `x-custom:graphql-type`) without touching the library internals.

This plan describes the API, the architecture, and the implementation sequence in 5 reviewable pull requests.

---

## Architecture overview

The primary extension point is a single optional prop `registry` accepted by `<SchemaBuilder>`, `<SchemaFieldsEditor>`, and `<SchemaJsonEditor>`:

```tsx
<SchemaBuilder
  value={schema}
  onChange={setSchema}
  registry={{
    components: { Button: DS.Button, Input: DS.Input },
    slots: { FieldFrame: DS.SchemaRow },
    slotProps: { FieldFrame: { variant: "compact" } },
    validators: { string: { unique: UniqueValidator } },
    widgets: { string: MyStringWidget },
    fields: { "x-vendor:slug": { label: "Slug", ..., component: SlugEditor } },
  }}
/>
```

The `registry` object groups five independent extension namespaces:

| Namespace | What it does | Modeled on |
|---|---|---|
| `components` | Replace leaf primitives (Button, Input, Switch, Dialog) with design-system adapters | RJSF `widgets` |
| `slots` / `slotProps` | Replace layout wrappers (field row, frame, header) | MUI `slots` / `slotProps` |
| `validators` | Add or replace JSON Schema constraint editors (minLength, pattern, enum, custom) | RJSF `FieldTemplate` |
| `widgets` | Replace the entire type editor for a given inferred type (string, number, integer, object…) | RJSF `fields` |
| `fields` | Register named custom field definitions accessible via Add Field UI and persisted as `x-jsonjoy-editor` in the schema | — |

---

## Key design decisions

### 1. Separate registry provider from i18n provider

The existing `SchemaBuilderProvider` (in `src/i18n/schema-builder-config.tsx`) owns the i18n/translation context. The registry uses a **separate** provider `SchemaBuilderRegistryProvider`. The two are never merged.

### 2. Circular imports avoided by keeping built-in editors local

The built-in type editors (`StringEditor`, `NumberEditor`, …) remain in `TypeEditor.tsx` as `React.lazy()` imports, exactly as they are today. The `registry/defaults.ts` file does **not** import any editor file — it contains only default UI primitives, empty extension maps (`validators: {}`, `widgets: {}`, `fields: {}`), and default layout slots. This prevents the import cycle `defaults → editors → useRegistry → defaults`.

### 3. `editorKey` over `forcedType`

Schemas can carry an `x-jsonjoy-editor` annotation that selects a custom field. When present, the `TypeEditor` resolution pipeline checks `registry.fields[editorKey]` first, then falls back to the default type-based selection. This avoids the semantic ambiguity of "forcing a type" and preserves the field identity through rename/edit flows.

### 4. `widgets` and `fields` are separate namespaces

- `widgets.string` replaces the built-in `StringEditor` **for all schemas whose type resolves to `"string"`**.
- `fields["x-vendor:slug"]` defines a new field type **only when the schema carries `x-jsonjoy-editor: "x-vendor:slug"` or the user selects it from Add Field UI**.

This prevents the collision problem that a single `fields` namespace would have between "override existing type" and "define new type".

### 5. Dialog is a high-level adapter, not a slot

There is no `slots.Dialog`. Instead, `components.SchemaDialog` is a high-level component accepting `{ open, onOpenChange, title, description, footer, children }`. Users replace the **entire dialog shell** (not individual Radix primitives), which is both simpler and more useful.

### 6. Provider nesting merges, never overrides

`SchemaBuilder` wraps its content in a `SchemaBuilderRegistryProvider`. `SchemaFieldsEditor` does the same. When nested, the child provider merges with the parent via `mergeRegistry(parent, child)`. If the child receives `registry={undefined}`, it is a no-op (passes through the parent). This means `SchemaFieldsEditor` used standalone vs. inside `SchemaBuilder` both work correctly.

---

## Namespace type definitions

### `components`

```ts
/** @public */
export interface SchemaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

/** @public */
export interface SchemaBuilderComponents {
  Button: React.ComponentType<ButtonProps>;
  Input: React.ComponentType<InputProps>;
  Textarea: React.ComponentType<TextareaProps>;
  Switch: React.ComponentType<SwitchProps>;
  Badge: React.ComponentType<BadgeProps>;
  Label: React.ComponentType<LabelProps>;
  ButtonToggle: React.ComponentType<ButtonToggleProps>;
  IconButton: React.ComponentType<IconButtonProps>;
  SchemaDialog: React.ComponentType<SchemaDialogProps>;
}
```

### `slots` / `slotProps`

Layout-only wrappers. They receive `children` and visual metadata but do not own behavior.

```ts
/** @public */
export interface SchemaBuilderSlots {
  Root: React.ComponentType<SlotWithChildrenProps>;
  MobileModeSwitch: React.ComponentType<MobileModeSwitchSlotProps>;
  FullscreenToggle: React.ComponentType<FullscreenToggleSlotProps>;
  FieldFrame: React.ComponentType<FieldFrameSlotProps>;
  FieldHeader: React.ComponentType<FieldHeaderSlotProps>;
  FieldMain: React.ComponentType<FieldMainSlotProps>;
  FieldActions: React.ComponentType<FieldActionsSlotProps>;
  FieldBody: React.ComponentType<FieldBodySlotProps>;
}
```

Mapping of slots to the current `SchemaPropertyEditor.tsx`:

| Slot | Current lines / responsibility |
|---|---|
| `FieldFrame` | Outer `<div>` (lines 122-289): `mb-2 animate-in rounded-lg border` |
| `FieldHeader` | Header row (lines 129-271): `relative json-field-row justify-between group` |
| `FieldMain` | Left block (lines 130-246): expand toggle + name + description + type + required badge |
| `FieldActions` | Right block (lines 248-270): error badge + delete button |
| `FieldBody` | Expanded body (lines 274-288): description in readonly + TypeEditor |

### `validators`

Validators are definitions (not raw components) to capture order and error-path metadata. The generic `T extends SchemaType` was considered and dropped: `SchemaType` is a union and TypeScript cannot narrow `schemaType: string` to a literal at runtime, making the generic purely cosmetic. Validators receive pre-filtered `errors` via `errorPaths` instead.

```ts
import type { z } from "zod/mini";

/** @public */
export interface ValidatorEditorProps {
  schema: ObjectJsonSchema;
  onChange: (next: ObjectJsonSchema) => void;
  readOnly: boolean;
  errors: z.ZodIssue[];             // pre-filtered for this validator's errorPaths
  schemaKey: string | undefined;
  schemaType: string;
}

/** @public */
export type ValidatorEditorComponent = React.ComponentType<ValidatorEditorProps>;

/** @public */
export interface ValidatorDefinition {
  component: ValidatorEditorComponent;
  order?: number;
  errorPaths?: string[];
}

/** @public */
export type ValidatorMap = Record<string, ValidatorDefinition | ValidatorEditorComponent>;

/** @public */
export interface ValidatorRegistry {
  string: ValidatorMap;
  number: ValidatorMap;
  integer: ValidatorMap;
  array: ValidatorMap;
  object: ValidatorMap;
  boolean: ValidatorMap;
  any: ValidatorMap;
}
```

Normalization: if the user passes a bare component `() => <div />`, it is wrapped as `{ component: () => <div /> }`.  
Merge rule: shallow per-key replacement. If the user provides `validators.string.unique`, it is **added**. If they provide `validators.string.length`, it **replaces** the default length validator.

Default validator groups and their display order:

| Type | Order | Keys |
|---|---|---|
| string | 1–4 | `length` (min/maxLength, paths: `['length']`), `pattern`, `format`, `enum` |
| number | 1–3 | `range` (min/max/exclusive, paths: `['minMax']`), `multipleOf`, `enum` |
| integer | (inherits from `number` plus `validators.integer` overrides) |
| array | 1–2 | `itemsCount` (min/maxItems, paths: `['minmax']`), `uniqueItems` |

### `widgets`

```ts
/** @public */
export type WidgetRegistry = Partial<
  Record<SchemaEditorType, React.ComponentType<TypeEditorProps>>
>;
```

Widget overrides are a simple map from schema type to component. They replace the built-in lazy-loaded editor entirely.

### `fields`

```ts
/** @public */
export interface FieldDefinition {
  component: React.ComponentType<TypeEditorProps>;
  label: string;
  description?: string;
  baseType: SchemaEditorType;
  group?: "custom" | "basic" | "composition";
  createSchema?: (ctx: { name: string; description: string; required: boolean }) => ObjectJsonSchema;
}

/** @public */
export type FieldRegistry = Record<string, FieldDefinition>;
```

Field keys must:
- start with `x-` or contain `:`;
- not equal any built-in `SchemaEditorType`;
- be persisted as `x-jsonjoy-editor` in the generated schema.

When `createSchema` is provided, it **replaces** the standard `createFieldSchema` logic for that field type. When absent, the standard function is used with `baseType` as the type and `x-jsonjoy-editor` appended.

### Root registry

```ts
/** @public */
export interface SchemaBuilderRegistry {
  components?: Partial<SchemaBuilderComponents>;
  slots?: Partial<SchemaBuilderSlots>;
  slotProps?: Partial<SchemaBuilderSlotProps>;
  validators?: Partial<ValidatorRegistry>;
  widgets?: WidgetRegistry;
  fields?: FieldRegistry;
}
```

---

## File map

### New files (~35)

```
src/registry/
  types.ts                                          — All public types
  mergeRegistry.ts                                  — Namespace-specific merge logic
  validatorsHelpers.ts                              — normalizeValidatorDefinition,
                                                      mergeValidatorDefinitions, orderValidators
  SchemaBuilderRegistryContext.tsx                   — Provider + hooks
  defaults.ts                                       — Default UI primitives + slots; empty maps
  index.ts                                          — Barrel export

src/components/SchemaEditor/validators/
  string/{StringLength, StringPattern, StringFormat, StringEnum, index}.tsx
  number/{NumberRange, NumberMultipleOf, NumberEnum, index}.tsx
  array/{ArrayItemsCount, ArrayUniqueItems, index}.tsx

test/registry/
  mergeRegistry.test.ts
  provider-nesting.test.tsx
  components-registry.test.tsx
  slots-registry.test.tsx
  validators-registry.test.tsx
  widgets-registry.test.tsx
  fields-registry.test.tsx
  mui-style-registry.test.tsx

demo/pages/CustomRegistry.tsx
```

### Changed files (~20)

```
src/index.ts                                        — Re-export registry API
src/types/jsonSchema.ts                             — NewField.editorKey?
src/lib/schemaEditor.ts                             — getSchemaEditorKey, createFieldSchema extension
src/lib/utils.ts                                    — getTypeColor/getTypeLabel accept string
src/i18n/translation-keys.ts                        — schemaTypeCustom if needed
src/i18n/locales/*.ts                               — Translations
src/components/SchemaEditor/
  SchemaBuilder.tsx                                 — registry prop + provider
  SchemaFieldsEditor.tsx                            — registry prop + provider
  SchemaJsonEditor.tsx                              — registry prop + provider
  SchemaPropertyEditor.tsx                          — Decompose into slots + useComponent
  SchemaPropertyRows.tsx                            — Pass through (registry wired via editor)
  SchemaField.tsx                                   — Legacy wrapper, unchanged
  SchemaFieldList.tsx                               — editorKey preservation
  AddFieldButton.tsx                                — Custom field selection + components
  SchemaTypeSelector.tsx                            — Merge fixed options + registry.fields
  TypeDropdown.tsx                                  — Custom field display
  TypeEditor.tsx                                    — Resolution pipeline
  types/{String, Number, Array, Boolean, Object, Combinator}Editor.tsx  — useComponent
src/components/features/
  {Infer, Validate}SchemaDialog.tsx                 — components + SchemaDialog
README.md                                           — Plugin Registry section
demo/pages/Index.tsx                                — Import CustomRegistry example
```

---

## Non-goals (explicitly excluded)

| Feature | Rationale |
|---|---|
| Monaco as a registry slot | Monaco is a full IDE editor, not a leaf component; extracting `SchemaJsonEditor` into `@jsonjoy-builder/editor-monaco` is a separate concern |
| `registry.theme` | CSS variables `.jsonjoy` already handle theming; design system integration works via `registry.components` + external `ThemeProvider` |
| Async/remote validators | User can use `React.lazy` themselves; core does not provide loading/retry/cache |
| Runtime registry versioning | TypeScript + semver major is sufficient |
| `useFormContext()`-style API | The component is already controlled (`value`/`onChange`); `useRegistry` and `useSchemaBuilderConfig` cover runtime context needs |
| Template literal type safety for validator keys | `Record<string, …>` is adequate for this phase; the target artifact is runtime JSON Schema, not Zod-generated types |
| Removing `React.lazy()` from `TypeEditor` | Lazy imports are the existing circular-dependency boundary; they stay |

---

## Implementation plan: 5 releaseable pull requests

### PR 1 — Registry infrastructure

**Enables:** `SchemaBuilderRegistryProvider`, `useRegistry`, `mergeRegistry`, `defaultRegistry` as public API.  
**Files:** 9 new, 0 changed.  
**Release as:** `1.1.0` — early API access for advanced users.  
**Risk:** Zero — no existing components are touched.

**Tasks:**
1. Create `src/registry/types.ts` with all public types and `@public` JSDoc annotations.
2. Create `src/registry/mergeRegistry.ts` with per-namespace merge contracts (shallow-per-key for all namespaces).
3. Create `src/registry/validatorsHelpers.ts` with `normalizeValidatorDefinition`, `mergeValidatorDefinitions`, `orderValidators`.
4. Create `src/registry/defaults.ts`: default UI primitives (current `ui/*` re-exported as adapters), default layout slots, empty `validators`, `widgets`, `fields`. No imports from `types/*Editor.tsx`.
5. Create `src/registry/SchemaBuilderRegistryContext.tsx`: `SchemaBuilderRegistryProvider` + hooks `useRegistry`, `useComponent`, `useSlot`, `useValidators`, `useWidgetRegistry`, `useFieldRegistry`. Provider merges parent + local value; `undefined` value is no-op.
6. Create `test/registry/mergeRegistry.test.ts`: merge contracts, component override does not remove others, validator same-key override, custom validator key is added, widgets separate from fields.
7. Create `test/registry/provider-nesting.test.tsx`: nested provider with undefined is no-op, nested provider with value merges.
8. Export from `src/registry/index.ts`.

**Check:** `npm run typecheck`, `npm test`, `npm run build`.

---

### PR 2 — Components and slots (Goal 1 achieved)

**Enables:** Users can replace every leaf component and layout slot, making the editor visually identical to any design system.  
**Files:** 15 changed.  
**Release as:** `1.2.0`.

**Tasks:**
1. **SchemaPropertyEditor decomposition.** Split the hardcoded frame into five named slot components (`FieldFrame`, `FieldHeader`, `FieldMain`, `FieldActions`, `FieldBody`) with `data-jsonjoy-slot` marker attributes. Replace direct imports of `Input`, `Badge`, `ButtonToggle` with `useComponent()`.
2. **useComponent in all type editors.** Replace hardcoded `ui/` imports in `StringEditor`, `NumberEditor`, `BooleanEditor`, `ArrayEditor`, `ObjectEditor`, `CombinatorEditor`.
3. **useComponent in feature components.** Replace imports in `InferSchemaDialog`, `ValidateJsonDialog`, `SchemaJsonEditor`, `AddFieldButton`. For dialogs, use `components.SchemaDialog`, not a slot.
4. **Public registry prop.** Add `registry?: SchemaBuilderRegistry` to `SchemaBuilder`, `SchemaFieldsEditor`, `SchemaJsonEditor` prop interfaces. Each wraps its content in `<SchemaBuilderRegistryProvider>`. Provider nesting handles the `SchemaBuilder`→`SchemaFieldsEditor` hierarchy.
5. **Legacy path test.** Ensure `SchemaField`/`SchemaFieldList`/`SchemaPropertyRows` work through `SchemaFieldsEditor` with slot overrides.
6. **Snapshot verification.** Snapshot diffs should show only expected marker attributes and slot wrapper boundaries. Run `npm run test:snapshots`, review diff, commit.
7. **Tests:** `test/registry/components-registry.test.tsx`, `test/registry/slots-registry.test.tsx` — custom `components.Button` renders in place, custom `slots.FieldFrame` renders through `SchemaFieldsEditor`.

**Check:** `npm run typecheck`, `npm test`, `npm run build`.

---

### PR 3 — Validators

**Enables:** Users can add custom constraint editors (e.g. `uniqueItems`, `x-custom:some-key`) and replace default ones.  
**Files:** 13 new + 3 changed.  
**Release as:** `1.3.0`.

**Tasks:**
1. **Default validators.** Create `validators/string/` (`StringLengthValidator`, `StringPatternValidator`, `StringFormatValidator`, `StringEnumValidator` + `index`), `validators/number/` (`NumberRangeValidator`, `NumberMultipleOfValidator`, `NumberEnumValidator`), `validators/array/` (`ArrayItemsCountValidator`, `ArrayUniqueItemsValidator`). Each owns its `useId()` and label/input pairing.
2. **Error filtering helper.** Near validators, `getValidatorErrors(node, paths)` returns filtered `z.ZodIssue[]`.
3. **StringEditor refactor.** Replace hardcoded `Property` union with dynamic `Object.entries(mergedValidators)` loop. Merge `defaultStringValidators` + `useValidators("string")`. Integer: merge `defaultNumberValidators` + `useValidators("number")` + `useValidators("integer")`.
4. **NumberEditor, ArrayEditor refactor.** Same pattern.
5. **Test:** `test/registry/validators-registry.test.tsx` — custom validator is appended, same-key replacement, `order` controls placement, filtered errors, bare-component normalization.

**Check:** `npm run typecheck`, `npm test`, `npm run build`.

---

### PR 4 — Custom field types and widgets (Goal 2 achieved)

**Enables:** Users can register custom field definitions that appear in Add Field UI and persist as `x-jsonjoy-editor`. Users can also override entire type editors via `widgets`.  
**Files:** 11 changed.  
**Release as:** `1.4.0`.

**Tasks:**
1. **EditorKey foundation.** Add `editorKey?: string` to `NewField` in `jsonSchema.ts`. Add `getSchemaEditorKey(schema)` helper in `schemaEditor.ts`. Extend `createFieldSchema` to preserve `x-jsonjoy-editor`.
2. **TypeEditor resolution pipeline.** Rewrite the type switch in `TypeEditor.tsx`:
   - 1) Check `props.editorKey ?? getSchemaEditorKey(schema)`;
   - 2) If editorKey exists and `registry.fields[editorKey]` exists, render custom field;
   - 3) Otherwise check `registry.widgets[type]`;
   - 4) Otherwise fall back to built-in lazy import.
   - Integer branch remains separate (`<NumberEditor integer />`).
3. **TypeDropdown.** Accept `value: string`. Show standard options plus `registry.fields` keys. Deduplicate. Custom key collisions with built-in types are ignored with a warning.
4. **SchemaTypeSelector.** Merge fixed `typeOptions` with `registry.fields` entries. Show `FieldDefinition.label` / `description` for custom entries.
5. **AddFieldButton.** Track `editorKey` state. On submit, set `NewField.editorKey` and use `FieldDefinition.createSchema` (or fall back to `createFieldSchema` with `baseType`).
6. **SchemaFieldList.** `createUpdatedField` reads `getSchemaEditorKey(property.schema)` to preserve custom field identity through rename/required/schema-edit.
7. **getTypeColor/getTypeLabel.** Accept `string` argument with a neutral fallback for unknown keys.
8. **Tests:** `test/registry/widgets-registry.test.tsx` — `widgets.string` replaces StringEditor; `widgets.integer` works. `test/registry/fields-registry.test.tsx` — custom field appears in type selector, creates schema with `x-jsonjoy-editor`, renders custom component.

**Check:** `npm run typecheck`, `npm test`, `npm run build`.

---

### PR 5 — Documentation and demo

**Enables:** Users can learn the API through documented examples.  
**Files:** README + 2 demo files.  
**Release as:** `1.5.0` (or ship with PR 4).

**Tasks:**
1. **README.** Insert "Plugin Registry" section between the existing "Localization" and "Supported Schema Features" sections. Include:
   - Overview of the 5 namespaces with code examples.
   - "Integration with MUI / Chakra" subsection showing the external ThemeProvider pattern.
   - "CSS variables and custom components" notes.
2. **Demo page.** Create `demo/pages/CustomRegistry.tsx` showing a complete example (custom Button/Input/Switch, custom FieldFrame slot, custom unique validator, custom field definition). Import into `demo/pages/Index.tsx` (no router).

**Check:** `npm run typecheck`, `npm test`, `npm run build`. Demo runs without errors.

---

## Acceptance criteria (applies to the entire plan, verified at each PR)

1. Existing usage without `registry` produces identical behavior and output (except for approved marker attributes/wrapper boundaries).
2. The existing `SchemaBuilderProvider` (i18n) is not refactored or renamed.
3. `registry/defaults.ts` does not import built-in type editors or validators.
4. All public API symbols carry `@public` JSDoc annotations and pass API Extractor.
5. `npm run typecheck`, `npm test`, `npm run check`, `npm run build` pass.
6. Bundle size impact is modest (dist increase tracked per PR; investigate if >10 KB gzipped equivalent).
7. Custom `components.Button` renders in place of the internal button across all editor paths.
8. Custom `validators.string.unique` appears in the string editor and updates the schema.
9. Custom `fields["x-vendor:slug"]` appears in Add Field type selector, creates schema with `x-jsonjoy-editor`, renders custom component, and survives rename/edit.
10. `widgets.integer` receives integer schemas without losing integer semantics (`step=1`, etc.).
11. Provider nesting: `SchemaFieldsEditor` inside `SchemaBuilder` uses the outer registry without overriding it.

---

## Verification commands (every PR)

```bash
npm run typecheck
npm test
npm run check
npm run build
```

- `typecheck` — TypeScript compilation.
- `test` — Node test runner with React Testing Library.
- `check` — Biome lint + format check.
- `build` — rslib build with API Extractor, validates emitted `.d.ts` and public exports.
