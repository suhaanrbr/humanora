"use client";

import { CheckoutButton } from "@/components/payments/CheckoutButton";
import { PLANS, PAID_PLAN_IDS } from "@/lib/config/plans";

/** Compact plan-choice row used on the dashboard when a user is on the free plan or their paid period has lapsed. */
export function BillingActions() {
  return (
    <div className="mt-4 flex flex-wrap gap-2.5">
      {PAID_PLAN_IDS.map((id) => (
        <CheckoutButton key={id} planId={id} variant={id === "pro" ? "primary" : "secondary"} size="sm">
          {PLANS[id].name} · ₹{PLANS[id].monthlyPriceInr}
        </CheckoutButton>
      ))}
    </div>
  );
}
