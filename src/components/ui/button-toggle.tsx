import { type ComponentProps, forwardRef } from "react";
import { cn } from "../../lib/utils.ts";

const ButtonToggle = forwardRef<HTMLButtonElement, ComponentProps<"button">>(
  ({ className, onClick, children, ...props }, ref) => {
    return (
      <button
        type="button"
        ref={ref}
        onClick={onClick}
        className={cn(
          "text-xs px-2 py-1 rounded-md font-medium min-w-[80px] text-center cursor-pointer hover:shadow-xs hover:ring-2 hover:ring-ring/30 active:scale-95 transition-all whitespace-nowrap",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
ButtonToggle.displayName = "ButtonToggle";

export { ButtonToggle };
