"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { AccountMenu } from "@/components/landing/AccountMenu";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

type TileColor = "indigo" | "purple" | "pink" | "cyan";

interface NavItem {
  label: string;
  href: string;
  soon?: boolean;
  /** Short, honest one-line description — only real, shipped capabilities get one. */
  description?: string;
  icon?: (props: { className?: string }) => ReactElement;
  color?: TileColor;
}

interface NavGroup {
  label: string;
  subtitle: string;
  items: NavItem[];
  /** A real, single next step — only shown for groups with more than one item. */
  cta?: { label: string; href: string };
}

// "/#section" links work from any route (they resolve to the home page's
// in-page anchors). Items without a real destination are marked `soon`
// rather than pointing at a route that doesn't exist yet. Descriptions
// describe only what HUMANORA actually does today — no invented tools
// (no "AI Detector"/"AI Bypasser"-style features; HUMANORA doesn't
// claim to defeat AI detection, full stop).
const productItems: NavItem[] = [
  {
    label: "Humanizer",
    href: "/#hero",
    description: "Turn AI-assisted drafts into natural writing that still sounds like you.",
    icon: TileWriteIcon,
    color: "purple",
  },
  {
    label: "Writing Modes",
    href: "/#writing-modes",
    description: "Six rewrite styles — Natural, Academic, Professional, and more.",
    icon: TileModesIcon,
    color: "indigo",
  },
  {
    label: "My Voice",
    href: "/#my-voice",
    description: "Teach HUMANORA your own patterns from real writing samples.",
    icon: TileVoiceIcon,
    color: "cyan",
  },
  {
    label: "Document Rewrite",
    href: "#",
    description: "Rewrite whole documents in one pass, not paragraph by paragraph.",
    icon: TileDocIcon,
    color: "pink",
    soon: true,
  },
];

const solutionsItems: NavItem[] = [
  {
    label: "Students",
    href: "/#use-cases",
    description: "Turn rough drafts into submissions that sound like your own writing.",
    icon: TileStudentIcon,
    color: "purple",
  },
  {
    label: "Professionals",
    href: "/#use-cases",
    description: "Polish reports, emails, and proposals without losing your voice.",
    icon: TileWriteIcon,
    color: "indigo",
  },
  {
    label: "Creators",
    href: "/#use-cases",
    description: "Keep AI-assisted drafts sounding like a real person wrote them.",
    icon: TileModesIcon,
    color: "cyan",
  },
  {
    label: "Teams",
    href: "#",
    description: "Shared style profiles and usage across a whole workspace.",
    icon: TileDocIcon,
    color: "pink",
    soon: true,
  },
];

const resourcesItems: NavItem[] = [
  {
    label: "Blog",
    href: "/blog",
    description: "Writing tips, product updates, and how HUMANORA is built.",
    icon: TileDocIcon,
    color: "purple",
  },
  {
    label: "Guides",
    href: "#",
    description: "Step-by-step walkthroughs for getting the most out of HUMANORA.",
    icon: TileModesIcon,
    color: "indigo",
    soon: true,
  },
  {
    label: "FAQ",
    href: "/#pricing",
    description: "Common questions about plans, billing, and how HUMANORA works.",
    icon: TileVoiceIcon,
    color: "cyan",
  },
  {
    label: "Affiliates",
    href: "/affiliates",
    description: "Refer HUMANORA and earn a share of what you bring in.",
    icon: TileStudentIcon,
    color: "pink",
  },
];

// Pricing and Developers each have exactly one real destination today
// (there's no separate FAQ page or API sub-sections to link to yet) —
// rather than inventing extra items to fill out a menu, each panel
// just carries that one honest destination so it still gets the same
// floating "subwindow" treatment as Product/Solutions/Resources.
const pricingItems: NavItem[] = [
  {
    label: "Plans & FAQ",
    href: "/#pricing",
    description: "Compare Essential, Pro, and Ultra, and see what's included.",
    icon: TilePricingIcon,
    color: "purple",
  },
];
const developersItems: NavItem[] = [
  {
    label: "API overview",
    href: "/api",
    description: "Bring HUMANORA's rewrite engine into your own product — developer preview.",
    icon: TileDocIcon,
    color: "indigo",
  },
];

const navGroups: NavGroup[] = [
  {
    label: "Product",
    subtitle: "Powerful tools to write like yourself, faster.",
    items: productItems,
    cta: { label: "Try the Humanizer", href: "/dashboard/humanize" },
  },
  {
    label: "Solutions",
    subtitle: "Built for how you actually use HUMANORA.",
    items: solutionsItems,
    cta: { label: "See all use cases", href: "/#use-cases" },
  },
  { label: "Pricing", subtitle: "Simple plans, no surprises.", items: pricingItems },
  { label: "Developers", subtitle: "Bring HUMANORA into what you're building.", items: developersItems },
  {
    label: "Resources",
    subtitle: "Everything else worth knowing.",
    items: resourcesItems,
    cta: { label: "Read the blog", href: "/blog" },
  },
];

// One abstract line icon per top-level destination — same 1.6 stroke
// weight and "shape IS the mark" restraint as the dashboard rail's
// icons (see AppShell.tsx), not literal clip art. Each is painted with
// the shared brand gradient (defined once in <NavIconGradientDefs>)
// rather than a flat color, so the nav bar picks up a touch of the
// same indigo→purple→pink identity as the logo and primary buttons.
const NAV_ICONS: Record<string, (props: { className?: string }) => ReactElement> = {
  Product: NavProductIcon,
  Solutions: NavSolutionsIcon,
  Pricing: NavPricingIcon,
  Developers: NavDevelopersIcon,
  Resources: NavResourcesIcon,
};

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
  const [scrollProgress, setScrollProgress] = useState(0);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenGroup(null);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenGroup(null);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
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

        <nav ref={navRef} className="hidden items-center gap-1.5 lg:flex" aria-label="Primary">
          <NavIconGradientDefs />
          {navGroups.map((group, i) => {
            const Icon = NAV_ICONS[group.label];
            return (
            <div key={group.label} className="relative">
              <button
                type="button"
                onClick={() => setOpenGroup((g) => (g === group.label ? null : group.label))}
                aria-expanded={openGroup === group.label}
                className={cn(
                  "focus-ring press-feedback flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold tracking-tight transition-all",
                  openGroup === group.label
                    ? "border-brand-purple/40 bg-surface text-foreground shadow-glow-sm"
                    : "border-transparent text-foreground-muted hover:border-border hover:bg-surface/70 hover:text-foreground"
                )}
              >
                {Icon && <Icon className="h-4 w-4 shrink-0" />}
                {group.label}
                <ChevronIcon
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    openGroup === group.label && "rotate-180"
                  )}
                />
              </button>
              {/* The last two triggers sit near the right edge of the
                  header — a centered panel there would clip against the
                  viewport, so they open right-aligned instead. */}
              <NavFloatingPanel
                open={openGroup === group.label}
                label={group.label}
                subtitle={group.subtitle}
                items={group.items}
                cta={group.cta}
                onNavigate={() => setOpenGroup(null)}
                onClose={() => setOpenGroup(null)}
                align={i >= navGroups.length - 2 ? "right" : "center"}
              />
            </div>
            );
          })}
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

        {/* Mobile-only: a "you're signed in" cue on the collapsed top bar,
            without duplicating account actions — the hamburger panel
            below is the one place Dashboard/Log out live on mobile, so
            this is a plain link to /dashboard, not a second interactive
            menu with its own Log out control. */}
        <div className="flex items-center gap-2 lg:hidden">
          {!isPending && session && (
            <Link
              href="/dashboard"
              aria-label="Go to your dashboard"
              className="focus-ring press-feedback flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-white shadow-glow-sm"
            >
              {session.user.name?.trim()?.[0]?.toUpperCase() ?? "U"}
            </Link>
          )}
          <button
            type="button"
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground"
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
      </div>

      {/* A thin thread of the brand gradient tracking scroll position —
          the one element that literally travels the length of the page,
          making the navbar feel like part of the same continuous
          experience as the scroll story beneath it, not a fixed lid
          sitting on top of unrelated sections. */}
      <div className="h-px w-full bg-border/60" aria-hidden="true">
        <div
          className="bg-brand-gradient h-full transition-[width] duration-150 ease-out motion-reduce:transition-none"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "overflow-hidden border-t border-border bg-background transition-[max-height] duration-300 ease-in-out lg:hidden",
          menuOpen ? "max-h-[32rem] overflow-y-auto" : "max-h-0 border-t-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-4 sm:px-6" aria-label="Mobile">
          {navGroups.map((group) => (
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
                    <NavTile key={item.label} item={item} onNavigate={() => setMenuOpen(false)} />
                  ))}
                </div>
              )}
            </div>
          ))}

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

/**
 * The desktop nav's "floating" sub-menu — always mounted (so the
 * open/close transition can actually animate instead of popping), a
 * genuinely separate elevated surface rather than a plain list glued
 * under the trigger: rounded-2xl, a lifted shadow-glow, a soft scale +
 * fade on open, and each item rendered as its own row with the same
 * illuminated-left-edge hover language used in the dashboard's nav
 * rail — so the marketing site and the app read as one HUMANORA
 * vocabulary, just applied to a different surface.
 */
const TILE_COLOR_CLASSES: Record<TileColor, string> = {
  indigo: "bg-brand-indigo/15 text-brand-indigo",
  purple: "bg-brand-purple/15 text-brand-purple",
  pink: "bg-brand-pink/15 text-brand-pink",
  cyan: "bg-brand-cyan/15 text-brand-cyan",
};

/**
 * The nav's "subwindow" — a genuinely separate elevated surface (not a
 * thin list glued under the trigger): a title + one-line subtitle, a
 * close button, a grid of real destinations as icon tiles, and — for
 * groups with a natural next step — a footer CTA. Every tile is a real
 * HUMANORA capability with an honest description; nothing here is
 * decorative or invented. Always mounted (never conditionally
 * rendered) so open/close can actually transition instead of popping.
 */
function NavFloatingPanel({
  open,
  label,
  subtitle,
  items,
  cta,
  onNavigate,
  onClose,
  align = "center",
}: {
  open: boolean;
  label: string;
  subtitle: string;
  items: NavItem[];
  cta?: { label: string; href: string };
  onNavigate: () => void;
  onClose: () => void;
  align?: "center" | "right";
}) {
  const wide = items.length > 1;
  return (
    <div
      className={cn(
        "border-border-strong/60 absolute top-full z-50 mt-3 rounded-2xl border bg-background-elevated/95 shadow-glow-sm backdrop-blur-xl transition-[opacity,transform] duration-150 ease-out",
        wide ? "w-[36rem]" : "w-80",
        align === "right" ? "right-0 origin-top-right" : "left-1/2 origin-top -translate-x-1/2",
        open
          ? "translate-y-0 scale-100 opacity-100"
          : cn("pointer-events-none -translate-y-1 scale-95 opacity-0", align === "right" && "translate-x-0")
      )}
      role="menu"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <p className="font-display text-lg font-bold tracking-tight text-foreground">{label}</p>
          <p className="mt-0.5 text-sm text-foreground-muted">{subtitle}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${label} menu`}
          className="focus-ring press-feedback flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground-subtle transition-colors hover:bg-surface hover:text-foreground"
        >
          <CloseIcon className="h-4 w-4" />
        </button>
      </div>

      <div className={cn("grid gap-1.5 p-3", wide && "grid-cols-2")}>
        {items.map((item) => (
          <NavTile key={item.label} item={item} onNavigate={onNavigate} />
        ))}
      </div>

      {cta && (
        <div className="flex items-center justify-between gap-4 border-t border-border bg-surface/40 px-5 py-3.5">
          <p className="text-sm text-foreground-muted">Not sure where to start?</p>
          <a
            href={cta.href}
            onClick={onNavigate}
            className="focus-ring press-feedback bg-brand-gradient inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-glow-sm transition-transform hover:scale-[1.03]"
          >
            {cta.label}
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}

function NavTile({ item, onNavigate }: { item: NavItem; onNavigate: () => void }) {
  const Icon = item.icon;
  const colorClass = TILE_COLOR_CLASSES[item.color ?? "purple"];

  const content = (
    <>
      {Icon && (
        <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", colorClass)}>
          <Icon className="h-5 w-5" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{item.label}</span>
          {item.soon && (
            <span className="shrink-0 rounded-full border border-border px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-foreground-subtle">
              Soon
            </span>
          )}
        </span>
        {item.description && <span className="mt-0.5 block text-xs text-foreground-subtle">{item.description}</span>}
      </span>
      {!item.soon && (
        <ChevronIcon className="h-3.5 w-3.5 shrink-0 -rotate-90 text-foreground-subtle opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </>
  );

  if (item.soon) {
    return (
      <span className="flex cursor-not-allowed items-start gap-3 rounded-xl p-3 text-left">{content}</span>
    );
  }
  return (
    <a
      href={item.href}
      onClick={onNavigate}
      className="focus-ring group flex items-start gap-3 rounded-xl p-3 text-left transition-colors hover:bg-surface"
    >
      {content}
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

/**
 * One <linearGradient> defined once (a hidden, zero-size SVG), reused
 * by every nav icon via `stroke="url(#nav-icon-gradient)"` — the same
 * indigo→purple→pink spectrum as the logo mark and primary buttons,
 * without redefining the gradient five times over.
 */
function NavIconGradientDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        <linearGradient id="nav-icon-gradient" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-brand-indigo)" />
          <stop offset="55%" stopColor="var(--color-brand-purple)" />
          <stop offset="100%" stopColor="var(--color-brand-pink)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const NAV_ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": true as const,
  stroke: "url(#nav-icon-gradient)",
  strokeWidth: "1.6",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

// Abstract line marks, not literal clip art — same restraint as the
// dashboard rail's icon language (AppShell.tsx), just gradient-stroked
// instead of solid, since these sit on a lighter-touch marketing
// surface rather than a persistent app rail.
function NavProductIcon({ className }: { className?: string }) {
  return (
    <svg {...NAV_ICON_PROPS} className={className}>
      <path d="M4 20 15 9M17 3l1.2 2.6L21 7l-2.6 1.2L17 11l-1.2-2.8L13 7l2.8-1.4L17 3Z" />
    </svg>
  );
}
function NavSolutionsIcon({ className }: { className?: string }) {
  return (
    <svg {...NAV_ICON_PROPS} className={className}>
      <path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" />
      <path d="m8 11 3 3 5-6" />
    </svg>
  );
}
function NavPricingIcon({ className }: { className?: string }) {
  return (
    <svg {...NAV_ICON_PROPS} className={className}>
      <path d="M12 4v16M8 7.5c0-1.4 1.6-2.5 4-2.5s4 1.1 4 2.5-1.6 2.5-4 2.5-4 1.1-4 2.5 1.6 2.5 4 2.5 4-1.1 4-2.5" />
    </svg>
  );
}
function NavDevelopersIcon({ className }: { className?: string }) {
  return (
    <svg {...NAV_ICON_PROPS} className={className}>
      <path d="m9 8-5 4 5 4M15 8l5 4-5 4" />
    </svg>
  );
}
function NavResourcesIcon({ className }: { className?: string }) {
  return (
    <svg {...NAV_ICON_PROPS} className={className}>
      <path d="M4 19.5V6a1.5 1.5 0 0 1 1.5-1.5H14l6 6v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.5Z" />
      <path d="M14 4.5V10h5.5M9 13h6M9 16.5h6" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="m5 5 10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

// Tile icons — flat currentColor (each tile sets its own text color via
// TILE_COLOR_CLASSES), same abstract-line restraint as the nav
// triggers' gradient icons above, just simpler shapes at a smaller
// visual weight since they sit inside a colored badge rather than
// directly on the nav bar.
const TILE_ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": true as const,
  stroke: "currentColor",
  strokeWidth: "1.7",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};
function TileWriteIcon({ className }: { className?: string }) {
  return (
    <svg {...TILE_ICON_PROPS} className={className}>
      <path d="M4 20 15 9M17 3l1.2 2.6L21 7l-2.6 1.2L17 11l-1.2-2.8L13 7l2.8-1.4L17 3Z" />
    </svg>
  );
}
function TileModesIcon({ className }: { className?: string }) {
  return (
    <svg {...TILE_ICON_PROPS} className={className}>
      <rect x="4" y="4" width="7" height="16" rx="1.3" />
      <rect x="13" y="4" width="7" height="9.5" rx="1.3" />
    </svg>
  );
}
function TileVoiceIcon({ className }: { className?: string }) {
  return (
    <svg {...TILE_ICON_PROPS} className={className}>
      <path d="M12 3a7 7 0 0 1 7 7v2a9 9 0 0 1-2 5.5M6.6 18A9 9 0 0 1 5 12v-2a7 7 0 0 1 1.2-3.9M9 21a11 11 0 0 0 1.5-5.6V11a1.5 1.5 0 1 1 3 0v1.2M12 17.5c1.7 0 3-1.3 3-3V11" />
    </svg>
  );
}
function TileDocIcon({ className }: { className?: string }) {
  return (
    <svg {...TILE_ICON_PROPS} className={className}>
      <path d="M6.5 3.5h8l4 4v13a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5V8h4.5M8.5 12.5h7M8.5 16h7" />
    </svg>
  );
}
function TileStudentIcon({ className }: { className?: string }) {
  return (
    <svg {...TILE_ICON_PROPS} className={className}>
      <path d="m3 8 9-4 9 4-9 4-9-4Z" />
      <path d="M7 10.5V16c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5v-5.5M21 8v6" />
    </svg>
  );
}
function TilePricingIcon({ className }: { className?: string }) {
  return (
    <svg {...TILE_ICON_PROPS} className={className}>
      <path d="M12 4v16M8 7.5c0-1.4 1.6-2.5 4-2.5s4 1.1 4 2.5-1.6 2.5-4 2.5-4 1.1-4 2.5 1.6 2.5 4 2.5 4-1.1 4-2.5" />
    </svg>
  );
}
