"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/Button";
import type { PaidPlanId } from "@/lib/config/plans";

const CHECKOUT_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

interface RazorpayCheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  theme?: { color?: string };
  handler: (response: RazorpayCheckoutResponse) => void;
  modal?: { ondismiss?: () => void };
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

function loadCheckoutScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${CHECKOUT_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("script_failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = CHECKOUT_SCRIPT_SRC;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("script_failed"));
    document.body.appendChild(script);
  });
}

/**
 * Starts a real Razorpay Checkout for one of HUMANORA's paid plans.
 * Only ever sends `planId` to the server — the price shown here is for
 * display; the amount actually charged is whatever the server looks up
 * from lib/config/plans.ts when it creates the order (see
 * /api/payments/create-order). A successful payment is confirmed here
 * for fast UX (POST /api/payments/verify), but the webhook is what
 * actually guarantees activation if this call never completes.
 */
export function CheckoutButton({
  planId,
  children,
  onAuthRequired,
  ...buttonProps
}: {
  planId: PaidPlanId;
  onAuthRequired?: () => void;
} & Omit<ButtonProps, "onClick" | "loading">) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function startCheckout() {
    setStatus("loading");
    setErrorMessage("");

    try {
      const orderRes = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      if (orderRes.status === 401) {
        if (onAuthRequired) onAuthRequired();
        else router.push(`/login?next=${encodeURIComponent("/#pricing")}`);
        setStatus("idle");
        return;
      }

      const order = await orderRes.json();
      if (!orderRes.ok) {
        setErrorMessage(order?.error ?? "Couldn't start checkout.");
        setStatus("error");
        return;
      }

      await loadCheckoutScript();
      if (!window.Razorpay) throw new Error("script_failed");

      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "HUMANORA",
        description: `${order.planName} plan`,
        order_id: order.orderId,
        theme: { color: "#7c3aed" },
        handler: async (response) => {
          setStatus("loading");
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            if (!verifyRes.ok) {
              const data = await verifyRes.json().catch(() => ({}));
              setErrorMessage(data?.error ?? "We couldn't confirm your payment. Contact support if you were charged.");
              setStatus("error");
              return;
            }
            // Full reload (not router.push) so every server component
            // re-resolves the user's plan from the database — a client-
            // side transition could still render from a stale RSC cache.
            // eslint-disable-next-line @next/next/no-location-assign-relative-destination
            window.location.href = "/dashboard?upgraded=1";
          } catch {
            setErrorMessage("We couldn't confirm your payment. Contact support if you were charged.");
            setStatus("error");
          }
        },
        modal: {
          ondismiss: () => setStatus("idle"),
        },
      });
      rzp.open();
      setStatus("idle");
    } catch {
      setErrorMessage("Couldn't reach the checkout service. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div>
      <Button {...buttonProps} onClick={startCheckout} loading={status === "loading"}>
        {children}
      </Button>
      {status === "error" && errorMessage && <p className="mt-2 text-xs text-danger">{errorMessage}</p>}
    </div>
  );
}
