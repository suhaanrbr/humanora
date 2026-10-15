import Link from "next/link";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Container } from "@/components/ui/Container";
import { ProofSheet } from "@/components/landing/ProofSheet";
import { PLANS } from "@/lib/config/plans";

/**
 * The opening spread. Left: the promise, stated plainly. Right: a
 * proof sheet (ProofSheet): one AI-drafted paragraph marked up the way
 * an editor would mark it, then the clean copy, switchable across all
 * six writing modes. The page's argument is made by example before a
 * single feature is named.
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
