import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { PLANS } from "@/lib/config/plans";

/**
 * The opening spread. Left: the promise, stated plainly. Right: a
 * proof sheet. One AI-drafted paragraph marked up the way an editor
 * would mark it, then the clean copy. The page's argument is made by
 * example before a single feature is named.
 */
export function Hero() {
  return (
    <section id="top" className="pb-20 pt-14 sm:pb-28 sm:pt-20 lg:pt-24">
      <Container>
        <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6 lg:pt-6">
            <p className="eyebrow">AI writing and study workspace</p>
            <h1 className="text-hero mt-6 text-foreground">
              Write with AI.
              <br />
              Sound like <em className="text-brand-purple">yourself.</em>
            </h1>
            <p className="mt-8 max-w-xl text-xl leading-relaxed text-foreground-muted">
              Humanora edits AI-assisted drafts into prose a reader takes for yours. It cuts
              the filler, varies the rhythm, and keeps every figure, date and quotation exactly
              as you wrote it.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7">
              <ButtonLink href="/signup" variant="primary" size="lg">
                Start writing free
              </ButtonLink>
              <Link
                href="#try"
                className="focus-ring group inline-flex items-center gap-2 rounded-sm text-base text-foreground underline decoration-border-strong underline-offset-[6px] transition-colors hover:decoration-foreground"
              >
                Check your own text
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>
            <p className="mt-6 text-sm text-foreground-subtle">
              Your first rewrite is free, no card needed. Paid plans start at ₹{PLANS.essential.monthlyPriceInr} a month.
            </p>
          </div>

          <div className="lg:col-span-6">
            <ProofSheet />
          </div>
        </div>
      </Container>
    </section>
  );
}

function ProofSheet() {
  return (
    <figure className="rounded-lg border border-border bg-background-elevated">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <DocumentIcon className="h-4 w-4 shrink-0 text-foreground-subtle" />
          <span className="truncate text-sm font-semibold text-foreground">Q3 update</span>
          <span className="shrink-0 text-sm text-foreground-subtle">Draft 1</span>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm border border-border-strong px-2 py-0.5 text-xs text-foreground-muted">
          <span className="hidden text-foreground-subtle sm:inline">Mode</span>
          Professional
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_9.5rem]">
        <div className="px-5 py-6 text-[1.0625rem] leading-[1.85] text-foreground-muted sm:px-6 sm:py-7">
          <p>
            <span className="mark-strike">In today&apos;s rapidly evolving market landscape, it is worth noting that our</span>{" "}
            <span className="mark-insert">Our</span> Q3 performance was{" "}
            <span className="mark-strike">truly remarkable, with revenue increasing by</span>{" "}
            <span className="mark-insert">strong: revenue rose</span>{" "}
            <span className="mark-keep text-foreground">18%</span> to{" "}
            <span className="mark-keep text-foreground">£4.7 million</span>{" "}
            <span className="mark-keep text-foreground">[4]</span>.{" "}
            <span className="mark-strike">This growth serves as a testament to the team&apos;s unwavering dedication.</span>{" "}
            <span className="mark-insert">The team earned it.</span>
          </p>
        </div>

        <ol className="flex flex-row flex-wrap gap-x-5 gap-y-2 border-t border-border px-5 py-4 text-[0.8125rem] leading-snug text-foreground-subtle sm:flex-col sm:gap-4 sm:border-l sm:border-t-0 sm:px-4 sm:py-7">
          <li>
            <span className="text-brand-purple">Cut.</span> Throat-clearing opener
          </li>
          <li>
            <span className="text-brand-purple">Cut.</span> Inflated praise
          </li>
          <li>
            <span className="text-brand-cyan">Kept.</span> Figures and citation, verbatim
          </li>
        </ol>
      </div>

      <figcaption className="border-t border-border px-5 py-5 sm:px-6 sm:py-6">
        <p className="text-app-label text-foreground-subtle">Clean copy</p>
        <p className="font-display mt-3 text-[1.375rem] leading-snug text-foreground">
          Our Q3 performance was strong: revenue rose 18% to £4.7 million [4]. The team earned it.
        </p>
        <p className="mt-4 text-sm text-foreground-subtle">
          Meaning check: 3 of 3 figures preserved · 37 words → 16
        </p>
      </figcaption>
    </figure>
  );
}

function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M6.5 3.5h7.5l4 4v12a1 1 0 0 1-1 1h-10.5a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M13.5 3.5V8h4.5M8.5 12.5h7M8.5 16h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
