import { redirect } from "next/navigation";
import { getVerifiedSession } from "@/lib/auth-session";
import { Container } from "@/components/ui/Container";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getSubscriptionSummary } from "@/lib/db/entitlement";
import { getPaymentHistoryForUser } from "@/lib/db/payments";
import { PLANS } from "@/lib/config/plans";
import { BillingActions } from "@/components/dashboard/BillingActions";

export const metadata = { title: "Billing — HUMANORA" };

export default async function BillingPage() {
  const result = await getVerifiedSession();
  if (result.status !== "authenticated") redirect("/login");
  const userId = result.session.user.id;

  const [billing, payments] = await Promise.all([
    getSubscriptionSummary(userId),
    getPaymentHistoryForUser(userId),
  ]);

  const currentPlan = PLANS[billing.effectivePlan];
  const isFreeOrExpired = billing.effectivePlan === "free";

  return (
    <Container className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Billing</h1>
        <p className="mt-1 text-sm text-foreground-muted">Your current plan and payment history.</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-foreground-muted">Current plan</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{currentPlan.name}</p>
          </div>
          <Badge variant={isFreeOrExpired ? "neutral" : "brand"}>
            {isFreeOrExpired ? "Free" : "Active"}
          </Badge>
        </div>

        {billing.isExpired && (
          <p className="mt-3 text-xs text-warning">
            Your {PLANS[billing.plan].name} access ended on {billing.currentPeriodEnd?.toLocaleDateString()}.
          </p>
        )}
        {!isFreeOrExpired && billing.currentPeriodEnd && (
          <p className="mt-3 text-xs text-foreground-subtle">
            Access valid through {billing.currentPeriodEnd.toLocaleDateString()}. HUMANORA doesn&apos;t auto-renew —
            choose a plan again when this period ends to continue.
          </p>
        )}

        {isFreeOrExpired && (
          <div className="mt-5">
            <p className="mb-2 text-xs text-foreground-subtle">Choose a plan:</p>
            <BillingActions />
          </div>
        )}
      </Card>

      <div className="mt-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground-subtle">
          Payment history
        </h2>
        {payments.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-sm text-foreground-muted">No payments yet.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {payments.map((p) => (
              <Card key={p.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium capitalize text-foreground">{p.planId}</p>
                  <p className="text-xs text-foreground-subtle">{p.createdAt.toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    ₹{(p.amountInPaise / 100).toFixed(2)}
                  </p>
                  <Badge
                    variant={p.status === "paid" ? "brand" : p.status === "failed" ? "neutral" : "neutral"}
                    className="mt-1 capitalize"
                  >
                    {p.status}
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
