export {
  defaultComponents,
  defaultRegistry,
  defaultSlots,
} from "./defaults.tsx";
export { mergeRegistry } from "./mergeRegistry.ts";
export {
  SchemaBuilderRegistryProvider,
  useComponent,
  useRegistry,
  useSlot,
  useSlotProps,
} from "./SchemaBuilderRegistryContext.tsx";
export type {
  BadgeProps,
  // Component adapters
  ButtonProps,
  ButtonToggleProps,
  FieldActionsSlotProps,
  FieldBodySlotProps,
  FieldFrameSlotProps,
  FieldHeaderSlotProps,
  FieldMainSlotProps,
  FullscreenToggleSlotProps,
  InputProps,
  LabelProps,
  MobileMode,
  MobileModeSwitchSlotProps,
  SchemaBuilderComponents,
  // Root
  SchemaBuilderRegistry,
  SchemaBuilderSlotProps,
  SchemaBuilderSlots,
  SchemaDialogProps,
  // Slots
  SlotChildrenProps,
  SwitchProps,
} from "./types.ts";
