import type * as Monaco from "monaco-editor";
import { useEffect, useState } from "react";
import { registerJsonSchemaLanguage } from "../utils/monaco-json-schema-language.ts";

export interface MonacoEditorOptions {
  minimap?: { enabled: boolean };
  fontSize?: number;
  fontFamily?: string;
  lineNumbers?: "on" | "off";
  roundedSelection?: boolean;
  scrollBeyondLastLine?: boolean;
  readOnly?: boolean;
  automaticLayout?: boolean;
  formatOnPaste?: boolean;
  formatOnType?: boolean;
  tabSize?: number;
  insertSpaces?: boolean;
  detectIndentation?: boolean;
  folding?: boolean;
  foldingStrategy?: "auto" | "indentation";
  renderLineHighlight?: "all" | "line" | "none" | "gutter";
  matchBrackets?: "always" | "near" | "never";
  autoClosingBrackets?:
    | "always"
    | "languageDefined"
    | "beforeWhitespace"
    | "never";
  autoClosingQuotes?:
    | "always"
    | "languageDefined"
    | "beforeWhitespace"
    | "never";
  guides?: {
    bracketPairs?: boolean;
    indentation?: boolean;
  };
  stickyScroll?: { enabled: boolean };
  showFoldingControls?: "always" | "never" | "mouseover";
}

export const defaultEditorOptions: MonacoEditorOptions = {
  minimap: { enabled: false },
  fontSize: 14,
  fontFamily: "var(--font-sans), 'SF Mono', Monaco, Menlo, Consolas, monospace",
  lineNumbers: "on",
  roundedSelection: false,
  scrollBeyondLastLine: false,
  readOnly: false,
  automaticLayout: true,
  formatOnPaste: true,
  formatOnType: true,
  tabSize: 2,
  insertSpaces: true,
  detectIndentation: true,
  folding: true, // Enable folding for object/array scopes
  showFoldingControls: 'mouseover', // Show folding controls on hover
  foldingStrategy: "indentation", // Use indentation-based folding
  stickyScroll: { enabled: false }, // Keep sticky scroll disabled
  renderLineHighlight: "all",
  matchBrackets: "always",
  autoClosingBrackets: "always",
  autoClosingQuotes: "always",
  guides: {
    bracketPairs: true,
    indentation: true,
  },
};

export function useMonacoTheme() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Check for dark mode by examining CSS variables
  useEffect(() => {
    const checkDarkMode = () => {
      // Get the current background color value
      const backgroundColor = getComputedStyle(document.documentElement)
        .getPropertyValue("--background")
        .trim();

      // If the background color HSL has a low lightness value, it's likely dark mode
      const isDark =
        backgroundColor.includes("222.2") ||
        backgroundColor.includes("84% 4.9%");

      setIsDarkMode(isDark);
    };

    // Check initially
    checkDarkMode();

    // Set up a mutation observer to detect theme changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style"],
    });

    return () => observer.disconnect();
  }, []);

  const defineMonacoThemes = (monaco: typeof Monaco) => {
    // Register custom JSON Schema language for semantic colorization
    registerJsonSchemaLanguage(monaco);

    // Define custom light theme with vibrant, distinguishable colors
    monaco.editor.defineTheme("appLightTheme", {
      base: "vs",
      inherit: true,
      rules: [
        // Property keys - vibrant colors
        { token: "key", foreground: "0284C7", fontStyle: "bold" }, // Property keys (sky-600, bold)
        { token: "schema-keyword-key", foreground: "0369A1", fontStyle: "bold" }, // Schema keywords (sky-700, bold)
        
        // Semantic type colorization - MATCHING VISUAL UI COLORS from utils.ts
        { token: "type-string-value", foreground: "3B82F6", fontStyle: "bold" }, // blue-500 (matches UI)
        { token: "type-number-value", foreground: "A855F7", fontStyle: "bold" }, // purple-500 (matches UI)
        { token: "type-boolean-value", foreground: "22C55E", fontStyle: "bold" }, // green-500 (matches UI)
        { token: "type-object-value", foreground: "F97316", fontStyle: "bold" }, // orange-500 (matches UI)
        { token: "type-array-value", foreground: "EC4899", fontStyle: "bold" }, // pink-500 (matches UI)
        { token: "type-null-value", foreground: "6B7280", fontStyle: "bold" }, // gray-500 (matches UI)
        
        // Default string values - vibrant cyan
        { token: "string", foreground: "0891B2" }, // cyan-600 (vibrant)
        
        // Actual value types - vibrant colors
        { token: "number", foreground: "D946EF" }, // fuchsia-500 (vibrant)
        { token: "boolean", foreground: "10B981" }, // emerald-500 (vibrant)
        { token: "null", foreground: "8B5CF6" }, // violet-500 (vibrant)
        
        // Structure - subtle
        { token: "delimiter", foreground: "64748B" }, // slate-500
      ],
      colors: {
        // Light theme colors
        "editor.background": "#ffffff", // Pure white for better contrast
        "editor.foreground": "#0f172a", // text-slate-900
        "editorCursor.foreground": "#0284C7", // text-sky-600
        "editor.lineHighlightBackground": "#F0F9FF", // bg-sky-50
        "editorLineNumber.foreground": "#94A3B8", // text-slate-400
        "editor.selectionBackground": "#BAE6FD", // bg-sky-200
        "editor.inactiveSelectionBackground": "#E0F2FE", // bg-sky-100
        "editorIndentGuide.background": "#E2E8F0", // border-slate-200
        "editorIndentGuide.activeBackground": "#CBD5E1", // border-slate-300
        "editor.findMatchBackground": "#FDE047", // bg-yellow-300
        "editor.findMatchHighlightBackground": "#FEF08A66", // bg-yellow-200 with opacity
      },
    });

    // Define custom dark theme with vibrant, distinguishable colors
    monaco.editor.defineTheme("appDarkTheme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        // Property keys - vibrant colors
        { token: "key", foreground: "38BDF8", fontStyle: "bold" }, // Property keys (sky-400, bold)
        { token: "schema-keyword-key", foreground: "7DD3FC", fontStyle: "bold" }, // Schema keywords (sky-300, bold)
        
        // Semantic type colorization - MATCHING VISUAL UI COLORS (lighter for dark mode)
        { token: "type-string-value", foreground: "60A5FA", fontStyle: "bold" }, // blue-400 (matches UI pattern)
        { token: "type-number-value", foreground: "C084FC", fontStyle: "bold" }, // purple-400 (matches UI pattern)
        { token: "type-boolean-value", foreground: "4ADE80", fontStyle: "bold" }, // green-400 (matches UI pattern)
        { token: "type-object-value", foreground: "FB923C", fontStyle: "bold" }, // orange-400 (matches UI pattern)
        { token: "type-array-value", foreground: "F472B6", fontStyle: "bold" }, // pink-400 (matches UI pattern)
        { token: "type-null-value", foreground: "9CA3AF", fontStyle: "bold" }, // gray-400 (matches UI pattern)
        
        // Default string values - vibrant cyan
        { token: "string", foreground: "22D3EE" }, // cyan-400 (vibrant)
        
        // Actual value types - vibrant colors
        { token: "number", foreground: "E879F9" }, // fuchsia-400 (vibrant)
        { token: "boolean", foreground: "34D399" }, // emerald-400 (vibrant)
        { token: "null", foreground: "A78BFA" }, // violet-400 (vibrant)
        
        // Structure - subtle
        { token: "delimiter", foreground: "94A3B8" }, // slate-400
      ],
      colors: {
        // Dark theme colors with better contrast
        "editor.background": "#0c1222", // Darker blue-black
        "editor.foreground": "#e2e8f0", // text-slate-200
        "editorCursor.foreground": "#38BDF8", // text-sky-400
        "editor.lineHighlightBackground": "#1e293b66", // subtle highlight
        "editorLineNumber.foreground": "#64748b", // text-slate-500
        "editor.selectionBackground": "#0EA5E966", // bg-sky-500 with opacity
        "editor.inactiveSelectionBackground": "#0369A133", // bg-sky-700 with opacity
        "editorIndentGuide.background": "#1e293b", // border-slate-800
        "editorIndentGuide.activeBackground": "#334155", // border-slate-700
        "editor.findMatchBackground": "#FBBF24", // bg-amber-400
        "editor.findMatchHighlightBackground": "#FDE04766", // bg-yellow-300 with opacity
      },
    });
  };

  // Helper to configure JSON language validation
  const configureJsonDefaults = (
    monaco: typeof Monaco,
    draft: string = '2020-12',
  ) => {
    // Disable all schema validation to prevent Monaco from trying to load meta-schemas
    // We use Ajv for all JSON Schema validation instead
    const diagnosticsOptions: Monaco.languages.json.DiagnosticsOptions = {
      validate: false,            // Disable all validation
      allowComments: false,
      schemas: []
    };

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions(
      diagnosticsOptions,
    );
  };

  return {
    isDarkMode,
    currentTheme: isDarkMode ? "appDarkTheme" : "appLightTheme",
    defineMonacoThemes,
    configureJsonDefaults,
    defaultEditorOptions,
  };
}
