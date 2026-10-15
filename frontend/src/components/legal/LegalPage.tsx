import type { ReactNode } from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";

export interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

/**
 * Shared layout for legal documents. Every legal page carries the same
 * "draft, needs professional review" notice — these documents are
 * placeholders written to be structurally sound and honest about what
 * Humanora currently does, not a substitute for actual legal review
 * before commercial launch.
 */
export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <>
      <Header />
      <main id="main" className="py-20 sm:py-28">
        <Container className="mx-auto max-w-2xl">
          <p className="eyebrow">Legal</p>
          <h1 className="mt-4 text-5xl leading-[1.05] text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-foreground-subtle">Last updated: {lastUpdated}</p>

          <div className="mt-8 border-l-2 border-warning/60 pl-4 text-sm leading-relaxed text-foreground-subtle">
            This document is a working draft prepared for Humanora&apos;s
            development stage. It is not a substitute for advice from a
            qualified lawyer and should be reviewed by one before
            Humanora is used commercially or processes real customer
            data at scale. Sections in{" "}
            <span className="font-mono text-foreground">[brackets]</span>{" "}
            mark facts (legal entity, jurisdiction, contact details) that
            still need to be filled in.
          </div>

          <div className="prose-legal mt-12 flex flex-col gap-6 text-[1.0625rem] leading-[1.75] text-foreground-muted">
            {children}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
