import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";
import { CitationGenerator } from "@/components/tools/CitationGenerator";

export const metadata: Metadata = {
  title: "Free citation generator: APA, MLA, Chicago and Harvard",
  description:
    "Create correctly formatted APA 7, MLA 9, Chicago and Harvard references and in-text citations for journal articles, books and web pages. Paste a DOI to fill in the details. Free, no account needed.",
  alternates: { canonical: "/tools/citation-generator" },
};

const NOTES = [
  ["Formatting you can trust", "Each style's rules are built into the generator itself, so the same source always gives the same reference. No AI guesswork."],
  ["Paste a DOI", "Most journal articles and many books have a DOI. Paste it and the details are filled in from Crossref, the registry publishers use."],
  ["Copy into Word or Google Docs", "References copy with their italics intact. Build a bibliography as you go, sorted alphabetically for you."],
] as const;

export default function PublicCitationGeneratorPage() {
  return (
    <>
      <Header />
      <main id="main" className="py-14 sm:py-20">
        <Container>
          <div className="mb-10 max-w-3xl">
            <p className="eyebrow">Free tool</p>
            <h1 className="mt-4 text-5xl leading-[1.05] text-foreground">Citation Generator</h1>
            <p className="mt-4 text-lg leading-relaxed text-foreground-muted">
              APA 7, MLA 9, Chicago and Harvard references and in-text citations for journal articles, books and
              web pages. Free, and no account needed.
            </p>
          </div>

          <CitationGenerator />

          <div className="mt-20 grid grid-cols-1 gap-10 border-t border-border pt-10 md:grid-cols-3">
            {NOTES.map(([title, body]) => (
              <div key={title}>
                <h2 className="text-2xl leading-snug text-foreground">{title}</h2>
                <p className="mt-2 text-base leading-relaxed text-foreground-muted">{body}</p>
              </div>
            ))}
          </div>

          <p className="mt-12 max-w-2xl text-base text-foreground-subtle">
            Citations are generated from the details you enter, so check them against your course&apos;s style guide.
            Writing the essay too?{" "}
            <Link href="/tools" className="text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground">
              See all of Humanora&apos;s tools
            </Link>
            .
          </p>
        </Container>
      </main>
      <Footer />
    </>
  );
}
