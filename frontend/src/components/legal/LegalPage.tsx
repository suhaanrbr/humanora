import type { ReactNode } from "react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

export interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}

/**
 * Shared layout for legal documents. Every legal page carries the same
 * "draft, needs professional review" notice — these documents are
 * placeholders written to be structurally sound and honest about what
 * HUMANORA currently does, not a substitute for actual legal review
 * before commercial launch.
 */
export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <>
      <Header />
      <main className="py-20 sm:py-28">
        <Container className="mx-auto max-w-2xl">
          <Badge variant="warning">Draft — pending legal review</Badge>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-foreground">{title}</h1>
          <p className="mt-2 text-sm text-foreground-subtle">Last updated: {lastUpdated}</p>

          <div className="mt-6 rounded-lg border border-warning/30 bg-warning/10 p-4 text-sm text-foreground-muted">
            This document is a working draft prepared for HUMANORA&apos;s
            development stage. It is not a substitute for advice from a
            qualified lawyer and should be reviewed by one before
            HUMANORA is used commercially or processes real customer
            data at scale. Sections in{" "}
            <span className="font-mono text-foreground">[brackets]</span>{" "}
            mark facts (legal entity, jurisdiction, contact details) that
            still need to be filled in.
          </div>

          <div className="prose-legal mt-10 flex flex-col gap-6 text-base leading-relaxed text-foreground-muted">
            {children}
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
