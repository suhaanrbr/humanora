import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy — HUMANORA",
  description: "How HUMANORA currently handles the text and data you provide.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="Draft — not yet finalized">
      <p>
        This policy describes what actually happens to your data in
        HUMANORA&apos;s current development version. It will be expanded
        as accounts, saved history, and Voice profiles are built — this
        version only covers what exists today.
      </p>

      <section>
        <h2 className="text-lg font-semibold text-foreground">1. What we collect today</h2>
        <ul className="mt-3 flex flex-col gap-2">
          <li>
            <strong className="text-foreground">Text you submit to the humanizer.</strong>{" "}
            When you use the &ldquo;Humanize this draft&rdquo; feature,
            the text you enter is sent to our AI processing provider (see
            Section 2) to generate a rewritten result. HUMANORA does not
            currently save this text to a database — it exists only for
            the duration of that request.
          </li>
          <li>
            <strong className="text-foreground">Theme preference.</strong>{" "}
            Your Light/Dark/System choice is stored only in your
            browser&apos;s local storage. It is never sent to our
            servers.
          </li>
          <li>
            <strong className="text-foreground">Basic request metadata.</strong>{" "}
            Your IP address is used transiently, server-side, to enforce
            rate limits and prevent abuse of the free AI tier. It is
            written to short-lived server logs for this purpose and is
            not linked to any account (none exist yet) or used for
            tracking.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">2. Third-party AI processing</h2>
        <p>
          Text submitted to the humanizer is processed by a third-party
          AI provider (currently Google&apos;s Gemini API) in order to
          generate the rewritten output. That provider processes the
          text under its own terms and privacy policy; we do not control
          how they handle data on their infrastructure beyond the
          request itself. We recommend not submitting highly sensitive
          personal, financial, or confidential information while
          HUMANORA is in this development stage.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">3. Cookies and analytics</h2>
        <p>
          HUMANORA does not currently use tracking or advertising
          cookies, and no analytics platform is installed. If this
          changes, this policy and our{" "}
          <a href="/legal/cookies" className="text-foreground underline underline-offset-2 hover:text-brand-purple">
            Cookie Policy
          </a>{" "}
          will be updated first.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">4. Accounts and future storage</h2>
        <p>
          HUMANORA does not yet have user accounts. Once accounts,
          document history, and Voice profiles (a personal writing-style
          profile) are launched, this policy will be updated to describe
          exactly what is stored, for how long, and how you can delete
          it — including an explicit opt-in requirement before any of
          your writing is used to improve HUMANORA&apos;s models.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">5. Your rights</h2>
        <p>
          Depending on your location, you may have rights to access,
          correct, or delete personal data we hold about you. Since
          HUMANORA does not currently store submitted text or maintain
          accounts, there is presently little to request beyond
          server logs. This section will be expanded with a concrete
          process once accounts exist.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">6. Contact</h2>
        <p>
          Questions about this policy can be sent to{" "}
          <span className="font-mono text-foreground">[privacy contact email]</span>.
          HUMANORA is operated by{" "}
          <span className="font-mono text-foreground">[legal entity name]</span>{" "}
          under the laws of{" "}
          <span className="font-mono text-foreground">[jurisdiction]</span>.
        </p>
      </section>
    </LegalPage>
  );
}
