import Link from "next/link";
import { Carousel } from "@/components/ui/Carousel";
import { TOOLS, TOOL_GROUPS } from "@/lib/config/tools";
import type { PlanId } from "@/lib/config/plans";

/**
 * Every tool, as a carousel of cards: a quick way to browse the whole
 * toolkit from Home without leaving for the Tools page. On the free
 * plan, paid tools say so up front rather than at the door.
 */
export function ToolCarousel({ plan }: { plan: PlanId }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground-subtle">Explore the toolkit</h2>
        <Link href="/dashboard/tools" className="text-xs text-foreground-muted underline underline-offset-2 hover:text-foreground">
          All tools
        </Link>
      </div>
      <Carousel
        label="Tools"
        indicator="progress"
        slideClassName="w-[78%] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)] xl:w-[calc((100%-3rem)/4)]"
        trackClassName="gap-4"
      >
        {TOOLS.map((tool, i) => {
          const locked = plan === "free" && tool.access === "paid";
          return (
            <Link
              key={tool.slug}
              href={tool.appHref}
              className="group flex h-full flex-col rounded-lg border border-border bg-surface p-5 transition-colors hover:border-border-interactive hover:bg-surface-hover"
            >
              <div className="flex items-baseline justify-between gap-3">
                <span className="font-display text-3xl leading-none text-foreground-subtle tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-foreground-subtle">
                  {tool.access === "free" ? "Free" : locked ? "Paid plans" : TOOL_GROUPS.find((g) => g.id === tool.group)?.label}
                </span>
              </div>
              <h3 className="mt-6 text-xl leading-tight text-foreground group-hover:text-brand-purple">{tool.name}</h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-foreground-muted">{tool.summary}</p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                Open
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
              </span>
            </Link>
          );
        })}
      </Carousel>
    </div>
  );
}
