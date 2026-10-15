import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { audiences, getAudience } from "@/lib/config/audiences";
import { PLANS } from "@/lib/config/plans";

export function generateStaticParams() {
  return audiences.map((a) => ({ audience: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/for/[audience]">): Promise<Metadata> {
  const audience = getAudience((await params).audience);
  if (!audience) return {};
  return {
    title: `Humanora for ${audience.name.toLowerCase()}`,
    description: audience.lede,
    alternates: { canonical: `/for/${audience.slug}` },
  };
}

export default async function AudiencePage({ params }: PageProps<"/for/[audience]">) {
  const audience = getAudience((await params).audience);
  if (!audience) notFound();
  const plan = PLANS[audience.plan];
  const others = audiences.filter((a) => a.slug !== audience.slug);

  return (
    <>
      <Header />
      <main id="main">
        <section className="pb-16 pt-14 sm:pb-24 sm:pt-20">
          <Container>
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-12">
              <div className="lg:col-span-6">
                <p className="eyebrow">For {audience.name.toLowerCase()}</p>
                <h1 className="mt-6 text-5xl leading-[1.04] text-foreground sm:text-6xl">{audience.title}</h1>
                <p className="mt-8 max-w-xl text-xl leading-relaxed text-foreground-muted">{audience.lede}</p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7">
                  <ButtonLink href="/signup" variant="primary" size="lg">
                    Start writing free
                  </ButtonLink>
                  <Link
                    href="/#try"
                    className="focus-ring rounded-sm text-base text-foreground underline decoration-border-strong underline-offset-[6px] hover:decoration-foreground"
                  >
                    Check your own text →
                  </Link>
                </div>
              </div>

              <figure className="self-start rounded-lg border border-border bg-background-elevated lg:col-span-6">
                <div className="border-b border-border px-6 py-3.5 text-sm text-foreground-subtle">{audience.exampleLabel}</div>
                <div className="px-6 py-6">
                  <p className="text-app-label text-foreground-subtle">Draft</p>
                  <p className="mt-3 text-[1.0625rem] leading-relaxed">
                    <span className="mark-strike">{audience.before}</span>
                  </p>
                </div>
                <figcaption className="border-t border-border px-6 py-6">
                  <p className="text-app-label text-foreground-subtle">Humanora</p>
                  <p className="font-display mt-3 text-[1.5rem] leading-snug text-foreground">{audience.after}</p>
                </figcaption>
              </figure>
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-24">
          <Container>
            <div className="grid grid-cols-1 gap-4 border-t border-border pt-6 lg:grid-cols-12 lg:gap-10">
              <p className="eyebrow pt-1 lg:col-span-3">What it&apos;s for</p>
              <div className="grid grid-cols-1 gap-x-10 gap-y-10 md:grid-cols-3 lg:col-span-9">
                {audience.jobs.map((job) => (
                  <div key={job.title}>
                    <h2 className="text-2xl leading-snug text-foreground">{job.title}</h2>
                    <p className="mt-3 text-base leading-relaxed text-foreground-muted">{job.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-20 grid grid-cols-1 gap-4 border-t border-border pt-6 lg:grid-cols-12 lg:gap-10">
              <p className="eyebrow pt-1 lg:col-span-3">Where to start</p>
              <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:col-span-9">
                <div>
                  <h2 className="text-2xl leading-snug text-foreground">Modes to try first</h2>
                  <p className="mt-3 font-display text-xl italic text-foreground-muted">{audience.modes.join(" · ")}</p>
                  <Link href="/#writing-modes" className="focus-ring mt-4 inline-block rounded-sm text-[0.9375rem] text-brand-purple hover:underline">
                    All six modes →
                  </Link>
                </div>
                <div>
                  <h2 className="text-2xl leading-snug text-foreground">
                    Suggested plan: {plan.name}, ₹{plan.monthlyPriceInr}
                  </h2>
                  <p className="mt-3 text-base leading-relaxed text-foreground-muted">{audience.planReason}</p>
                  <Link href="/#pricing" className="focus-ring mt-4 inline-block rounded-sm text-[0.9375rem] text-brand-purple hover:underline">
                    Compare plans →
                  </Link>
                </div>
              </div>
            </div>

            {audience.note && (
              <p className="mt-16 max-w-2xl border-l border-brand-cyan/60 pl-5 text-base leading-relaxed text-foreground-subtle lg:ml-[25%]">
                {audience.note}
              </p>
            )}
          </Container>
        </section>

        <section className="py-16 sm:py-20">
          <Container>
            <div className="flex flex-col gap-4 border-t border-border-strong pt-8 sm:flex-row sm:items-baseline sm:justify-between">
              <p className="text-foreground-subtle">Also for</p>
              <div className="flex flex-wrap gap-x-10 gap-y-3">
                {others.map((a) => (
                  <Link
                    key={a.slug}
                    href={`/for/${a.slug}`}
                    className="focus-ring font-display rounded-sm text-3xl text-foreground hover:text-brand-purple"
                  >
                    {a.name} →
                  </Link>
                ))}
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
