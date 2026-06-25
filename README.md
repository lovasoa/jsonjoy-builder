# JSONJoy Builder

[![image](https://github.com/user-attachments/assets/6be1cecf-e0d9-4597-ab04-7124e37e332d)](https://json.ophir.dev)

A React component library for building and editing JSON Schema with a visual UI, a JSON source editor, schema inference, and JSON validation.

**Try online**: https://json.ophir.dev

[![NPM Downloads](https://img.shields.io/npm/dw/jsonjoy-builder)](https://www.npmjs.com/package/jsonjoy-builder)
[![NPM Version](https://img.shields.io/npm/v/jsonjoy-builder)](https://www.npmjs.com/package/jsonjoy-builder)
[![NPM License](https://img.shields.io/npm/l/jsonjoy-builder)](https://www.npmjs.com/package/jsonjoy-builder)

## Install

```bash
npm install jsonjoy-builder
```

JSONJoy Builder expects React, React DOM, and Monaco Editor to be available in your app:

```bash
npm install react react-dom monaco-editor
```

Import the stylesheet once, usually in your app entry point:

```tsx
import "jsonjoy-builder/styles.css";
```

## Basic Usage

Use `SchemaBuilder` when you want the full editor: visual editing on one side and editable JSON source on the other.

```tsx
import "jsonjoy-builder/styles.css";
import { SchemaBuilder, type JsonSchema } from "jsonjoy-builder";
import { useState } from "react";

export function App() {
  const [schema, setSchema] = useState<JsonSchema>({
    type: "object",
    properties: {},
  });

  return (
    <SchemaBuilder
      value={schema}
      onChange={setSchema}
      readOnly={false}
    />
  );
}
```

The editor is controlled: pass the current `value`, then persist updates from `onChange`.

## Choosing a Component

`SchemaBuilder` is the best default for application screens. It includes the visual editor, JSON source editor, fullscreen mode, and a draggable split view on desktop.

```tsx
<SchemaBuilder value={schema} onChange={setSchema} readOnly={false} />
```

`SchemaFieldsEditor` renders only the visual schema builder. Use it when your app already has its own source preview, tabs, or surrounding layout.

```tsx
import { SchemaFieldsEditor } from "jsonjoy-builder";

<SchemaFieldsEditor
  value={schema}
  onChange={setSchema}
  readOnly={false}
/>
```

`SchemaJsonEditor` renders only the Monaco JSON editor. It can be read-only or editable depending on whether you pass `readOnly`.

```tsx
import { SchemaJsonEditor } from "jsonjoy-builder";

<SchemaJsonEditor value={schema} onChange={setSchema} />
```

## Working With Schema Changes

Most apps only need to handle the whole-schema change callback:

```tsx
const [schema, setSchema] = useState<JsonSchema>({ type: "object" });

<SchemaBuilder
  value={schema}
  onChange={(nextSchema) => {
    setSchema(nextSchema);
    saveDraft(nextSchema);
  }}
  readOnly={false}
/>
```

For visual-editor-only usage, the same pattern is named `onChange`:

```tsx
<SchemaFieldsEditor
  value={schema}
  onChange={setSchema}
  readOnly={false}
/>
```

For quick setup, omit `value` and start with `defaultValue`:

```tsx
<SchemaBuilder defaultValue={{ type: "object" }} onChange={setSchema} />
```

## Schema Inference

Use `InferSchemaDialog` when you want users to paste example JSON and generate a starting schema.

```tsx
import {
  InferSchemaDialog,
  SchemaBuilder,
  type JsonSchema,
} from "jsonjoy-builder";
import { useState } from "react";

export function App() {
  const [schema, setSchema] = useState<JsonSchema>({ type: "object" });
  const [inferOpen, setInferOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setInferOpen(true)}>
        Infer from JSON
      </button>

      <SchemaBuilder
        value={schema}
        onChange={setSchema}
        readOnly={false}
      />

      <InferSchemaDialog
        open={inferOpen}
        onOpenChange={setInferOpen}
        onInfer={setSchema}
      />
    </>
  );
}
```

Inference detects object properties, arrays, strings, numbers, booleans, required fields, and common string formats such as dates, emails, and URIs.

## JSON Validation

Use `ValidateJsonDialog` when you want users to test JSON data against the current schema.

```tsx
import { ValidateJsonDialog, type JsonSchema } from "jsonjoy-builder";
import { useState } from "react";

export function ValidateButton({ schema }: { schema: JsonSchema }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Validate JSON
      </button>

      <ValidateJsonDialog
        open={open}
        onOpenChange={setOpen}
        schema={schema}
      />
    </>
  );
}
```

Validation runs as the user types and reports syntax errors, schema validation errors, and line or column locations when available.

## External References

By default the editor never loads anything over the network: external `$ref` targets (anything that does not start with `#`) are preserved exactly as written, but cannot be previewed or validated against. To opt in, pass a resolver through the `resolveExternalRef` prop:

```tsx
import { fetchExternalRef, SchemaBuilder, ValidateJsonDialog } from "jsonjoy-builder";

<SchemaBuilder
  value={schema}
  onChange={setSchema}
  resolveExternalRef={fetchExternalRef}
/>

<ValidateJsonDialog
  open={open}
  onOpenChange={setOpen}
  schema={schema}
  resolveExternalRef={fetchExternalRef}
/>
```

With a resolver configured:

- the reference editor loads external documents (e.g. `https://raw.githubusercontent.com/cloudevents/spec/refs/tags/v1.0.2/cloudevents/formats/cloudevents.json`), resolves URI fragments such as `…/schema.json#/definitions/specversion`, and shows the same read-only preview as for local references
- `ValidateJsonDialog` validates documents against schemas that reference external documents, loading them (and any documents they reference in turn) on demand
- each document is loaded at most once per session and failed loads are retried on the next attempt

`fetchExternalRef` is a plain `fetch`-based loader, so the usual browser rules apply: the remote host must allow cross-origin requests. You can also pass your own resolver — anything `(documentUri: string) => Promise<JsonSchema>` — to serve schemas from a registry, a bundle, or an authenticated API. Relative references inside externally loaded documents are not resolved against the document's base URI.

## Themes and Styling

JSONJoy Builder ships with default light and dark theme variables. All exported components include a `.jsonjoy` wrapper, so you can theme one editor instance or your whole app.

```css
.jsonjoy {
  --background: hsl(210 40% 98%);
  --foreground: hsl(222.2 84% 4.9%);
  --card: hsl(0 0% 100%);
  --card-foreground: hsl(222.2 84% 4.9%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(222.2 84% 4.9%);
  --primary: hsl(210 100% 50%);
  --primary-foreground: hsl(210 40% 98%);
  --secondary: hsl(210 40% 96.1%);
  --secondary-foreground: hsl(222.2 47.4% 11.2%);
  --muted: hsl(210 40% 96.1%);
  --muted-foreground: hsl(215.4 16.3% 46.9%);
  --accent: hsl(210 40% 96.1%);
  --accent-foreground: hsl(222.2 47.4% 11.2%);
  --destructive: hsl(0 84.2% 60.2%);
  --destructive-foreground: hsl(210 40% 98%);
  --border: hsl(214.3 31.8% 91.4%);
  --input: hsl(214.3 31.8% 91.4%);
  --ring: hsl(222.2 84% 4.9%);
  --radius: 0.8rem;
  --font-sans: "Inter", system-ui, sans-serif;
}
```

For dark mode, add `dark` to the `.jsonjoy` element or to one of its ancestors:

```tsx
<div className="dark">
  <SchemaBuilder value={schema} onChange={setSchema} readOnly={false} />
</div>
```

Monaco automatically follows the detected light or dark JSONJoy theme.

## Localization

The default language is English. Pass a bundled locale directly to the component for simple localization.

```tsx
import {
  SchemaBuilder,
  de,
} from "jsonjoy-builder";

<SchemaBuilder value={schema} onChange={setSchema} locale={de} />
```

Bundled locales are exported for English, German, Spanish, French, Polish, Russian, Ukrainian, and Chinese.

For app-wide defaults, wrap a section in `SchemaBuilderProvider`:

```tsx
import { SchemaBuilderProvider, fr } from "jsonjoy-builder";

<SchemaBuilderProvider locale={fr} messages={{ schemaEditorTitle: "Schema" }}>
  <SchemaBuilder value={schema} onChange={setSchema} />
</SchemaBuilderProvider>
```

You can also provide your own translation object or override individual messages:

```ts
import { type Translation } from "jsonjoy-builder";

const customTranslation: Translation = {
  // Add every key from the Translation type.
};
```

Use [`src/i18n/locales/en.ts`](https://github.com/lovasoa/jsonjoy-builder/blob/main/src/i18n/locales/en.ts) as the reference for all available keys.

## Plugin Registry

The `registry` prop lets you replace any UI component or layout slot with your own design-system adapter. It works on `<SchemaBuilder>`, `<SchemaFieldsEditor>`, and `<SchemaJsonEditor>`.

### Replace leaf components

```tsx
import { SchemaBuilder } from "jsonjoy-builder";

<SchemaBuilder
  value={schema}
  onChange={setSchema}
  registry={{
    components: {
      Button: MyButton,   // any React component matching ButtonProps
      Input: MyInput,
      Switch: MySwitch,
    },
  }}
/>
```

### Replace layout slots

```tsx
<SchemaBuilder registry={{
  slots: {
    // Layout wrappers that receive children and visual metadata
    FieldFrame: MyFieldFrame,
    FieldHeader: MyFieldHeader,
    FieldMain: MyFieldMain,
    FieldActions: MyFieldActions,
    FieldBody: MyFieldBody,
  },
  slotProps: {
    // Extra props forwarded to each slot component
    FieldFrame: { variant: "compact" },
  },
}}>
```

### Integration with a design system

```tsx
// Wrap in your own ThemeProvider, pass adapters via registry
import { ThemeProvider, Button, TextField, Switch } from "./design-system";

const adapters = {
  Button: (props) => <Button variant="contained" {...props} />,
  Input: (props) => <TextField size="small" {...props} />,
  Switch: (props) => <Switch {...props} />,
};

function MySchemaEditor() {
  return (
    <ThemeProvider>
      <SchemaBuilder
        registry={{ components: adapters }}
        // ...
      />
    </ThemeProvider>
  );
}
```

### API reference

| Prop | Type | Purpose |
|---|---|---|
| `registry.components` | `Partial<SchemaBuilderComponents>` | Replace leaf primitives (Button, Input, Switch, Badge, Label, ButtonToggle, SchemaDialog) |
| `registry.slots` | `Partial<SchemaBuilderSlots>` | Replace layout wrappers (FieldFrame, FieldHeader, FieldMain, FieldActions, FieldBody, Root, MobileModeSwitch, FullscreenToggle) |
| `registry.slotProps` | `Partial<Record<string, Record<string, unknown>>>` | Extra props for each slot |

All public types carry `/** @public */` and are exported from the package entry point.

## Supported Schema Features

The visual editor covers the common schema authoring flow:

- Object fields and nested objects
- Pattern properties for regex-matched property names
- Required and optional fields
- Strings, numbers, booleans, arrays, objects, and null values
- String length, regex pattern, and format constraints
- Number range, exclusivity, multiple-of, and enum constraints
- Array item type, length, uniqueness, and contains constraints
- Boolean allowed-value constraints
- `anyOf`, `oneOf`, and `allOf` composition
- `$ref` references with a definition picker, broken-reference warnings, and a read-only preview of the referenced schema; external references can be loaded through the opt-in `resolveExternalRef` prop
- Reusable definitions (`$defs` and legacy `definitions`): create, edit, and delete them in the visual editor; renaming a definition rewrites every `$ref` that points at it
- `additionalProperties` controls

You can still edit unsupported JSON Schema keywords directly in the JSON source editor.

## Development

```bash
git clone https://github.com/lovasoa/jsonjoy-builder.git
cd jsonjoy-builder
npm install
npm run dev
```

The demo application runs at http://localhost:5173.

Build the library:

```bash
npm run build
```

Common scripts:

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the demo development server |
| `npm run build` | Build the library for production |
| `npm run build:demo` | Build the demo app |
| `npm run preview` | Preview the production demo build |
| `npm run check` | Run Biome checks |
| `npm run fix` | Fix Biome issues |
| `npm run typecheck` | Type check with TypeScript |
| `npm run test` | Run tests |

## License

MIT

## Author

[@ophir.dev](https://ophir.dev)
