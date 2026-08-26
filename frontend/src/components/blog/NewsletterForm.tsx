"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/**
 * Newsletter signup form. No backend exists yet, so submitting doesn't
 * send anything — it just acknowledges the input rather than performing
 * a real subscription or a misleading full-page form submission.
 */
export function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <p className="mt-6 text-sm text-foreground-muted">
        Thanks — email signup isn&apos;t wired up to a mailing list yet,
        but we&apos;ve noted the interest.
      </p>
    );
  }

  return (
    <form
      className="mt-6 flex flex-col gap-3 sm:flex-row"
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
    >
      <Input type="email" required placeholder="you@example.com" aria-label="Email address" />
      <Button variant="primary" size="md" type="submit" className="shrink-0">
        Subscribe
      </Button>
    </form>
  );
}
