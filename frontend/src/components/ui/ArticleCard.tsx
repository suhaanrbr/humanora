import { Badge } from "@/components/ui/Badge";

export interface ArticleCardProps {
  category: string;
  title: string;
  excerpt: string;
  readTime: string;
  featured?: boolean;
}

/**
 * Blog article tile. Sample/editorial content only — see /blog for the
 * disclosure that these are launch placeholders, not a full archive.
 */
export function ArticleCard({ category, title, excerpt, readTime, featured }: ArticleCardProps) {
  return (
    <div
      className={
        "hover-lift group flex flex-col rounded-lg border border-border bg-surface p-6 transition-shadow hover:shadow-glow-sm " +
        (featured ? "sm:p-9" : "")
      }
    >
      <Badge variant="brand" className="w-fit">
        {category}
      </Badge>
      <h3 className={featured ? "mt-4 text-2xl font-bold tracking-tight text-foreground" : "mt-4 text-lg font-semibold text-foreground"}>
        {title}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-foreground-muted">{excerpt}</p>
      <p className="mt-4 text-xs text-foreground-subtle">{readTime}</p>
    </div>
  );
}
