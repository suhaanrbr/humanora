import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "About",
  description:
    "Humanora is an independent writing tool built on a simple idea: AI can help you draft, but the finished piece should sound like the person whose name is on it.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="main" className="py-20 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <p className="eyebrow pt-3 lg:col-span-3">About</p>
            <div className="lg:col-span-7">
              <h1 className="text-5xl leading-[1.05] text-foreground sm:text-6xl">
                Drafting got easy. Sounding like yourself didn&apos;t.
              </h1>

              <div className="mt-12 flex flex-col gap-6 text-lg leading-[1.75] text-foreground-muted">
                <p className="drop-cap">
                  Language models write competent, careful, interchangeable prose. Ask three of
                  them for a cover letter and you get the same letter three times. That&apos;s
                  fine for a first draft. It&apos;s a problem when the draft is the thing you
                  send.
                </p>
                <p>
                  Humanora exists for that last step. It reads an AI-assisted draft the way an
                  editor would. It cuts the throat-clearing, breaks up the rhythm and drops the
                  borrowed vocabulary, and it leaves the facts exactly where they were. Give it
                  samples of your own writing and it edits toward you, not toward a generic idea
                  of &ldquo;natural&rdquo;.
                </p>
                <p>
                  We made a few decisions early and we intend to keep them. We compete on better
                  writing, not on beating AI detectors. That race has no finish line, and winning
                  it doesn&apos;t make anything better to read. We don&apos;t invent precision we
                  don&apos;t have, so there are no &ldquo;98% human&rdquo; scores here. And we
                  bill honestly: one payment buys thirty days, and nothing renews unless you
                  choose it.
                </p>
                <p>
                  Humanora is an independent product in active development. Writing, Study, My
                  Voice, the AI Detector, Projects and the Library are all live today.
                </p>
              </div>

              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-6 text-[0.9375rem]">
                <Link href="/#how-it-works" className="focus-ring text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground">
                  How it works
                </Link>
                <Link href="/#principles" className="focus-ring text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground">
                  Our principles
                </Link>
                <Link href="/legal/terms" className="focus-ring text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground">
                  Terms of service
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
