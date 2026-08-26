import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: "About — HUMANORA",
  description: "HUMANORA is being built to help AI-assisted writing sound more like the person writing it, without losing meaning or control.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="py-20 sm:py-28">
        <Container className="mx-auto max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">About HUMANORA</h1>

          <div className="mt-8 flex flex-col gap-6 text-base leading-relaxed text-foreground-muted">
            <p>
              HUMANORA exists because AI-assisted writing tends to sound
              the same — competent, but generic. We&apos;re building a
              writing tool that goes past a single &ldquo;humanize&rdquo;
              button: one that can learn how a specific person writes and
              apply that consistently, while keeping the facts, numbers,
              quotes, and terminology of the original text intact.
            </p>
            <p>
              We&apos;d rather compete on naturalness, clarity, and
              genuine personalization than on defeating AI-detection
              tools — that&apos;s a race with no finish line, and it&apos;s
              not what makes writing better.
            </p>
            <p>
              HUMANORA is early. The product you can try today is a real,
              working humanizer — not a mockup — but features like saved
              Voice profiles, document history, and accounts are still in
              development. We&apos;d rather ship things when they
              genuinely work than announce them early.
            </p>
            <p className="text-sm text-foreground-subtle">
              HUMANORA is currently an independent project in active
              development. Company/legal details will be published here
              once they&apos;re finalized — see our{" "}
              <a href="/legal/terms" className="text-foreground underline underline-offset-2 hover:text-brand-purple">
                Terms of Service
              </a>{" "}
              for the current operating basis.
            </p>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
