import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Contact — HUMANORA",
  description: "Get in touch with the HUMANORA team.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="py-20 sm:py-28">
        <Container className="mx-auto max-w-xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Contact</h1>
          <p className="mt-4 text-base text-foreground-muted">
            HUMANORA doesn&apos;t have live chat or phone support yet.
            Email is the best way to reach us.
          </p>

          <Card className="mt-8 p-8">
            <p className="text-sm text-foreground-subtle">General inquiries</p>
            {/* PLACEHOLDER: replace with a real monitored address before
                launch — never publish a fabricated contact email. */}
            <p className="mt-2 text-lg font-semibold text-foreground">
              [contact email not yet configured]
            </p>
            <p className="mt-4 text-xs text-foreground-subtle">
              This address is a placeholder pending a decision on a free
              or low-cost inbox for HUMANORA — see the engineering notes
              on this project for details.
            </p>
          </Card>
        </Container>
      </main>
      <Footer />
    </>
  );
}
