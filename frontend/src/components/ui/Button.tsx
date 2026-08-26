import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const baseStyles =
  "focus-ring inline-flex items-center justify-center gap-2 rounded-md font-medium " +
  "transition-colors duration-150 disabled:opacity-50 disabled:pointer-events-none";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-gradient text-white shadow-glow-sm hover:brightness-110 active:brightness-95",
  secondary:
    "bg-surface text-foreground border border-border-strong hover:bg-surface-hover",
  ghost: "text-foreground-muted hover:text-foreground hover:bg-surface",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

/**
 * HUMANORA primary UI button. Three variants matching the reference design:
 * primary (brand gradient CTA), secondary (bordered surface), ghost (text-only).
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
