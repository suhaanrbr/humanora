import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { Card } from "@/components/ui/Card";
import { PlanIcon } from "@/components/pricing/PlanIcon";
import { CheckoutButton } from "@/components/payments/CheckoutButton";
import { cn } from "@/lib/cn";
import type { PricingPlan } from "@/lib/config/pricing";
import type { PaidPlanId } from "@/lib/config/plans";

export interface PricingCardProps {
  plan: PricingPlan;
}

/**
 * A single pricing tile. Every tile is genuinely translucent (`Card`'s
 * own `.glass-panel` default) — Pro (`plan.highlighted`) leads not
 * through an opaque fill but through a warmer amber-tinted glass, a
 * brighter border, and a stronger glow, with text on the same light
 * tokens every other tile uses (readable against the dark environment
 * showing through, not the old dark-text-on-opaque-cream treatment).
 */
export function PricingCard({ plan }: PricingCardProps) {
  const isFree = plan.id === "free";

  return (
    <Card
      className={cn(
        "hover-lift relative flex h-full flex-col p-7 transition-shadow",
        plan.highlighted
          ? "border-brand-purple/40 bg-brand-purple/[0.06] shadow-glow-md"
          : "pearl-glass hover:shadow-glow-sm"
      )}
    >
      {plan.badge && (
        <Badge
          variant="brand"
          className={cn(
            "absolute -top-3 left-7",
            plan.highlighted && "border-accent-amber/50 bg-accent-amber/20 text-accent-amber"
          )}
        >
          {plan.badge}
        </Badge>
      )}

      <div
        className={cn(
          "mb-4 inline-flex h-11 w-11 items-center justify-center rounded-md border",
          plan.highlighted
            ? "border-accent-amber/25 bg-accent-amber/[0.08] text-accent-amber"
            : "border-border bg-background-elevated text-brand-purple"
        )}
      >
        <PlanIcon icon={plan.icon} className="h-5 w-5" />
      </div>

      <p className="text-sm font-medium text-foreground-muted">{plan.name}</p>

      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight text-foreground">₹{plan.monthlyPrice}</span>
        {!isFree && <span className="text-sm text-foreground-subtle">/month</span>}
      </div>

      <p className="mt-4 text-sm text-foreground-muted">{plan.audience}</p>

      <ul className="mt-6 flex flex-1 flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature.label} className="flex items-start gap-2 text-sm text-foreground-muted">
            <CheckIcon
              className={cn(
                "mt-0.5 h-4 w-4 shrink-0",
                plan.highlighted ? "text-accent-amber" : "text-brand-purple"
              )}
            />
            <span>{feature.label}</span>
          </li>
        ))}
      </ul>

      {isFree ? (
        <ButtonLink href="/dashboard/humanize" variant={plan.highlighted ? "primary" : "secondary"} className="mt-8 w-full">
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
    </Card>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="m4 10 4 4 8-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
