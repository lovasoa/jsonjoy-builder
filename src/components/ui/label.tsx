import { type ComponentPropsWithoutRef, forwardRef } from "react";
import { cn } from "../../lib/utils.ts";

const labelClassName =
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

const Label = forwardRef<HTMLLabelElement, ComponentPropsWithoutRef<"label">>(
  ({ className, ...props }, ref) => (
    // biome-ignore lint/a11y/noLabelWithoutControl: The reusable label receives htmlFor or children at call sites.
    <label ref={ref} className={cn(labelClassName, className)} {...props} />
  ),
);
Label.displayName = "Label";

export { Label };
