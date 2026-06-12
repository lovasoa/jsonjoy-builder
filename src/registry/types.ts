// ──────────────────────────────────────────────
// Component prop types (adapter contracts)
// ──────────────────────────────────────────────

/**
 * Minimal prop contract for adapter components.
 * Users wrap their design-system primitives to match these shapes.
 */

/** @public */
export interface ButtonProps {
  children?: React.ReactNode;
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  form?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

/** @public */
export interface InputProps {
  /**
   * Field label. When provided, the Input is responsible for rendering it
   * (e.g. MUI `TextField label=…`). Lets design-system adapters integrate the
   * label into the control instead of receiving a separate `Label`.
   */
  label?: React.ReactNode;
  value?: string | number | readonly string[];
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onFocus?: React.FocusEventHandler<HTMLInputElement>;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>;
  placeholder?: string;
  className?: string;
  id?: string;
  autoFocus?: boolean;
  required?: boolean;
  disabled?: boolean;
  type?: string;
  step?: string | number;
  min?: string | number;
  max?: string | number;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-describedby"?: string;
}

/** @public */
export interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
}

/** @public */
export interface LabelProps {
  children?: React.ReactNode;
  className?: string;
  htmlFor?: string;
}

/** @public */
export interface BadgeProps {
  children?: React.ReactNode;
  className?: string;
  variant?: "default" | "secondary" | "destructive" | "outline";
}

/** @public */
export interface ButtonToggleProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  /**
   * Whether the toggle is in its active/"on" state. Lets a design-system
   * adapter render the two states distinctly (e.g. MUI `ToggleButton selected`).
   */
  "aria-pressed"?: boolean | "true" | "false";
}

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
  Switch: React.ComponentType<SwitchProps>;
  Label: React.ComponentType<LabelProps>;
  Badge: React.ComponentType<BadgeProps>;
  ButtonToggle: React.ComponentType<ButtonToggleProps>;
  SchemaDialog: React.ComponentType<SchemaDialogProps>;
}

// ──────────────────────────────────────────────
// Slots
// ──────────────────────────────────────────────

/** @public */
export interface SlotChildrenProps {
  children: React.ReactNode;
  className?: string;
}

/** @public */
export type MobileMode = "visual" | "json";

/** @public */
export interface MobileModeSwitchSlotProps {
  mode: MobileMode;
  onChange: (mode: MobileMode) => void;
  children?: React.ReactNode;
}

/** @public */
export interface FullscreenToggleSlotProps {
  isFullscreen: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}

/** @public */
export interface FieldFrameSlotProps extends SlotChildrenProps {
  depth?: number;
  expanded?: boolean;
  hasErrors?: boolean;
}

/** @public */
export type FieldHeaderSlotProps = SlotChildrenProps;

/** @public */
export type FieldMainSlotProps = SlotChildrenProps;

/** @public */
export type FieldActionsSlotProps = SlotChildrenProps;

/** @public */
export type FieldBodySlotProps = SlotChildrenProps;

/** @public */
export interface SchemaBuilderSlots {
  /** Wraps the entire editor tree. Override to add a root container or theme boundary. */
  Root: React.ComponentType<SlotChildrenProps>;
  /** Mobile toggle between visual and JSON editing modes. */
  MobileModeSwitch: React.ComponentType<MobileModeSwitchSlotProps>;
  /** Fullscreen toggle control in the toolbar. */
  FullscreenToggle: React.ComponentType<FullscreenToggleSlotProps>;
  /** Outer card/container for a single schema property row. Receives `depth`, `expanded`, and `hasErrors`. */
  FieldFrame: React.ComponentType<FieldFrameSlotProps>;
  /** Left section of the property header — expand button, field name, description, and type dropdown. */
  FieldHeader: React.ComponentType<FieldHeaderSlotProps>;
  /** Reserved for future use; currently a passthrough. */
  FieldMain: React.ComponentType<FieldMainSlotProps>;
  /** Right section of the property header — error badge and delete button. */
  FieldActions: React.ComponentType<FieldActionsSlotProps>;
  /** Expanded area beneath the header — contains the type-specific options editor. */
  FieldBody: React.ComponentType<FieldBodySlotProps>;
}

/** @public */
export type SchemaBuilderSlotProps = Partial<{
  [K in keyof SchemaBuilderSlots]: Record<string, unknown>;
}>;

// ──────────────────────────────────────────────
// Root registry
// ──────────────────────────────────────────────

/** @public */
export interface SchemaBuilderRegistry {
  components?: Partial<SchemaBuilderComponents>;
  slots?: Partial<SchemaBuilderSlots>;
  slotProps?: SchemaBuilderSlotProps;
}
