import type { ReactNode } from "react";

export interface UseCaseCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

/**
 * Generic icon + title + description tile, reused across the landing
 * page's Use Cases section and the API/Affiliates use-case grids.
 */
export function UseCaseCard({ icon, title, description }: UseCaseCardProps) {
  return (
    <div className="hover-lift group rounded-lg border border-border bg-surface p-6 transition-[background-color] duration-300 hover:border-brand-purple/35 hover:bg-surface-hover hover:shadow-glow-sm">
      <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-md border border-border bg-background-elevated text-brand-purple transition-[border-color,box-shadow] duration-300 group-hover:border-brand-purple/40 group-hover:shadow-glow-sm">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-foreground-muted">{description}</p>
    </div>
  );
}
