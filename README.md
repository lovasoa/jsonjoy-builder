# JSON Schema Builder

[![image](https://github.com/user-attachments/assets/6be1cecf-e0d9-4597-ab04-7124e37e332d)](https://json.ophir.dev)

A modern, React-based visual JSON Schema editor for creating and manipulating JSON Schema definitions with an intuitive interface.

**Try online**: https://json.ophir.dev

## Features

- **Visual Schema Editor**: Design your JSON Schema through an intuitive interface without writing raw JSON
- **Real-time JSON Preview**: See your schema in JSON format as you build it visually
- **Schema Inference**: Generate schemas automatically from existing JSON data
- **JSON Validation**: Test JSON data against your schema with detailed validation feedback
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices

## Getting Started

### Installing

```bash
npm install jsonjoy-builder
```

Also install react if you haven't done so yet.

Then use like this:

```jsx
import "jsonjoy-builder/styles.css";
import { type JSONSchema, SchemaVisualEditor } from "jsonjoy-builder";
import { useState } from "react";

export function App() {
  const [schema, setSchema] = useState<JSONSchema>({});
  return (
    <div>
      <h1>JSONJoy Builder</h1>
      <SchemaVisualEditor schema={schema} onChange={setSchema}/>
    </div>
  );
}
```

### Styling

To style the component, add custom CSS. For basic styling, there are some CSS custom properties ("variables)
you can set:

```css
.jsonjoy {
  --jsonjoy-background: #f8fafc;
  --jsonjoy-foreground: #020817;
  --jsonjoy-card: #fff;
  --jsonjoy-card-foreground: #020817;
  --jsonjoy-popover: #fff;
  --jsonjoy-popover-foreground: #020817;
  --jsonjoy-primary: #0080ff;
  --jsonjoy-primary-foreground: #f8fafc;
  --jsonjoy-secondary: #f1f5f9;
  --jsonjoy-secondary-foreground: #0f172a;
  --jsonjoy-muted: #f1f5f9;
  --jsonjoy-muted-foreground: #64748b;
  --jsonjoy-accent: #f1f5f9;
  --jsonjoy-accent-foreground: #0f172a;
  --jsonjoy-destructive: #ef4444;
  --jsonjoy-destructive-foreground: #f8fafc;
  --jsonjoy-border: #e2e8f0;
  --jsonjoy-input: #e2e8f0;
  --jsonjoy-ring: #020817;
  --jsonjoy-radius: .8rem;
  --jsonjoy-font-sans: "Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
.jsonjoy.dark {
  /** same, but for dark mode */
}
```

### Localization

By default, the editor uses English. To localize, you need to set a language via the `TranslationContext`:

```jsx
import "jsonjoy-builder/styles.css";
import { type JSONSchema, SchemaVisualEditor, TranslationContext, de } from "jsonjoy-builder";
import { useState } from "react";

export function App() {
  const [schema, setSchema] = useState<JSONSchema>({});
  return (
    <TranslationContext value={de}>
      <SchemaVisualEditor schema={schema} onChange={setSchema}/>
    </TranslationContext>
  );
}
```

Currently we have localizations for English, German, French and Russian. You can define your own translation like this.
If you do, consider opening a PR with the translations!

```ts
import { type Translation } from "jsonjoy-builder";

const es: Translation = {
	// add translations here (see type Translation for the available keys and default values)
};
```

See also the [English localizations file](https://github.com/lovasoa/jsonjoy-builder/blob/main/src/i18n/locales/en.ts) for the default localizations.

### Development

```bash
git clone https://github.com/lovasoa/jsonjoy-builder.git
cd jsonjoy-builder
npm install
```

Start the development server:

```bash
npm run dev
```

The demo application will be available at http://localhost:5173

### Building for Production

Build this library for production:

```bash
npm run build
```

The built files will be available in the `dist` directory.

## Project Architecture

### Core Components

- **JsonSchemaEditor**: The main component that provides tabs for switching between visual and JSON views
- **SchemaVisualEditor**: Handles the visual representation and editing of schemas
- **JsonSchemaVisualizer**: Provides JSON view with Monaco editor for direct schema editing
- **SchemaInferencer**: Dialog component for generating schemas from JSON data
- **JsonValidator**: Dialog component for validating JSON against the current schema

### Key Features

#### Schema Inference

The `SchemaInferencer` component can automatically generate JSON Schema definitions from existing JSON data. This feature uses a recursion-based inference system to detect:

- Object structures and properties
- Array types and their item schemas
- String formats (dates, emails, URIs)
- Numeric types (integers vs. floats)
- Required fields

#### JSON Validation

Validate any JSON document against your schema with:
- Real-time feedback
- Detailed error reporting
- Format validation for emails, dates, and other special formats

## Technology Stack

- **React**: UI framework
- **TypeScript**: Type-safe development
- **Rsbuild** / **Rslib**: Build tool and development server
- **ShadCN UI**: Component library
- **Monaco Editor**: Code editor for JSON viewing/editing
- **Ajv**: JSON Schema validation
- **Zod**: Type-safe json parsing in ts
- **Lucide Icons**: Icon library
- **Node.js Test Runner**: Simple built-in testing

## Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build with development settings |
| `npm run lint` | Run linter |
| `npm run format` | Format code |
| `npm run check` | Type check the project |
| `npm run fix` | Fix linting issues |
| `npm run typecheck` | Type check with TypeScript |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests |

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Author

[@ophir.dev](https://ophir.dev)
