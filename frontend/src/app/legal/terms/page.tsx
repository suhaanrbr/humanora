import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — HUMANORA",
  description: "The terms governing use of HUMANORA.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="Draft — refund policy and legal-entity details pending owner input">
      <p>
        These terms cover HUMANORA as it actually operates today:
        account-based access, a one-time complimentary trial, paid plans
        processed through Razorpay, and My Voice writing-style profiles.
        Fields marked{" "}
        <span className="font-mono text-foreground">[placeholder]</span>{" "}
        require a decision only HUMANORA&apos;s owner can make.
      </p>

      <section>
        <h2 className="text-lg font-semibold text-foreground">1. The service</h2>
        <p>
          HUMANORA provides a text-rewriting tool intended to make
          AI-assisted or stiff writing sound more natural, plus an
          optional My Voice feature that learns your writing style from
          samples you provide. An account is required to use the
          humanizer at all. The service is provided with no uptime or
          accuracy guarantee.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">2. Plans and billing</h2>
        <p>
          Every account receives one complimentary humanization (up to
          200 characters), once, for the lifetime of the account. Paid
          plans (Essential, Pro, Ultra) are billed as a single payment
          through Razorpay per 30-day access period at the price shown
          at checkout — there is no automatic recurring charge. Your
          access simply ends at the end of that period unless you choose
          a plan again. We do not store your card, UPI, or bank details;
          Razorpay handles payment collection directly.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">3. Refunds and cancellations</h2>
        <p>
          <span className="font-mono text-foreground">[Refund/cancellation policy placeholder — to be set by HUMANORA&apos;s owner before accepting real payments.]</span>{" "}
          Since plans do not auto-renew, there is nothing to &ldquo;cancel&rdquo; in
          the subscription sense — you simply don&apos;t choose a plan again
          when your period ends.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">4. Acceptable use</h2>
        <p>You agree not to use HUMANORA to:</p>
        <ul className="mt-3 flex flex-col gap-2">
          <li>Submit unlawful, harmful, or infringing content.</li>
          <li>
            Attempt to bypass rate limits, entitlement limits, or payment
            verification, or interfere with the service&apos;s operation.
          </li>
          <li>
            Present HUMANORA&apos;s output as guaranteed to evade any
            AI-detection, plagiarism-detection, or academic-integrity
            system. HUMANORA is a writing-quality tool, not a detection
            countermeasure, and makes no such claim or guarantee.
          </li>
          <li>Submit content you don&apos;t have the right to process.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">5. Your content</h2>
        <p>
          You retain all rights to text you submit and to your My Voice
          writing samples. As described in our{" "}
          <a href="/legal/privacy" className="text-foreground underline underline-offset-2 hover:text-brand-purple">
            Privacy Policy
          </a>
          , submitted text is sent to a third-party AI provider to
          generate a result. You are responsible for reviewing output
          before relying on it — HUMANORA does not guarantee that
          meaning, facts, or citations are perfectly preserved in every
          rewrite (the in-app meaning-preservation check is a best-effort
          aid, not a guarantee).
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">6. No warranty</h2>
        <p>
          HUMANORA is provided &ldquo;as is&rdquo;, without warranties of
          any kind, express or implied, including fitness for a
          particular purpose or non-infringement.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">7. Changes</h2>
        <p>
          Features, limits, prices, and these terms may change. Material
          changes will be reflected on this page with an updated date.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">8. Governing law &amp; contact</h2>
        <p>
          These terms are governed by the laws of{" "}
          <span className="font-mono text-foreground">[jurisdiction — placeholder]</span>.
          HUMANORA is operated by{" "}
          <span className="font-mono text-foreground">[legal entity name — placeholder]</span>.
          Questions can be sent to{" "}
          <span className="font-mono text-foreground">[legal contact email — placeholder]</span>.
        </p>
      </section>
    </LegalPage>
  );
}
