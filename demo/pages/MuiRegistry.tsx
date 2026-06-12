import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CssBaseline from "@mui/material/CssBaseline";
import FormLabel from "@mui/material/FormLabel";
import Paper from "@mui/material/Paper";
import Switch from "@mui/material/Switch";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import ToggleButton from "@mui/material/ToggleButton";
import { useState } from "react";
import {
  type JsonSchema,
  SchemaBuilderRegistryProvider,
  SchemaFieldsEditor,
} from "../../src/index.ts";

// ── MUI theme ───────────────────────────────────────────────────────────────

const theme = createTheme({
  palette: { primary: { main: "#1976d2" } },
  typography: { fontFamily: "Roboto, Helvetica, Arial, sans-serif" },
});

// Remap library CSS tokens to MUI palette so non-registry-controlled surfaces
// (type dropdown, field name button, icons) still adopt MUI colours.
const muiTokenOverrides = `
.jsonjoy {
  --background: #ffffff;
  --foreground: rgba(0, 0, 0, 0.87);
  --card: #ffffff;
  --card-foreground: rgba(0, 0, 0, 0.87);
  --primary: #1976d2;
  --primary-foreground: #ffffff;
  --secondary: #f5f5f5;
  --secondary-foreground: rgba(0, 0, 0, 0.87);
  --muted: #f5f5f5;
  --muted-foreground: rgba(0, 0, 0, 0.6);
  --accent: #e3f2fd;
  --accent-foreground: #1976d2;
  --destructive: #d32f2f;
  --destructive-foreground: #ffffff;
  --border: rgba(0, 0, 0, 0.12);
  --input: rgba(0, 0, 0, 0.23);
  --ring: #1976d2;
  --radius: 4px;
  font-family: Roboto, Helvetica, Arial, sans-serif;
}`;

// ── Component adapters ───────────────────────────────────────────────────────

// biome-ignore lint/suspicious/noExplicitAny: adapters intentionally accept the library's loose prop contracts
type AnyProps = any;

const muiButtonVariant = (v?: string) =>
  v === "outline"
    ? "outlined"
    : v === "ghost" || v === "link"
      ? "text"
      : "contained";

function MuiButton({
  children,
  variant,
  size,
  className: _c,
  ...rest
}: AnyProps) {
  return (
    <Button
      {...rest}
      variant={muiButtonVariant(variant)}
      color={variant === "destructive" ? "error" : "primary"}
      size={size === "lg" ? "large" : "small"}
      sx={{ textTransform: "none", minWidth: 0 }}
    >
      {children}
    </Button>
  );
}

function MuiInput({
  className: _c,
  type,
  step,
  min,
  max,
  "aria-invalid": ariaInvalid,
  ...rest
}: AnyProps) {
  // `label` arrives via {...rest} and folds into the TextField as an integrated caption.
  return (
    <TextField
      {...rest}
      type={type}
      variant="outlined"
      size="small"
      error={ariaInvalid === true}
      slotProps={{ htmlInput: { step, min, max } }}
    />
  );
}

function MuiSwitch({ checked, onCheckedChange, disabled, id }: AnyProps) {
  return (
    <Switch
      id={id}
      checked={!!checked}
      disabled={disabled}
      size="small"
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  );
}

function MuiBadge({ children, variant }: AnyProps) {
  return (
    <Chip
      label={children}
      size="small"
      variant={variant === "outline" ? "outlined" : "filled"}
      color={
        variant === "destructive"
          ? "error"
          : variant === "secondary"
            ? "default"
            : "primary"
      }
    />
  );
}

function MuiLabel({ children, htmlFor }: AnyProps) {
  return <FormLabel htmlFor={htmlFor}>{children}</FormLabel>;
}

function MuiButtonToggle({
  children,
  onClick,
  disabled,
  "aria-pressed": ariaPressed,
}: AnyProps) {
  const selected = ariaPressed === true || ariaPressed === "true";
  return (
    <ToggleButton
      value="toggle"
      selected={selected}
      onClick={onClick}
      disabled={disabled}
      color="primary"
      size="small"
      sx={{ textTransform: "none", py: 0.25, px: 1.5 }}
    >
      {children}
    </ToggleButton>
  );
}

// ── Slot adapters ────────────────────────────────────────────────────────────

function MuiFieldFrame({ children, hasErrors }: AnyProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 1,
        p: 1,
        borderColor: hasErrors ? "error.main" : "divider",
        borderRadius: 1,
      }}
    >
      {children}
    </Paper>
  );
}

function MuiFieldHeader({ children }: AnyProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      {children}
    </Box>
  );
}

function MuiFieldActions({ children }: AnyProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      {children}
    </Box>
  );
}

function MuiFieldBody({ children }: AnyProps) {
  return (
    <Box sx={{ mt: 1, pt: 1, borderTop: 1, borderColor: "divider" }}>
      {children}
    </Box>
  );
}

// ── Registry object ──────────────────────────────────────────────────────────

const muiRegistry = {
  components: {
    Button: MuiButton as never,
    Input: MuiInput as never,
    Switch: MuiSwitch as never,
    Badge: MuiBadge as never,
    Label: MuiLabel as never,
    ButtonToggle: MuiButtonToggle as never,
  },
  slots: {
    FieldFrame: MuiFieldFrame as never,
    FieldHeader: MuiFieldHeader as never,
    FieldActions: MuiFieldActions as never,
    FieldBody: MuiFieldBody as never,
  },
};

// ── Sample schema ────────────────────────────────────────────────────────────

const sampleSchema: JsonSchema = {
  type: "object",
  properties: {
    name: { type: "string", minLength: 2, maxLength: 100 },
    age: { type: "integer", minimum: 0, maximum: 150 },
    email: { type: "string", format: "email" },
    isActive: { type: "boolean" },
    tags: { type: "array", items: { type: "string" } },
    metadata: {
      type: "object",
      properties: { created: { type: "string", format: "date-time" } },
      additionalProperties: false,
    },
  },
  required: ["name", "email"],
};

// ── Page ─────────────────────────────────────────────────────────────────────

const MuiRegistry = () => {
  const [schema, setSchema] = useState<JsonSchema>(sampleSchema);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static CSS token override */}
      <style dangerouslySetInnerHTML={{ __html: muiTokenOverrides }} />

      <Box sx={{ maxWidth: 800, mx: "auto", px: 3, py: 6 }}>
        <Box sx={{ mb: 4 }}>
          <Box
            component="span"
            sx={{
              display: "inline-block",
              bgcolor: "primary.50",
              color: "primary.main",
              px: 1.5,
              py: 0.5,
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 600,
              mb: 1.5,
              border: "1px solid",
              borderColor: "primary.200",
            }}
          >
            Registry Demo
          </Box>
          <Box
            component="h1"
            sx={{ fontSize: 28, fontWeight: 700, mb: 1, mt: 0 }}
          >
            Material UI Design System
          </Box>
          <Box
            component="p"
            sx={{ color: "text.secondary", fontSize: 15, m: 0 }}
          >
            The editor below is rendered entirely with{" "}
            <strong>@mui/material</strong> components via{" "}
            <code>SchemaBuilderRegistryProvider</code>. Swap the registry to
            match any other design system — the library ships no visual opinion.
          </Box>
        </Box>

        <SchemaBuilderRegistryProvider value={muiRegistry}>
          <SchemaFieldsEditor value={schema} onChange={setSchema} />
        </SchemaBuilderRegistryProvider>

        <Box
          sx={{
            mt: 4,
            p: 2,
            bgcolor: "grey.50",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            fontSize: 13,
            fontFamily: "monospace",
            overflowX: "auto",
            whiteSpace: "pre",
            color: "text.secondary",
          }}
        >
          {`import { SchemaBuilderRegistryProvider } from "jsonjoy-builder";
import TextField from "@mui/material/TextField";
// ... other MUI imports

const muiRegistry = {
  components: {
    Input: ({ label, "aria-invalid": error, ...rest }) => (
      <TextField {...rest} label={label} error={error} variant="outlined" size="small" />
    ),
    // Button, Switch, Badge, ButtonToggle, Label ...
  },
  slots: {
    FieldFrame: ({ children, hasErrors }) => (
      <Paper variant="outlined" sx={{ mb: 1, borderColor: hasErrors ? "error.main" : "divider" }}>
        {children}
      </Paper>
    ),
    // FieldHeader, FieldActions, FieldBody ...
  },
};

<SchemaBuilderRegistryProvider value={muiRegistry}>
  <SchemaBuilder value={schema} onChange={setSchema} />
</SchemaBuilderRegistryProvider>`}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default MuiRegistry;
