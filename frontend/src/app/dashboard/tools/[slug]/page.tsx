import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getVerifiedSession } from "@/lib/auth-session";
import { getUserPlan } from "@/lib/db/entitlement";
import { Container } from "@/components/ui/Container";
import { GrammarChecker } from "@/components/tools/GrammarChecker";
import { Paraphraser } from "@/components/tools/Paraphraser";
import { Summarizer } from "@/components/tools/Summarizer";
import { QuizGenerator } from "@/components/tools/QuizGenerator";
import { FactChecker } from "@/components/tools/FactChecker";
import { CitationGenerator } from "@/components/tools/CitationGenerator";
import { getTool } from "@/lib/config/tools";

// Tools with their own long-standing routes (Humanizer, AI Detector,
// Study) aren't served here; the hub links straight to those.
const PAGES = {
  "grammar-checker": GrammarChecker,
  paraphraser: Paraphraser,
  summarizer: Summarizer,
  "quiz-generator": QuizGenerator,
  "fact-checker": FactChecker,
} as const;

type Slug = keyof typeof PAGES | "citation-generator";

function isSlug(slug: string): slug is Slug {
  return slug === "citation-generator" || slug in PAGES;
}

export async function generateMetadata({ params }: PageProps<"/dashboard/tools/[slug]">): Promise<Metadata> {
  const tool = getTool((await params).slug);
  return { title: tool?.name ?? "Tools" };
}

export default async function ToolPage({ params }: PageProps<"/dashboard/tools/[slug]">) {
  const { slug } = await params;
  if (!isSlug(slug)) notFound();

  const result = await getVerifiedSession();
  if (result.status !== "authenticated") redirect("/login");

  if (slug === "citation-generator") {
    const tool = getTool(slug)!;
    return (
      <Container size="wide" className="pb-16">
        <div className="mb-8">
          <Link href="/dashboard/tools" className="focus-ring rounded-sm text-sm text-foreground-subtle hover:text-foreground">
            ← All tools
          </Link>
          <div className="mt-4 flex flex-wrap items-baseline gap-3">
            <h1 className="text-4xl leading-tight text-foreground">{tool.name}</h1>
            <span className="eyebrow">Free</span>
          </div>
          <p className="mt-2 max-w-2xl text-base text-foreground-muted">{tool.summary}</p>
        </div>
        <CitationGenerator />
      </Container>
    );
  }

  const plan = await getUserPlan(result.session.user.id);
  const Tool = PAGES[slug];
  return (
    <Container size="wide" className="pb-16">
      {plan === "free" && (
        <p className="mb-6 rounded-md border border-border bg-surface px-4 py-3 text-sm text-foreground-muted">
          This tool is included in every paid plan. You can explore it here;{" "}
          <Link href="/dashboard/billing" className="font-semibold text-foreground underline underline-offset-4">
            choose a plan
          </Link>{" "}
          to run it.
        </p>
      )}
      <Tool />
    </Container>
  );
}
