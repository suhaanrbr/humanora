"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { AccountMenu } from "@/components/landing/AccountMenu";
import { cn } from "@/lib/cn";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/humanize", label: "Humanize" },
  { href: "/dashboard/voice", label: "My Voice" },
  { href: "/dashboard/history", label: "History" },
  { href: "/dashboard/billing", label: "Billing" },
];

/**
 * The authenticated app's own header — deliberately NOT the marketing
 * Header (Product/Solutions/Developers/Resources mega-menus). Reusing
 * the public nav inside the logged-in product was a real "feels like a
 * prototype" signal: once a user is inside HUMANORA, they need
 * Dashboard/Humanize/My Voice/History/Billing, not a marketing sitemap.
 */
export function AppHeader() {
  const pathname = usePathname();

  function isActive(href: string) {
    return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-lg">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="focus-ring shrink-0 rounded-md" aria-label="HUMANORA dashboard">
          <Logo size="sm" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="App navigation">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "focus-ring rounded-md px-3.5 py-2 text-sm font-medium transition-colors",
                isActive(item.href)
                  ? "bg-surface text-foreground"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="shrink-0">
          <AccountMenu />
        </div>
      </div>

      {/* Mobile: a compact horizontal tab strip instead of a hamburger —
          there's no mega-menu complexity here, just 5 flat destinations,
          so a scrollable row of pills is simpler and more discoverable
          at a glance than hiding them behind a menu button. */}
      <nav
        className="flex items-center gap-1.5 overflow-x-auto border-t border-border px-4 py-2 sm:px-6 lg:hidden"
        aria-label="App navigation"
      >
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "focus-ring shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "border-transparent bg-brand-gradient text-white"
                : "border-border bg-surface text-foreground-muted"
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
