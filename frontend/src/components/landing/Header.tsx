"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "Pricing", href: "#pricing" },
  { label: "Blog", href: "/blog" },
  { label: "Resources", href: "/resources" },
];

/**
 * Landing page header. Sticky, translucent over the dark background so it
 * reads as part of the page rather than a generic floating navbar.
 * Mobile viewports get a dedicated slide-down menu instead of a squeezed
 * desktop nav.
 */
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="focus-ring rounded-md" aria-label="HUMANORA home">
          <Logo size="sm" />
        </Link>

        <nav
          className="hidden items-center gap-8 lg:flex"
          aria-label="Primary"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="focus-ring rounded-md text-sm text-foreground-muted transition-colors hover:text-foreground"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button variant="ghost" size="sm">
            Log in
          </Button>
          <Button variant="primary" size="sm">
            Get Started Free
          </Button>
        </div>

        <button
          type="button"
          className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground lg:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="relative block h-4 w-5" aria-hidden="true">
            <span
              className={cn(
                "absolute left-0 top-0 h-0.5 w-5 bg-current transition-transform duration-200",
                menuOpen && "translate-y-[7px] rotate-45"
              )}
            />
            <span
              className={cn(
                "absolute left-0 top-1/2 h-0.5 w-5 -translate-y-1/2 bg-current transition-opacity duration-200",
                menuOpen && "opacity-0"
              )}
            />
            <span
              className={cn(
                "absolute bottom-0 left-0 h-0.5 w-5 bg-current transition-transform duration-200",
                menuOpen && "-translate-y-[7px] -rotate-45"
              )}
            />
          </span>
        </button>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "overflow-hidden border-t border-border bg-background transition-[max-height] duration-300 ease-in-out lg:hidden",
          menuOpen ? "max-h-96" : "max-h-0 border-t-0"
        )}
      >
        <nav
          className="flex flex-col gap-1 px-4 py-4 sm:px-6"
          aria-label="Mobile"
        >
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="focus-ring rounded-md px-2 py-2.5 text-sm text-foreground-muted hover:bg-surface hover:text-foreground"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            <Button variant="secondary" size="md" className="w-full">
              Log in
            </Button>
            <Button variant="primary" size="md" className="w-full">
              Get Started Free
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
