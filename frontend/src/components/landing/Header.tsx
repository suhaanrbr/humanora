"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { AccountMenu } from "@/components/landing/AccountMenu";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

interface NavItem {
  label: string;
  href: string;
  soon?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

// "/#section" links work from any route (they resolve to the home page's
// in-page anchors). Items without a real destination are marked `soon`
// rather than pointing at a route that doesn't exist yet.
const productItems: NavItem[] = [
  { label: "Humanizer", href: "/#hero" },
  { label: "Writing Modes", href: "/#writing-modes" },
  { label: "My Voice", href: "/#my-voice" },
  { label: "Document Rewrite", href: "#", soon: true },
];

const solutionsItems: NavItem[] = [
  { label: "Students", href: "/#use-cases" },
  { label: "Professionals", href: "/#use-cases" },
  { label: "Creators", href: "/#use-cases" },
  { label: "Teams", href: "#", soon: true },
];

const resourcesItems: NavItem[] = [
  { label: "Blog", href: "/blog" },
  { label: "Guides", href: "#", soon: true },
  { label: "FAQ", href: "/#pricing" },
  { label: "Affiliates", href: "/affiliates" },
];

const navGroups: NavGroup[] = [
  { label: "Product", items: productItems },
  { label: "Solutions", items: solutionsItems },
];

/**
 * Landing page header. Sticky, translucent over the dark background so it
 * reads as part of the page rather than a generic floating navbar.
 * Mobile viewports get a dedicated slide-down menu instead of a squeezed
 * desktop nav.
 */
export function Header() {
  const { data: session, isPending } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        scrolled
          ? "border-border bg-background/90 backdrop-blur-lg shadow-card"
          : "border-transparent bg-background/80 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="focus-ring rounded-md" aria-label="HUMANORA home">
          <Logo size="sm" />
        </Link>

        <nav ref={navRef} className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navGroups.map((group) => (
            <div key={group.label} className="relative">
              <button
                type="button"
                onClick={() => setOpenGroup((g) => (g === group.label ? null : group.label))}
                aria-expanded={openGroup === group.label}
                className="focus-ring flex cursor-pointer items-center gap-1 rounded-md px-3 py-2 text-sm text-foreground-muted transition-colors hover:text-foreground"
              >
                {group.label}
                <ChevronIcon
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    openGroup === group.label && "rotate-180"
                  )}
                />
              </button>
              {openGroup === group.label && (
                <div className="absolute left-0 top-full mt-1 w-56 pearl-glass rounded-lg p-2">
                  {group.items.map((item) => (
                    <NavDropdownLink key={item.label} item={item} onNavigate={() => setOpenGroup(null)} />
                  ))}
                </div>
              )}
            </div>
          ))}

          <Link
            href="/#pricing"
            className="focus-ring rounded-md px-3 py-2 text-sm text-foreground-muted transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="/api"
            className="focus-ring rounded-md px-3 py-2 text-sm text-foreground-muted transition-colors hover:text-foreground"
          >
            Developers
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenGroup((g) => (g === "Resources" ? null : "Resources"))}
              aria-expanded={openGroup === "Resources"}
              className="focus-ring flex cursor-pointer items-center gap-1 rounded-md px-3 py-2 text-sm text-foreground-muted transition-colors hover:text-foreground"
            >
              Resources
              <ChevronIcon className={cn("h-3.5 w-3.5 transition-transform", openGroup === "Resources" && "rotate-180")} />
            </button>
            {openGroup === "Resources" && (
              <div className="absolute left-0 top-full mt-1 w-56 pearl-glass rounded-lg p-2">
                {resourcesItems.map((item) => (
                  <NavDropdownLink key={item.label} item={item} onNavigate={() => setOpenGroup(null)} />
                ))}
              </div>
            )}
          </div>
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {isPending ? (
            <div className="h-9 w-24" aria-hidden="true" />
          ) : session ? (
            <AccountMenu />
          ) : (
            <>
              <ButtonLink href="/login" variant="ghost" size="sm">
                Log in
              </ButtonLink>
              <ButtonLink href="/dashboard/humanize" variant="primary" size="sm">
                Get Started Free
              </ButtonLink>
            </>
          )}
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
          menuOpen ? "max-h-[32rem] overflow-y-auto" : "max-h-0 border-t-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-4 sm:px-6" aria-label="Mobile">
          {[...navGroups, { label: "Resources", items: resourcesItems }].map((group) => (
            <div key={group.label}>
              <button
                type="button"
                onClick={() =>
                  setOpenMobileGroup((g) => (g === group.label ? null : group.label))
                }
                className="focus-ring flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-2.5 text-sm text-foreground-muted hover:bg-surface hover:text-foreground"
              >
                {group.label}
                <ChevronIcon
                  className={cn("h-3.5 w-3.5 transition-transform", openMobileGroup === group.label && "rotate-180")}
                />
              </button>
              {openMobileGroup === group.label && (
                <div className="ml-2 flex flex-col gap-1 border-l border-border pl-3">
                  {group.items.map((item) => (
                    <NavDropdownLink key={item.label} item={item} onNavigate={() => setMenuOpen(false)} />
                  ))}
                </div>
              )}
            </div>
          ))}

          <Link
            href="/#pricing"
            onClick={() => setMenuOpen(false)}
            className="focus-ring rounded-md px-2 py-2.5 text-sm text-foreground-muted hover:bg-surface hover:text-foreground"
          >
            Pricing
          </Link>
          <Link
            href="/api"
            onClick={() => setMenuOpen(false)}
            className="focus-ring rounded-md px-2 py-2.5 text-sm text-foreground-muted hover:bg-surface hover:text-foreground"
          >
            Developers
          </Link>

          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            {!isPending && session ? (
              <>
                <ButtonLink href="/dashboard" variant="secondary" size="md" className="w-full" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </ButtonLink>
                <MobileSignOutLink onNavigate={() => setMenuOpen(false)} />
              </>
            ) : (
              <>
                <ButtonLink href="/login" variant="secondary" size="md" className="w-full" onClick={() => setMenuOpen(false)}>
                  Log in
                </ButtonLink>
                <ButtonLink href="/dashboard/humanize" variant="primary" size="md" className="w-full" onClick={() => setMenuOpen(false)}>
                  Get Started Free
                </ButtonLink>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

function NavDropdownLink({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  if (item.soon) {
    return (
      <span className="flex cursor-not-allowed items-center justify-between rounded-md px-3 py-2 text-sm text-foreground-subtle">
        {item.label}
        <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide">
          Soon
        </span>
      </span>
    );
  }
  return (
    <a
      href={item.href}
      onClick={onNavigate}
      className="focus-ring block rounded-md px-3 py-2 text-sm text-foreground-muted hover:bg-background-elevated hover:text-foreground"
    >
      {item.label}
    </a>
  );
}

function MobileSignOutLink({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignOut() {
    setLoading(true);
    await signOut();
    onNavigate();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="focus-ring press-feedback w-full cursor-pointer rounded-md border border-border-strong bg-surface px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-brand-purple/40 disabled:opacity-50"
    >
      {loading ? "Logging out…" : "Log out"}
    </button>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
