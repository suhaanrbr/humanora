import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service — HUMANORA",
  description: "The terms governing use of HUMANORA during its development stage.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="Draft — not yet finalized">
      <p>
        HUMANORA is currently in active development. These terms cover
        the version of the product available today — a free,
        rate-limited humanizer with no accounts, payments, or data
        storage — and will be expanded as more of the product launches.
      </p>

      <section>
        <h2 className="text-lg font-semibold text-foreground">1. Current service</h2>
        <p>
          HUMANORA provides a text-rewriting tool intended to make
          AI-assisted or stiff writing sound more natural. The service is
          provided on an as-is, rate-limited, free basis during this
          development stage, with no uptime or accuracy guarantee.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">2. Acceptable use</h2>
        <p>You agree not to use HUMANORA to:</p>
        <ul className="mt-3 flex flex-col gap-2">
          <li>Submit unlawful, harmful, or infringing content.</li>
          <li>
            Attempt to bypass rate limits, abuse the service to exhaust
            shared resources, or interfere with its operation.
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
        <h2 className="text-lg font-semibold text-foreground">3. Your content</h2>
        <p>
          You retain all rights to text you submit. As described in our{" "}
          <a href="/legal/privacy" className="text-foreground underline underline-offset-2 hover:text-brand-purple">
            Privacy Policy
          </a>
          , submitted text is sent to a third-party AI provider to
          generate a result and is not otherwise stored by HUMANORA at
          this stage. You are responsible for reviewing output before
          relying on it — HUMANORA does not guarantee that meaning,
          facts, or citations are perfectly preserved in every rewrite.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">4. No warranty</h2>
        <p>
          HUMANORA is provided &ldquo;as is&rdquo; during this
          development phase, without warranties of any kind, express or
          implied, including fitness for a particular purpose or
          non-infringement.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">5. Changes</h2>
        <p>
          Because HUMANORA is under active development, features,
          limits, and these terms may change. Material changes will be
          reflected on this page with an updated date.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">6. Governing law &amp; contact</h2>
        <p>
          These terms are governed by the laws of{" "}
          <span className="font-mono text-foreground">[jurisdiction]</span>.
          HUMANORA is operated by{" "}
          <span className="font-mono text-foreground">[legal entity name]</span>.
          Questions can be sent to{" "}
          <span className="font-mono text-foreground">[legal contact email]</span>.
        </p>
      </section>
    </LegalPage>
  );
}
