import { ButtonLink } from "@/components/ui/ButtonLink";
import { CheckoutButton } from "@/components/payments/CheckoutButton";
import { cn } from "@/lib/cn";
import type { PricingPlan } from "@/lib/config/pricing";
import type { PaidPlanId } from "@/lib/config/plans";

export interface PricingCardProps {
  plan: PricingPlan;
}

/**
 * A single pricing column. Pro (`plan.highlighted`) leads with a
 * stronger rule and the accent label, never with a colored fill.
 */
export function PricingCard({ plan }: PricingCardProps) {
  const isFree = plan.id === "free";

  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-lg border bg-background-elevated p-7",
        plan.highlighted ? "border-foreground/45" : "border-border"
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-2xl leading-none text-foreground">{plan.name}</h3>
        {plan.badge && <span className="eyebrow">{plan.badge}</span>}
      </div>

      <p className="mt-6 flex items-baseline gap-1.5">
        <span className="font-display text-5xl leading-none text-foreground">₹{plan.monthlyPrice}</span>
        <span className="text-sm text-foreground-subtle">{isFree ? "forever" : "/ 30 days"}</span>
      </p>

      <p className="mt-4 min-h-[3rem] text-[0.9375rem] italic leading-snug text-foreground-muted">{plan.audience}</p>

      <ul className="mt-6 flex flex-1 flex-col border-t border-border">
        {plan.features.map((feature) => (
          <li key={feature.label} className="flex items-start gap-2.5 border-b border-border py-2.5 text-[0.9375rem] text-foreground-muted">
            <CheckIcon className={cn("mt-1 h-3.5 w-3.5 shrink-0", plan.highlighted ? "text-brand-purple" : "text-foreground-subtle")} />
            <span>{feature.label}</span>
          </li>
        ))}
      </ul>

      {isFree ? (
        <ButtonLink href="/signup" variant={plan.highlighted ? "primary" : "secondary"} className="mt-8 w-full">
          {plan.ctaLabel}
        </ButtonLink>
      ) : (
        <CheckoutButton
          planId={plan.id as PaidPlanId}
          variant={plan.highlighted ? "primary" : "secondary"}
          className="mt-8 w-full"
        >
          {plan.ctaLabel}
        </CheckoutButton>
      )}
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
