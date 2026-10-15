import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Cookie Policy — Humanora",
  description: "What Humanora currently stores in your browser.",
};

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy" lastUpdated="Draft — not yet finalized">
      <p>
        Humanora keeps browser storage deliberately minimal. This page
        lists everything it currently stores.
      </p>

      <section>
        <h2 className="mt-4 text-2xl text-foreground">What we currently store</h2>
        <ul className="mt-3 flex flex-col gap-2">
          <li>
            <strong className="text-foreground">Session cookie</strong> (set on
            login, used to keep you signed in) and, while you&apos;re actively
            using the workspace, a temporary draft of unsaved text in your
            browser&apos;s <code className="font-mono text-xs">sessionStorage</code>,
            cleared automatically when you close the tab.
          </li>
          <li>
            <strong className="text-foreground">Display preferences</strong> in
            your browser&apos;s <code className="font-mono text-xs">localStorage</code>:
            whether you chose light or dark mode, and whether you dismissed the
            getting-started guide in your dashboard. These never leave your
            device and you can clear them at any time from your browser
            settings.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mt-4 text-2xl text-foreground">What we do not currently use</h2>
        <ul className="mt-3 flex flex-col gap-2">
          <li>No advertising or tracking cookies.</li>
          <li>No third-party analytics scripts.</li>
          <li>No cross-site tracking of any kind.</li>
        </ul>
      </section>

      <section>
        <h2 className="mt-4 text-2xl text-foreground">Future changes</h2>
        <p>
          If Humanora ever introduces analytics or any other new kind of
          browser storage, this page will describe it specifically,
          including its name, purpose and duration, before it is used.
        </p>
      </section>
    </LegalPage>
  );
}
