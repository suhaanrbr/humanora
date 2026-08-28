"use client";

import { useState, type ReactElement, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo, LogoMark } from "@/components/brand/Logo";
import { AccountMenu } from "@/components/landing/AccountMenu";
import { CommandPalette, CommandTrigger, SearchIcon } from "@/components/dashboard/CommandPalette";
import { cn } from "@/lib/cn";

interface NavEntry {
  href: string;
  label: string;
  icon: (props: { className?: string }) => ReactElement;
}

// Icons are deliberately abstract line marks (not literal book/pencil/
// fingerprint clip-art) — mature, not "school software". Same 1.6
// stroke weight throughout so the rail reads as one family regardless
// of which destination is active. Billing/Settings live in the account
// menu (see AccountMenu.tsx), not here — administration isn't a thing
// a student "does" in the product, so it doesn't compete for space
// with the five real capabilities below.
const NAV_ENTRIES: NavEntry[] = [
  { href: "/dashboard", label: "Home", icon: HomeIcon },
  { href: "/dashboard/humanize", label: "Write", icon: WriteIcon },
  { href: "/dashboard/study", label: "Study", icon: StudyIcon },
  { href: "/dashboard/voice", label: "My Voice", icon: VoiceIcon },
  { href: "/dashboard/history", label: "Library", icon: LibraryIcon },
  { href: "/dashboard/projects", label: "Projects", icon: ProjectsIcon },
  { href: "/dashboard/templates", label: "Templates", icon: TemplatesIcon },
  { href: "/dashboard/ai-detector", label: "AI Detector", icon: DetectorIcon },
  { href: "/dashboard/chat-with-docs", label: "Chat with Docs", icon: ChatIcon },
  { href: "/dashboard/brand-voice", label: "Brand Voice", icon: BrandVoiceIcon },
  { href: "/dashboard/integrations", label: "Integrations", icon: IntegrationsIcon },
  { href: "/dashboard/analytics", label: "Analytics", icon: AnalyticsIcon },
];

// Mobile keeps only the original five real, everyday destinations — the
// ones a thumb reaches for constantly. The newer nav entries (Projects
// through Analytics) are mostly "coming soon" placeholders today (see
// ComingSoon.tsx) and, even once real, are lower-frequency than Write/
// Study/My Voice/Library; they stay one tap away via the desktop/tablet
// rail rather than crowding a bottom bar built for five items.
const MOBILE_NAV_ENTRIES = NAV_ENTRIES.filter((e) =>
  ["/dashboard", "/dashboard/humanize", "/dashboard/study", "/dashboard/voice"].includes(e.href)
);

/**
 * HUMANORA's application shell — a persistent environment the
 * workspace pages sit inside, replacing the previous horizontally-
 * scrolling top nav. `.app-atmosphere` (Stage 1) is one continuous
 * fixed backdrop behind every route here, so moving between Write,
 * Study, My Voice, and Library reads as moving through one place
 * rather than loading a new page each time.
 *
 * Three distinct compositions, not one layout stretched/squeezed:
 * a labeled rail at 1024px+, an icon-only rail from 768-1023px
 * (tablet), and a bottom bar + slim top bar below 768px (mobile).
 */
export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  // Owned once, here — both trigger buttons (rail + mobile header) just
  // call setPaletteOpen(true); the overlay itself renders exactly once
  // below, regardless of viewport. Mounting the whole CommandPalette in
  // both responsive slots would double the global Cmd+K listener and
  // stack two competing full-screen overlays.
  const [paletteOpen, setPaletteOpen] = useState(false);

  function isActive(href: string) {
    return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  }

  return (
    <div className="relative min-h-screen">
      <div className="app-atmosphere" aria-hidden="true" />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      {/* Desktop/tablet: persistent left rail. */}
      <nav
        aria-label="Primary"
        className="fixed inset-y-0 left-0 z-40 hidden w-[76px] flex-col border-r border-border bg-background/85 backdrop-blur-lg md:flex lg:w-60"
      >
        <Link href="/dashboard" className="focus-ring flex h-16 shrink-0 items-center justify-center px-3 lg:justify-start lg:px-5" aria-label="HUMANORA home">
          <span className="lg:hidden">
            <LogoMark size="sm" />
          </span>
          <span className="hidden lg:block">
            <Logo size="sm" />
          </span>
        </Link>

        {/* Full search field at 1024px+; a compact icon-only trigger for
            the icon-only tablet rail (768-1023px) — the labeled input
            has no room there, but the capability shouldn't disappear
            just because there's no keyboard shortcut discoverability
            without a keyboard. */}
        <div className="hidden px-3.5 pb-2 lg:block">
          <CommandTrigger onOpen={() => setPaletteOpen(true)} />
        </div>
        <div className="hidden justify-center pb-2 md:flex lg:hidden">
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            aria-label="Search or jump to…"
            className="focus-ring press-feedback flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-foreground-subtle transition-colors hover:border-border-interactive hover:text-foreground-muted"
          >
            <SearchIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-1 px-2.5 py-3 lg:px-3.5">
          {NAV_ENTRIES.map((entry) => {
            const active = isActive(entry.href);
            return (
              <Link
                key={entry.href}
                href={entry.href}
                aria-current={active ? "page" : undefined}
                title={entry.label}
                className={cn(
                  "focus-ring group relative flex items-center gap-3 rounded-md px-2.5 py-2.5 text-sm font-medium transition-colors lg:px-3",
                  active ? "bg-surface text-foreground" : "text-foreground-muted hover:bg-surface hover:text-foreground"
                )}
              >
                {active && <span aria-hidden="true" className="nav-illuminated bg-brand-gradient absolute -left-2.5 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full lg:-left-3.5" />}
                <entry.icon className="h-5 w-5 shrink-0" />
                <span className="hidden lg:inline">{entry.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center justify-center border-t border-border p-3 lg:justify-start lg:px-5">
          <AccountMenu showAppLinks={false} />
        </div>
      </nav>

      {/* Mobile: slim top bar (brand + command trigger) plus a bottom
          bar for the four primary destinations. */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-lg md:hidden">
        <Link href="/dashboard" className="focus-ring shrink-0 rounded-md" aria-label="HUMANORA home">
          <LogoMark size="sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <CommandTrigger onOpen={() => setPaletteOpen(true)} />
        </div>
        <div className="shrink-0">
          <AccountMenu showAppLinks={false} />
        </div>
      </header>

      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-border bg-background/95 backdrop-blur-lg md:hidden"
      >
        {MOBILE_NAV_ENTRIES.map((entry) => {
          const active = isActive(entry.href);
          return (
            <Link
              key={entry.href}
              href={entry.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "focus-ring press-feedback flex flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                active ? "text-foreground" : "text-foreground-subtle"
              )}
            >
              <entry.icon className={cn("h-5 w-5", active && "text-brand-purple")} />
              {entry.label}
            </Link>
          );
        })}
      </nav>

      <main className="relative z-10 pb-24 pt-8 sm:pt-10 md:ml-[76px] md:pb-14 lg:ml-60">{children}</main>
    </div>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 11.5 12 4l8 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6 10v9h12v-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function WriteIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 20 15 9M17 3l1.2 2.6L21 7l-2.6 1.2L17 11l-1.2-2.8L13 7l2.8-1.4L17 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function StudyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="4" width="7" height="16" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="4" width="7" height="9.5" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function VoiceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 3a7 7 0 0 1 7 7v2a9 9 0 0 1-2 5.5M6.6 18A9 9 0 0 1 5 12v-2a7 7 0 0 1 1.2-3.9M9 21a11 11 0 0 0 1.5-5.6V11a1.5 1.5 0 1 1 3 0v1.2M12 17.5c1.7 0 3-1.3 3-3V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function LibraryIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M3.5 12a8.5 8.5 0 1 0 2.7-6.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M3.5 4.5V9h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8v4.5l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function ProjectsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="6" width="17" height="13" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 6.5 6 4h4l1.6 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function TemplatesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="4" width="7" height="7" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4" y="13" width="7" height="7" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="13" width="7" height="7" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
function DetectorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="m20.5 20.5-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 5.5h16v10H9l-4 3.5v-3.5H4Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BrandVoiceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M8 4h8l3 4-3 4H8l-3-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 12v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function IntegrationsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="9.5" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14.5" y="9.5" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 12.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function AnalyticsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 19V10M12 19V5M19 19v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
