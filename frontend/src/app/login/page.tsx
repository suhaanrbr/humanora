import type { Metadata } from "next";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { WaitlistButton } from "@/components/ui/WaitlistButton";

export const metadata: Metadata = {
  title: "Log in — HUMANORA",
  description: "HUMANORA accounts are not live yet. Try the free humanizer without signing up, or join the waitlist to be notified at launch.",
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="flex flex-1 items-center py-24">
        <Container>
          <div className="mx-auto max-w-md rounded-xl border border-border-strong bg-surface p-10 text-center shadow-glow-sm">
            <Badge variant="warning">Accounts coming soon</Badge>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground">
              HUMANORA accounts aren&apos;t live yet
            </h1>
            <p className="mt-3 text-sm text-foreground-muted">
              There&apos;s no sign-up or login yet — HUMANORA doesn&apos;t
              store accounts, history, or a Voice profile at this stage.
              You can still try the real humanizer right now, no account
              required.
            </p>
            <div className="mt-7 flex flex-col gap-3">
              <ButtonLink href="/#try-it" variant="primary" size="md">
                Try the free humanizer
              </ButtonLink>
              <WaitlistButton variant="secondary" size="md">
                Notify me when accounts launch
              </WaitlistButton>
            </div>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
