import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — HUMANORA",
  description: "How HUMANORA handles the data and text you provide.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="Draft — legal entity/jurisdiction details pending owner input">
      <p>
        This policy describes what HUMANORA actually does with your data
        today. Fields marked{" "}
        <span className="font-mono text-foreground">[placeholder]</span>{" "}
        require a decision only HUMANORA&apos;s owner can make and have
        deliberately not been invented.
      </p>

      <section>
        <h2 className="text-lg font-semibold text-foreground">1. Account information</h2>
        <p>
          Creating a HUMANORA account requires a name, email address, and
          password. Your password is never stored in plain text. Your
          session is maintained via a secure, HTTP-only cookie.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">2. Text you submit</h2>
        <ul className="mt-3 flex flex-col gap-2">
          <li>
            <strong className="text-foreground">Humanize requests.</strong>{" "}
            Text you submit to be rewritten is sent to our AI processing
            provider (Google&apos;s Gemini API — see Section 4) to
            generate the result, and the original text plus the rewritten
            result are saved to your account&apos;s History so you can
            revisit past work. You can view your History at any time in
            your dashboard; deleting your account permanently deletes it.
          </li>
          <li>
            <strong className="text-foreground">My Voice writing samples.</strong>{" "}
            If you choose to use My Voice, the writing samples you paste
            in are stored against your account and used to derive a
            structured description of your writing style (vocabulary,
            sentence length, tone, and similar traits — never a claim
            about your identity or authorship). Samples and the derived
            profile are visible only to you and are deleted if you remove
            them or delete your account.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">3. Payment information</h2>
        <p>
          Paid plans are processed by Razorpay. HUMANORA never receives
          or stores your card, UPI, or bank details — Razorpay handles
          payment collection directly and shares back only an order
          status, a payment identifier, and the amount paid, which we
          store to maintain your billing history and active plan.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">4. Third-party AI processing</h2>
        <p>
          Text submitted to the humanizer or for My Voice analysis is
          processed by Google&apos;s Gemini API to generate the result.
          That provider processes the text under its own terms; we do
          not control how it handles data on its own infrastructure
          beyond the request itself. Avoid submitting highly sensitive
          personal, financial, or confidential information.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">5. Cookies and local storage</h2>
        <p>
          See our{" "}
          <a href="/legal/cookies" className="text-foreground underline underline-offset-2 hover:text-brand-purple">
            Cookie Policy
          </a>{" "}
          for the exact list of what&apos;s stored in your browser. In short:
          a session cookie to keep you logged in, and a temporary draft
          of unsaved text in your browser only, cleared when you close
          the tab. No advertising or tracking cookies, no analytics
          platform installed.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">6. Your rights</h2>
        <p>
          You can view and delete your History and My Voice samples at
          any time from your dashboard. You can permanently delete your
          entire account — including History, My Voice data, and billing
          records — from Settings; this is irreversible. Depending on{" "}
          your location, you may have additional rights to access,
          correct, or export personal data we hold about you — contact
          us using the details below.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">7. Contact</h2>
        <p>
          Questions about this policy can be sent to{" "}
          <span className="font-mono text-foreground">[privacy contact email — placeholder]</span>.
          HUMANORA is operated by{" "}
          <span className="font-mono text-foreground">[legal entity name — placeholder]</span>{" "}
          under the laws of{" "}
          <span className="font-mono text-foreground">[jurisdiction — placeholder]</span>.
        </p>
      </section>
    </LegalPage>
  );
}
