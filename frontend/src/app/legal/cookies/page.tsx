import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy — HUMANORA",
  description: "What HUMANORA currently stores in your browser.",
};

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy" lastUpdated="Draft — not yet finalized">
      <p>
        HUMANORA keeps browser storage deliberately minimal at this
        stage. This page will be updated if that changes — for example,
        if analytics or authentication are introduced.
      </p>

      <section>
        <h2 className="text-lg font-semibold text-foreground">What we currently store</h2>
        <ul className="mt-3 flex flex-col gap-2">
          <li>
            <strong className="text-foreground">Session cookie</strong> (set on
            login, used to keep you signed in) and, while you&apos;re actively
            using the workspace, a temporary draft of unsaved text in your
            browser&apos;s <code className="font-mono text-xs">sessionStorage</code>,
            cleared automatically when you close the tab.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">What we do not currently use</h2>
        <ul className="mt-3 flex flex-col gap-2">
          <li>No advertising or tracking cookies.</li>
          <li>No third-party analytics scripts.</li>
          <li>No cross-site tracking of any kind.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-foreground">Future changes</h2>
        <p>
          If HUMANORA later introduces accounts, session cookies will be
          required to keep you signed in, and this page will describe
          them specifically — including their name, purpose, and
          duration — before that feature launches.
        </p>
      </section>
    </LegalPage>
  );
}
