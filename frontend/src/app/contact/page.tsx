import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";
import { CONTACT_EMAIL } from "@/lib/config/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Humanora.",
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="py-20 sm:py-28">
        <Container>
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <p className="eyebrow pt-3 lg:col-span-3">Contact</p>
            <div className="lg:col-span-7">
              <h1 className="text-5xl leading-[1.05] text-foreground sm:text-6xl">Write to us.</h1>
              <p className="mt-8 max-w-xl text-lg leading-relaxed text-foreground-muted">
                Questions about your account, a payment, or how something works. Email is the
                fastest way to reach a person.
              </p>
              {CONTACT_EMAIL ? (
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="focus-ring font-display mt-10 inline-block text-3xl text-foreground underline decoration-brand-purple decoration-1 underline-offset-[10px] sm:text-4xl"
                >
                  {CONTACT_EMAIL}
                </a>
              ) : (
                <p className="mt-10 text-lg text-foreground-subtle">
                  Our support address will be listed here shortly.
                </p>
              )}
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
