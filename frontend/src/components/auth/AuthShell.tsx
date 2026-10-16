import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { AuthPanelTransition } from "@/components/auth/AuthPanelTransition";
import { AuthExamples } from "@/components/auth/AuthExamples";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import type { ReactNode } from "react";

/**
 * The persistent authentication frame shared by /login, /signup and the
 * password-reset routes via app/(auth)/layout.tsx. Next.js keeps a
 * shared layout mounted across navigation between these routes, so only
 * `children` (the form panel) changes when a visitor switches between
 * them.
 *
 * Desktop: a quiet editorial column on the left (the wordmark, a slow
 * carousel of worked edits, the copyright line) and the form on the right. Below lg,
 * the left column collapses to the wordmark above the form.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full bg-background">
      <aside className="hidden w-[44%] max-w-[640px] flex-col justify-between border-r border-border bg-background-elevated p-12 lg:flex xl:p-16">
        <Link href="/" className="focus-ring w-fit rounded-sm" aria-label="Humanora home">
          <Logo size="md" />
        </Link>

        <AuthExamples />

        <p className="text-sm text-foreground-subtle">&copy; {new Date().getFullYear()} Humanora</p>
      </aside>

      <main className="flex flex-1 flex-col">
        <div className="flex h-16 items-center justify-between px-6 sm:px-10 lg:justify-end">
          <Link href="/" className="focus-ring rounded-sm lg:hidden" aria-label="Humanora home">
            <Logo size="sm" />
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 [align-items:safe_center] justify-center px-5 pb-12 pt-4 sm:px-10 lg:pb-16">
          <AuthPanelTransition>{children}</AuthPanelTransition>
        </div>
      </main>
    </div>
  );
}
