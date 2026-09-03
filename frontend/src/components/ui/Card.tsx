import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type CardProps = HTMLAttributes<HTMLDivElement>;

/**
 * HUMANORA card surface: rounded corners, thin border, soft ambient
 * shadow. The base unit for dashboard panels, pricing tiles, and
 * content blocks — genuinely translucent (reusing `.glass-panel`'s
 * recipe, the same one already used across the cinematic landing
 * scenes and Profile) rather than a solid opaque fill, so the same
 * "glass over a lit environment" material reads consistently
 * everywhere this component is used: landing, auth, dashboard, and
 * every dashboard sub-page. Text stays legible via each element's own
 * color/weight (the semantic `text-foreground`/`text-foreground-muted`
 * tokens already carry enough contrast on their own), not via an
 * opaque backing.
 */
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "glass-panel rounded-lg shadow-card",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col gap-1 p-5 pb-0", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold text-foreground", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn("text-sm text-foreground-muted", className)} {...props} />
  );
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
