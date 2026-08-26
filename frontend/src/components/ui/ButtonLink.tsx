import Link, { type LinkProps } from "next/link";
import type { AnchorHTMLAttributes } from "react";
import { buttonBaseStyles, buttonSizeStyles, buttonVariantStyles, type ButtonSize, type ButtonVariant } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export interface ButtonLinkProps
  extends LinkProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/**
 * A CTA that navigates (to another route, or to an in-page anchor like
 * "/#pricing") rendered with Button's exact visual styling. Use this
 * instead of <Button onClick={() => router.push(...)}> — a navigation
 * action should be a real, keyboard/middle-click/right-click-friendly
 * link, not a button pretending to be one.
 */
export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonBaseStyles, buttonVariantStyles[variant], buttonSizeStyles[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}
