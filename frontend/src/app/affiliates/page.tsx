import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { WaitlistButton } from "@/components/ui/WaitlistButton";

export const metadata: Metadata = {
  title: "HUMANORA Affiliates — Grow with HUMANORA",
  description:
    "Recommend better writing and earn recurring revenue with the HUMANORA affiliate program.",
  openGraph: {
    title: "HUMANORA Affiliates — Grow with HUMANORA",
    description: "Recommend better writing and earn recurring revenue with the HUMANORA affiliate program.",
  },
};

const stats = [
  { value: "25%", label: "Recurring commission" },
  { value: "30 days", label: "Attribution window" },
  { value: "Monthly", label: "Payout schedule" },
];

const steps = [
  { number: "01", title: "Join", description: "Sign up for the waitlist to be notified when the affiliate program opens." },
  { number: "02", title: "Share", description: "Recommend HUMANORA to your audience with a unique referral link." },
  { number: "03", title: "Earn", description: "Earn recurring commission on referrals who become paying customers." },
];

const reasons = [
  "Recurring commissions, not one-time payouts",
  "Creator-friendly resources and assets",
  "Transparent, real-time tracking",
  "A dedicated affiliate dashboard",
];

export default function AffiliatesPage() {
  return (
    <>
      <Header />
      <main>
        <section className="bg-ambient-glow bg-grid-texture relative overflow-hidden py-20 sm:py-28">
          <Container className="text-center">
            <h1 className="text-hero mx-auto max-w-2xl font-bold tracking-tight text-foreground">
              Grow with HUMANORA.
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-foreground-muted">
              Recommend better writing. Earn recurring revenue.
            </p>
            <div className="mt-9 flex justify-center">
              <WaitlistButton variant="primary" size="lg">
                Join the Waitlist
              </WaitlistButton>
            </div>
            <p className="mt-4 text-xs text-foreground-subtle">
              The HUMANORA affiliate program is coming soon — join the
              waitlist to be notified at launch.
            </p>
          </Container>
        </section>

        <section className="py-16 sm:py-20">
          <Container>
            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-3">
              {stats.map((stat) => (
                <Card key={stat.label} className="p-6 text-center">
                  <p className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</p>
                  <p className="mt-2 text-sm text-foreground-muted">{stat.label}</p>
                </Card>
              ))}
            </div>
          </Container>
        </section>

        <section className="section-glow-top py-16 sm:py-20">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                How it works
              </h2>
            </div>
            <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-10 sm:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="flex flex-col items-center text-center">
                  <div className="bg-brand-gradient flex h-12 w-12 items-center justify-center rounded-full text-base font-semibold text-white shadow-glow-sm">
                    {step.number}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-foreground">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{step.description}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="section-glow-top py-16 sm:py-20">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Why HUMANORA
              </h2>
            </div>
            <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
              {reasons.map((reason) => (
                <div key={reason} className="flex items-start gap-3 rounded-lg border border-border bg-surface p-5">
                  <CheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-brand-purple" />
                  <p className="text-sm text-foreground-muted">{reason}</p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-16 sm:py-20">
          <Container>
            <div className="mx-auto max-w-xl rounded-xl border border-border-strong bg-surface p-10 text-center shadow-glow-sm">
              <h2 className="text-2xl font-bold tracking-tight text-foreground">
                Affiliate program coming soon
              </h2>
              <p className="mt-3 text-sm text-foreground-muted">
                We haven&apos;t launched affiliates yet, so there&apos;s
                nothing to sign up for today — join the waitlist and
                we&apos;ll reach out when it opens.
              </p>
              <div className="mt-6 flex justify-center">
                <WaitlistButton variant="primary" size="md">
                  Join the Waitlist
                </WaitlistButton>
              </div>
            </div>
          </Container>
        </section>
      </main>
      <Footer />
    </>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
