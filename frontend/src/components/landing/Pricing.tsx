import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { FAQAccordion } from "@/components/ui/FAQAccordion";
import { PricingCard } from "@/components/pricing/PricingCard";
import { PlanComparison } from "@/components/pricing/PlanComparison";
import { SectionHeader } from "@/components/landing/SectionHeader";
import { pricingPlans, ultraFairUseNote } from "@/lib/config/pricing";
import { pricingFaq } from "@/lib/config/faq";

// Said where people hesitate before paying. Each line restates a
// commitment already made on /trust or in the pricing terms above.
const REASSURANCES = [
  { title: "Nothing auto-renews", body: "One payment covers 30 days. You choose whether to buy again." },
  { title: "Secure checkout", body: "Paid through Razorpay. Card, UPI and bank details never reach our servers." },
  { title: "Your writing stays yours", body: "We don’t sell your text, show you ads, or use your writing to train any model." },
  { title: "Delete anytime", body: "Remove any item, or your whole account, from Settings." },
];

/**
 * Pricing. Cards render entirely from `pricingPlans` (lib/config/
 * pricing.ts, itself derived from lib/config/plans.ts), so this page
 * can never drift from what checkout charges. Paid plans are one-off
 * 30-day passes via Razorpay, with no auto-renewal, and the copy says so up front.
 */
export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-16 py-20 sm:py-28">
      <Container>
        <SectionHeader label="Pricing" title="Pay for a month. Nothing renews behind your back.">
          <p>
            Every paid plan is a single payment for 30 days of access. No subscription, no
            auto-renewal, nothing to remember to cancel. Prices are in Indian rupees.
          </p>
        </SectionHeader>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.id} plan={plan} />
          ))}
        </div>

        <ul className="mt-8 grid grid-cols-1 gap-x-8 gap-y-5 border-y border-border py-6 sm:grid-cols-2 xl:grid-cols-4">
          {REASSURANCES.map((item) => (
            <li key={item.title} className="flex gap-3">
              <ShieldIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-purple" />
              <div>
                <p className="text-[0.9375rem] font-semibold text-foreground">{item.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-foreground-muted">{item.body}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm">
          <Link href="/trust" className="focus-ring rounded-sm text-foreground underline decoration-border-strong underline-offset-4 hover:decoration-foreground">
            How we handle your writing and payments →
          </Link>
        </p>

        <p className="mt-6 max-w-3xl text-sm text-foreground-subtle">{ultraFairUseNote}</p>

        <div className="mt-24 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-3">
            <h3 className="text-3xl leading-tight text-foreground">Compare plans in full</h3>
          </div>
          <div className="lg:col-span-9">
            <PlanComparison />
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-3">
            <h3 className="text-3xl leading-tight text-foreground">Questions</h3>
          </div>
          <div className="lg:col-span-9">
            <FAQAccordion items={pricingFaq} />
          </div>
        </div>
      </Container>
    </section>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" className={className} aria-hidden="true">
      <path d="M8 1.75 2.75 3.6v4.1c0 3.1 2.2 5.5 5.25 6.55 3.05-1.05 5.25-3.45 5.25-6.55V3.6L8 1.75Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="m5.6 8.1 1.7 1.7 3.1-3.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
