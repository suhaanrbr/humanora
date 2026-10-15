import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * The marketing site's one section-opening pattern, borrowed from print:
 * a hairline rule across the column, the section's name set small in
 * the left margin, and the headline and standfirst to its right. Every
 * section opens the same way so the page reads as one publication, but
 * what follows the header is composed per section.
 */
export function SectionHeader({
  label,
  title,
  children,
  className,
}: {
  label: string;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 gap-4 border-t border-border pt-6 lg:grid-cols-12 lg:gap-10", className)}>
      <p className="eyebrow pt-1 lg:col-span-3">{label}</p>
      <div className="lg:col-span-9">
        <h2 className="max-w-3xl text-4xl leading-[1.08] text-foreground sm:text-5xl">{title}</h2>
        {children && (
          <div className="mt-5 max-w-2xl text-lg leading-relaxed text-foreground-muted">{children}</div>
        )}
      </div>
    </div>
  );
}
