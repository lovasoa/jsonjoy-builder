import { type ComponentProps, forwardRef, useEffect, useState } from "react";
import { cn } from "../../lib/utils.ts";

interface InputProps extends ComponentProps<"input"> {
  validate?: (value: string) => string | null;
  showError?: boolean;
  errorMessage?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, validate, showError = true, errorMessage, ...props },
    ref,
  ) => {
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      console.log("handle change");
      const value = e.target.value;
      const validationError = validate?.(value) || null;
      setError(validationError);
      props.onChange?.(e);
    };

    useEffect(() => {
      if (props.value === "") {
        setError(null);
      }
    }, [props.value]);

    const hasError = error || errorMessage;

    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            hasError && "border-red-500 focus-visible:ring-red-500",
            className,
          )}
          ref={ref}
          {...props}
          onChange={handleChange}
        />
        {showError && hasError && (
          <span className="text-red-500 text-sm mt-1 block">
            {errorMessage || error}
          </span>
        )}
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
