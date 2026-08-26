import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type ContainerProps = HTMLAttributes<HTMLDivElement>;

/**
 * Responsive content container with consistent max-width and horizontal
 * padding across breakpoints. Use for landing-page sections and app views.
 */
export function Container({ className, ...props }: ContainerProps) {
  return (
    <div
      className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}
      {...props}
    />
  );
}
