"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { ThemeSwitcher } from "@/components/ui/ThemeSwitcher";
import { AccountMenu } from "@/components/landing/AccountMenu";
import { useSession } from "@/lib/auth-client";
import { useSignOut } from "@/lib/useSignOut";
import { cn } from "@/lib/cn";

// Real destinations only. Root-relative anchors so the same header
// works from /about, /blog, and the legal pages, not just the homepage.
const NAV_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Tools", href: "/tools" },
  { label: "My Voice", href: "/#my-voice" },
  { label: "Pricing", href: "/#pricing" },
  { label: "About", href: "/about" },
] as const;

/**
 * Site header: wordmark, five plain links, and the account controls.
 * A product with one core job doesn't need a mega-menu to explain it.
 */
export function Header() {
  const { data: session, isPending } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  return (
    <>
      <a
        href="#main"
        className="sr-only z-[60] rounded-md bg-foreground px-4 py-2 text-background focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
      >
        Skip to content
      </a>
      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-background/95 backdrop-blur transition-colors duration-200",
          scrolled || menuOpen ? "border-border" : "border-transparent",
        )}
      >
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="focus-ring rounded-sm"
            aria-label="Humanora home"
          >
            <Logo size="sm" />
          </Link>

          <nav
            className="hidden items-center gap-7 lg:flex"
            aria-label="Primary"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="focus-ring rounded-sm text-[0.9375rem] text-foreground-muted transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            {isPending ? (
              <div className="h-9 w-24" aria-hidden="true" />
            ) : session ? (
              <AccountMenu />
            ) : (
              <>
                <Link
                  href="/login"
                  className="focus-ring rounded-sm text-[0.9375rem] text-foreground-muted transition-colors hover:text-foreground"
                >
                  Log in
                </Link>
                <ButtonLink href="/signup" variant="primary" size="sm">
                  Get Started
                </ButtonLink>
              </>
            )}
          </div>

          <button
            type="button"
            className="focus-ring -mr-2 inline-flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-surface-hover lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MenuIcon open={menuOpen} className="h-5 w-5" />
          </button>
        </div>

        <div
          id="mobile-nav"
          hidden={!menuOpen}
          className="border-t border-border bg-background lg:hidden"
        >
          <nav
            className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6"
            aria-label="Mobile"
          >
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="focus-ring border-b border-border py-3.5 font-display text-2xl text-foreground"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-6 flex flex-col gap-3">
              {!isPending && session ? (
                <>
                  <ButtonLink
                    href="/dashboard"
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={() => setMenuOpen(false)}
                  >
                    Open your workspace
                  </ButtonLink>
                  <MobileSignOut onDone={() => setMenuOpen(false)} />
                </>
              ) : (
                <>
                  <ButtonLink
                    href="/signup"
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={() => setMenuOpen(false)}
                  >
                    Get Started
                  </ButtonLink>
                  <ButtonLink
                    href="/login"
                    variant="secondary"
                    size="md"
                    className="w-full"
                    onClick={() => setMenuOpen(false)}
                  >
                    Log in
                  </ButtonLink>
                </>
              )}
            </div>
            <ThemeSwitcher showLabels className="mt-6 border-t border-border pt-5" />
          </nav>
        </div>
      </header>
    </>
  );
}

function MobileSignOut({ onDone }: { onDone: () => void }) {
  const { signingOut, handleSignOut } = useSignOut();
  return (
    <button
      type="button"
      disabled={signingOut}
      onClick={() => {
        onDone();
        void handleSignOut();
      }}
      className="focus-ring py-2 text-[0.9375rem] text-foreground-muted hover:text-foreground disabled:opacity-50"
    >
      {signingOut ? "Signing out…" : "Log out"}
    </button>
  );
}

/** Three bars that fold into a cross while the menu is open. */
function MenuIcon({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d={open ? "M5 5l10 10" : "M3 6h14"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="transition-[d] duration-200"
      />
      {!open && <path d="M3 10h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
      <path
        d={open ? "M15 5L5 15" : "M3 14h14"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        className="transition-[d] duration-200"
      />
    </svg>
  );
}
