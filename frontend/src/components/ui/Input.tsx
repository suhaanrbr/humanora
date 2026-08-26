import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

/**
 * HUMANORA text input. Dark surface, subtle border, brand-colored focus ring.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "focus-ring h-11 w-full rounded-md border border-border bg-surface px-3.5 text-sm text-foreground",
          "placeholder:text-foreground-subtle",
          "transition-colors duration-150 hover:border-border-strong",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
