import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Shows a spinner in place of the label and disables the button. */
  loading?: boolean;
}

// Exported so ButtonLink (a real <Link>, for CTAs that navigate rather
// than perform an in-page action) can render pixel-identical styling
// without duplicating these class strings.
export const buttonBaseStyles =
  "focus-ring press-feedback inline-flex items-center justify-center gap-2 rounded-md font-semibold cursor-pointer " +
  "transition-[color,background-color,border-color] duration-150 " +
  "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed";

export const buttonVariantStyles: Record<ButtonVariant, string> = {
  // Paper on ink: the highest-contrast thing on any screen, so the one
  // action that matters never needs color or a glow to be found.
  primary: "bg-foreground text-background hover:bg-foreground/88 active:bg-foreground/80",
  secondary:
    "bg-transparent text-foreground border border-border-strong hover:border-foreground/40 hover:bg-surface-hover",
  outline: "bg-transparent text-foreground border border-border-strong hover:bg-surface-hover",
  ghost: "text-foreground-muted hover:text-foreground hover:bg-surface",
  destructive: "bg-danger text-background hover:brightness-110 active:brightness-95",
};

export const buttonSizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-[0.9375rem]",
  md: "h-11 px-5 text-[0.9375rem]",
  lg: "h-12 px-6 text-base",
  // Square, for a single icon with no label — pair with variant="ghost"
  // or "secondary" for a toolbar/header action, never "primary" (an
  // icon-only primary CTA has no accessible label unless the caller
  // adds aria-label, which this size doesn't enforce on its own).
  icon: "h-9 w-9 p-0",
};

/**
 * Humanora primary UI button. Variants: primary (paper-on-ink CTA),
 * secondary (bordered surface), outline (transparent, bordered), ghost
 * (text-only), destructive (danger actions). Pass `loading` to show a
 * spinner and disable interaction during an in-flight action.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        className={cn(buttonBaseStyles, buttonVariantStyles[variant], buttonSizeStyles[size], className)}
        {...props}
      >
        {loading && <Spinner className="h-4 w-4" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

function Spinner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={cn("animate-spin", className)} aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
