import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ArticleCard } from "@/components/ui/ArticleCard";
import { NewsletterForm } from "@/components/blog/NewsletterForm";

export const metadata: Metadata = {
  title: "HUMANORA Blog — Writing in the age of AI",
  description:
    "Practical ideas for clearer thinking, stronger writing and better communication, from the team building HUMANORA.",
  openGraph: {
    title: "HUMANORA Blog — Writing in the age of AI",
    description: "Practical ideas for clearer thinking, stronger writing and better communication.",
  },
};

const categories = [
  "Writing",
  "AI & Writing",
  "Academic Writing",
  "Professional Communication",
  "Editing",
  "Productivity",
  "Responsible AI",
  "HUMANORA Guides",
];

const featured = {
  category: "AI & Writing",
  title: "Why AI-assisted drafts read the way they do — and what to do about it",
  excerpt:
    "Large language models are trained to be broadly correct, not personally distinctive. That trade-off is exactly what gives AI-assisted writing its familiar, slightly generic texture — and it's the specific thing a humanization pass should target.",
  readTime: "8 min read · Sample article",
};

const articles = [
  {
    category: "Writing",
    title: "The difference between editing and rewriting",
    excerpt: "Two very different jobs that are easy to conflate when you're revising a draft.",
    readTime: "5 min read · Sample article",
  },
  {
    category: "Academic Writing",
    title: "Keeping citations intact while improving flow",
    excerpt: "A practical checklist for revising academic writing without breaking your references.",
    readTime: "6 min read · Sample article",
  },
  {
    category: "Professional Communication",
    title: "Why your emails sound stiffer than you mean them to",
    excerpt: "Small wording habits that make professional writing feel more distant than intended.",
    readTime: "4 min read · Sample article",
  },
  {
    category: "Responsible AI",
    title: "Using AI tools without losing your own voice",
    excerpt: "Where AI assistance helps a first draft, and where it's worth reasserting your own style.",
    readTime: "7 min read · Sample article",
  },
  {
    category: "HUMANORA Guides",
    title: "Getting started with My Voice",
    excerpt: "How writing samples become a reusable voice profile, and what the completeness score means.",
    readTime: "5 min read · Sample article",
  },
  {
    category: "Productivity",
    title: "A simple pass for tightening a first draft",
    excerpt: "One pass, three questions: what's repeated, what's vague, and what's just filler.",
    readTime: "4 min read · Sample article",
  },
];

export default function BlogPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-ambient-glow bg-grid-texture relative overflow-hidden py-20 sm:py-28">
          <Container className="text-center">
            <h1 className="text-hero mx-auto max-w-2xl font-bold tracking-tight text-foreground">
              Writing in the age of AI.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-foreground-muted">
              Practical ideas for clearer thinking, stronger writing, and
              better communication.
            </p>
            <p className="mt-4 text-xs text-foreground-subtle">
              HUMANORA&apos;s blog just launched — the articles below are
              sample editorial content while our archive grows.
            </p>
          </Container>
        </section>

        <section className="py-4 sm:py-6">
          <Container>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.map((c) => (
                <span key={c} className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-foreground-muted">
                  {c}
                </span>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-12 sm:py-16">
          <Container>
            <p className="mb-4 text-xs font-medium uppercase tracking-wide text-foreground-subtle">
              Featured
            </p>
            <ArticleCard {...featured} featured />
          </Container>
        </section>

        <section className="section-glow-top py-12 sm:py-16">
          <Container>
            <p className="mb-6 text-xs font-medium uppercase tracking-wide text-foreground-subtle">
              Latest articles
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {articles.map((a) => (
                <ArticleCard key={a.title} {...a} />
              ))}
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20">
          <Container>
            <div className="mx-auto max-w-xl rounded-xl border border-border-strong bg-surface p-10 text-center shadow-glow-sm">
              <Badge variant="brand">Newsletter</Badge>
              <h2 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
                Get new articles by email
              </h2>
              <p className="mt-3 text-sm text-foreground-muted">
                Occasional, practical writing advice — no spam.
              </p>
              <NewsletterForm />
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}
