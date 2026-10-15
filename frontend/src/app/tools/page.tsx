import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { TOOLS, TOOL_GROUPS } from "@/lib/config/tools";

export const metadata: Metadata = {
  title: "AI writing tools",
  description:
    "Humanora's writing tools: AI Humanizer, Paraphraser, Grammar Checker, Fact Checker, AI Detector, Summarizer, Quiz Generator and a free Citation Generator, all in one workspace.",
  alternates: { canonical: "/tools" },
};

export default function ToolsPage() {
  return (
    <>
      <Header />
      <main id="main" className="py-20 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <p className="eyebrow pt-3 lg:col-span-3">Tools</p>
            <div className="lg:col-span-8">
              <h1 className="text-5xl leading-[1.05] text-foreground sm:text-6xl">One desk. Every tool a writer reaches for.</h1>
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-foreground-muted">
                Rewrite, check, cite and study in the same workspace, with the same account and the same
                monthly allowance. The Citation Generator is free for everyone, no account needed.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7">
                <ButtonLink href="/signup" size="lg">
                  Start writing free
                </ButtonLink>
                <Link
                  href="/tools/citation-generator"
                  className="focus-ring rounded-sm text-base text-foreground underline decoration-border-strong underline-offset-[6px] hover:decoration-foreground"
                >
                  Try the free Citation Generator →
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-20 flex flex-col gap-16">
            {TOOL_GROUPS.map((group) => (
              <section key={group.id} className="grid grid-cols-1 gap-6 border-t border-border pt-6 lg:grid-cols-12 lg:gap-10" aria-labelledby={`g-${group.id}`}>
                <h2 id={`g-${group.id}`} className="eyebrow pt-1 font-sans lg:col-span-3">
                  {group.label}
                </h2>
                <ul className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:col-span-9">
                  {TOOLS.filter((t) => t.group === group.id).map((tool) => (
                    <li key={tool.slug}>
                      <h3 className="flex items-baseline gap-3 text-2xl leading-tight text-foreground">
                        {tool.name}
                        {tool.access === "free" && <span className="eyebrow">Free</span>}
                      </h3>
                      <p className="mt-2 text-base leading-relaxed text-foreground-muted">{tool.summary}</p>
                      {tool.publicHref ? (
                        <Link href={tool.publicHref} className="focus-ring mt-3 inline-block rounded-sm text-[0.9375rem] text-brand-purple hover:underline">
                          Use it now, free →
                        </Link>
                      ) : (
                        <p className="mt-3 text-sm text-foreground-subtle">Included in every paid plan.</p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <p className="mt-20 max-w-2xl border-l border-brand-cyan/60 pl-5 text-base leading-relaxed text-foreground-subtle lg:ml-[25%]">
            A plagiarism checker isn&apos;t listed because doing it properly means comparing your text against
            billions of published pages through a licensed database. We&apos;d rather not offer one than offer one
            that only pretends to check.
          </p>
        </Container>
      </main>
      <Footer />
    </>
  );
}
