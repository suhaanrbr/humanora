"use client";

import { useEffect, useRef, useState, type ReactElement } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { AccountMenu } from "@/components/landing/AccountMenu";
import { useSession, signOut } from "@/lib/auth-client";
import { writingModes } from "@/lib/config/modes";
import { PAID_PLAN_IDS, PLANS } from "@/lib/config/plans";
import { cn } from "@/lib/cn";

type GroupId = "product" | "solutions" | "pricing" | "developers" | "resources";

const GROUP_LABELS: Record<GroupId, string> = {
  product: "Product",
  solutions: "Solutions",
  pricing: "Pricing",
  developers: "Developers",
  resources: "Resources",
};
const GROUP_ORDER: GroupId[] = ["product", "solutions", "pricing", "developers", "resources"];

// Every destination below is a route or in-page anchor that actually
// exists today. Nothing marked "Soon" — a smaller menu of real
// destinations beats a bigger one padded with placeholders.
const PRODUCT_CAPABILITIES = [
  {
    id: "humanizer",
    label: "Humanizer",
    href: "/#hero",
    blurb: "Turn an AI-assisted draft into writing that reads like you wrote it.",
  },
  {
    id: "modes",
    label: "Writing Modes",
    href: "/#writing-modes",
    blurb: `${writingModes.length} rewrite styles, from ${writingModes[0].name} to ${writingModes[writingModes.length - 1].name}.`,
  },
  {
    id: "voice",
    label: "My Voice",
    href: "/#my-voice",
    blurb: "A style profile built from your own writing samples.",
  },
  {
    id: "study",
    label: "Study",
    href: "/dashboard/study",
    blurb: "Summarize, explain, or turn material into structured notes.",
  },
  {
    id: "library",
    label: "Library",
    href: "/dashboard/history",
    blurb: "Every past rewrite, saved automatically and ready to reuse.",
  },
] as const;

// Framed by audience, but every description points at the same six
// real situations in the /#use-cases section — not a separate,
// invented feature set. "Teams" was dropped rather than shown as
// "Soon": HUMANORA has no team functionality today.
const SOLUTIONS = [
  {
    id: "students",
    label: "Students",
    description: "Coursework and personal statements that still sound like your own writing.",
    helps: "Writing Modes, My Voice",
  },
  {
    id: "professionals",
    label: "Professionals",
    description: "Emails, reports, and everyday writing that reads naturally, not machine-drafted.",
    helps: "Humanizer, Writing Modes",
  },
  {
    id: "creators",
    label: "Creators",
    description: "Blog drafts and long-form writing with a voice that's recognizably yours.",
    helps: "My Voice, Writing Modes",
  },
] as const;

/**
 * HUMANORA's desktop navigation — one persistent shell attached to the
 * header, not five copies of the same dropdown. Each destination gets
 * its own composition (Product explores capabilities with a live
 * preview, Solutions reads as editorial copy, Pricing is a direct
 * compact comparison from the real plan config, Developers is quiet
 * and technical, Resources is a short reading list) — switching
 * between them cross-fades in place instead of closing and reopening.
 */
export function Header() {
  const { data: session, isPending } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeGroup, setActiveGroup] = useState<GroupId | null>(null);
  const [openMobileGroup, setOpenMobileGroup] = useState<string | null>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const navRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRefs = useRef<Partial<Record<GroupId, HTMLButtonElement | null>>>({});

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
      if (navRef.current && !navRef.current.contains(e.target as Node) && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setActiveGroup(null);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && activeGroup) {
        e.preventDefault();
        const trigger = triggerRefs.current[activeGroup];
        setActiveGroup(null);
        trigger?.focus();
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeGroup]);

  // Move focus into the panel whenever it opens or switches to a
  // different destination — keyboard users land somewhere useful
  // instead of the focus staying stranded on the trigger row. This is
  // a DOM focus move, not a state update, so it doesn't need the
  // set-state-in-effect exception used elsewhere in this codebase.
  useEffect(() => {
    if (!activeGroup) return;
    const id = window.setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>("a,button");
      first?.focus();
    }, 10);
    return () => window.clearTimeout(id);
  }, [activeGroup]);

  function toggle(group: GroupId) {
    setActiveGroup((g) => (g === group ? null : group));
  }

  function onTriggerKeyDown(e: React.KeyboardEvent, index: number) {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = GROUP_ORDER[(index + 1) % GROUP_ORDER.length];
      triggerRefs.current[next]?.focus();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = GROUP_ORDER[(index - 1 + GROUP_ORDER.length) % GROUP_ORDER.length];
      triggerRefs.current[prev]?.focus();
    }
  }

  const panelOpen = activeGroup !== null;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition-[background-color,border-color,backdrop-filter] duration-300",
        panelOpen
          ? "border-transparent bg-background/95 backdrop-blur-lg"
          : scrolled
            ? "border-border bg-background/90 backdrop-blur-lg shadow-card"
            : "border-transparent bg-background/80 backdrop-blur-sm"
      )}
    >
      {/* Three deliberate zones (logo / nav / account), not a plain
          justify-between — the center column is free-sized so the nav
          group can sit with its own consistent rhythm regardless of
          how wide the left/right zones are. */}
      <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="focus-ring rounded-md" aria-label="HUMANORA home">
          <Logo size="sm" />
        </Link>

        <nav ref={navRef} className="hidden items-center justify-center gap-1.5 lg:flex" aria-label="Primary">
          {GROUP_ORDER.map((group, i) => (
            <button
              key={group}
              ref={(el) => {
                triggerRefs.current[group] = el;
              }}
              type="button"
              onClick={() => toggle(group)}
              onKeyDown={(e) => onTriggerKeyDown(e, i)}
              aria-expanded={activeGroup === group}
              aria-controls="nav-panel"
              className={cn(
                "focus-ring press-feedback cursor-pointer rounded-lg border border-transparent px-3.5 py-2 text-[0.9rem] font-medium tracking-tight transition-[color,background-color,border-color] duration-200",
                activeGroup === group
                  ? "border-white/10 bg-white/[0.04] text-foreground"
                  : "text-foreground-muted hover:border-white/[0.06] hover:bg-white/[0.025] hover:text-foreground"
              )}
            >
              {GROUP_LABELS[group]}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2.5 lg:flex">
          {isPending ? (
            <div className="h-9 w-24" aria-hidden="true" />
          ) : session ? (
            <AccountMenu />
          ) : (
            <>
              <ButtonLink href="/login" variant="outline" size="sm">
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

      {/* The nav shell — one surface, full-bleed under the header, its
          inner content matching the page's own max-w-7xl column so it
          reads as part of the site's grid rather than a floating card.
          Height animates via a grid-template-rows trick (0fr -> 1fr)
          so each destination's real content height "just works"
          without measuring — Pricing stays compact, Product doesn't. */}
      <div
        id="nav-panel"
        role="menu"
        aria-hidden={!panelOpen}
        inert={!panelOpen}
        className={cn(
          // relative z-50: without an explicit position/z-index this is
          // an unpositioned element, which ALWAYS paints below the
          // fixed z-40 backdrop scrim below regardless of the scrim's
          // lower z-index number — a real bug (confirmed via a failed
          // real-mouse hover test) that made every link inside an open
          // panel unclickable, not just a visual nit.
          "relative z-50 grid border-b bg-background/98 backdrop-blur-2xl transition-[grid-template-rows] duration-250 ease-out",
          panelOpen ? "grid-rows-[1fr] border-border" : "grid-rows-[0fr] border-transparent"
        )}
      >
        <div className="overflow-hidden">
          <div ref={panelRef} className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
            {activeGroup && (
              <div key={activeGroup} className="animate-nav-panel-fade-in">
                {activeGroup === "product" && <ProductPanel onNavigate={() => setActiveGroup(null)} />}
                {activeGroup === "solutions" && <SolutionsPanel onNavigate={() => setActiveGroup(null)} />}
                {activeGroup === "pricing" && <PricingPanel onNavigate={() => setActiveGroup(null)} />}
                {activeGroup === "developers" && <DevelopersPanel onNavigate={() => setActiveGroup(null)} />}
                {activeGroup === "resources" && <ResourcesPanel onNavigate={() => setActiveGroup(null)} />}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* A very subtle depth response behind the panel — not a full-page
          dim/blur "modal" treatment, just enough separation that the
          open panel reads as sitting above the page rather than
          floating disconnected from it. Doubles as an outside-click
          target. */}
      <div
        aria-hidden="true"
        onClick={() => setActiveGroup(null)}
        className={cn(
          "fixed inset-x-0 top-16 bottom-0 z-40 bg-background/45 transition-opacity duration-200",
          panelOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
      />

      {/* A thin thread of the brand gradient tracking scroll position —
          the one element that literally travels the length of the page,
          making the navbar feel like part of the same continuous
          experience as the scroll story beneath it, not a fixed lid
          sitting on top of unrelated sections. */}
      <div className="relative z-50 h-px w-full bg-border/60" aria-hidden="true">
        <div
          className="bg-brand-gradient h-full transition-[width] duration-150 ease-out motion-reduce:transition-none"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "relative z-50 overflow-hidden border-t border-border bg-background transition-[max-height] duration-300 ease-in-out lg:hidden",
          menuOpen ? "max-h-[36rem] overflow-y-auto" : "max-h-0 border-t-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-4 py-4 sm:px-6" aria-label="Mobile">
          <MobileGroup label="Product" open={openMobileGroup === "Product"} onToggle={() => setOpenMobileGroup((g) => (g === "Product" ? null : "Product"))}>
            {PRODUCT_CAPABILITIES.map((item) => (
              <MobileLink key={item.id} href={item.href} label={item.label} onNavigate={() => setMenuOpen(false)} />
            ))}
          </MobileGroup>
          <MobileGroup label="Solutions" open={openMobileGroup === "Solutions"} onToggle={() => setOpenMobileGroup((g) => (g === "Solutions" ? null : "Solutions"))}>
            {SOLUTIONS.map((item) => (
              <MobileLink key={item.id} href="/#use-cases" label={item.label} onNavigate={() => setMenuOpen(false)} />
            ))}
          </MobileGroup>
          <MobileLink href="/#pricing" label="Pricing" onNavigate={() => setMenuOpen(false)} top />
          <MobileLink href="/api" label="Developers" onNavigate={() => setMenuOpen(false)} top />
          <MobileGroup label="Resources" open={openMobileGroup === "Resources"} onToggle={() => setOpenMobileGroup((g) => (g === "Resources" ? null : "Resources"))}>
            <MobileLink href="/blog" label="Blog" onNavigate={() => setMenuOpen(false)} />
            <MobileLink href="/#pricing" label="FAQ" onNavigate={() => setMenuOpen(false)} />
            <MobileLink href="/affiliates" label="Affiliates" onNavigate={() => setMenuOpen(false)} />
          </MobileGroup>

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

/* ==========================================================================
   PRODUCT — the strongest menu: a list of real capabilities on the left,
   a live preview on the right that reacts to hover/focus. Defaults to
   the Humanizer so the panel is never empty before anyone interacts.
   ========================================================================== */
function ProductPanel({ onNavigate }: { onNavigate: () => void }) {
  const [activeId, setActiveId] = useState<(typeof PRODUCT_CAPABILITIES)[number]["id"]>("humanizer");
  const active = PRODUCT_CAPABILITIES.find((c) => c.id === activeId) ?? PRODUCT_CAPABILITIES[0];

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div>
        <p className="text-app-label text-brand-purple">Product</p>
        <h2 className="font-display mt-1.5 text-2xl font-bold tracking-tight text-foreground">
          What HUMANORA actually does
        </h2>
        <div className="mt-6 flex flex-col divide-y divide-border border-t border-border">
          {PRODUCT_CAPABILITIES.map((item) => (
            <a
              key={item.id}
              href={item.href}
              onClick={onNavigate}
              onMouseEnter={() => setActiveId(item.id)}
              onFocus={() => setActiveId(item.id)}
              className={cn(
                "focus-ring group flex items-baseline justify-between gap-6 py-3.5 transition-colors",
                activeId === item.id ? "text-foreground" : "text-foreground-muted hover:text-foreground"
              )}
            >
              <span className="flex items-baseline gap-3">
                <span className="text-base font-semibold">{item.label}</span>
                <span className="hidden text-sm text-foreground-subtle sm:inline">{item.blurb}</span>
              </span>
              <ArrowRightIcon
                className={cn(
                  "h-4 w-4 shrink-0 -translate-x-1 opacity-0 transition-[opacity,transform] duration-150",
                  activeId === item.id && "translate-x-0 opacity-100"
                )}
              />
            </a>
          ))}
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="rounded-2xl border border-border bg-surface/60 p-5">
          <ProductPreview id={active.id} />
        </div>
        <ButtonLink href="/dashboard/humanize" variant="primary" size="md" className="mt-5 w-full justify-center" onClick={onNavigate}>
          Try the Humanizer
        </ButtonLink>
      </div>
    </div>
  );
}

function ProductPreview({ id }: { id: (typeof PRODUCT_CAPABILITIES)[number]["id"] }) {
  if (id === "humanizer") {
    return (
      <div key={id} className="animate-nav-panel-fade-in">
        <p className="text-app-label text-foreground-subtle">Before</p>
        <div className="mt-2 h-2 w-full rounded-full bg-border" />
        <div className="mt-1.5 h-2 w-4/5 rounded-full bg-border" />
        <p className="mt-4 text-app-label text-brand-purple">After</p>
        <div className="bg-brand-gradient mt-2 h-2 w-full rounded-full" />
        <div className="bg-brand-gradient mt-1.5 h-2 w-3/5 rounded-full" />
      </div>
    );
  }
  if (id === "modes") {
    return (
      <div key={id} className="flex flex-wrap gap-1.5 animate-nav-panel-fade-in">
        {writingModes.map((m, i) => (
          <span
            key={m.name}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              i === 0 ? "bg-brand-gradient text-white" : "border border-border text-foreground-muted"
            )}
          >
            {m.name}
          </span>
        ))}
      </div>
    );
  }
  if (id === "voice") {
    return (
      <div key={id} className="flex flex-wrap gap-1.5 animate-nav-panel-fade-in">
        {["Conversational", "Direct", "Varied rhythm"].map((trait) => (
          <span key={trait} className="rounded-full border border-brand-purple/30 bg-brand-purple/10 px-2.5 py-1 text-xs font-medium text-brand-purple">
            {trait}
          </span>
        ))}
      </div>
    );
  }
  if (id === "study") {
    return (
      <div key={id} className="flex flex-wrap gap-1.5 animate-nav-panel-fade-in">
        {["Summarize", "Explain", "Study Notes"].map((mode, i) => (
          <span
            key={mode}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-medium",
              i === 0 ? "bg-brand-gradient text-white" : "border border-border text-foreground-muted"
            )}
          >
            {mode}
          </span>
        ))}
      </div>
    );
  }
  return (
    <div key={id} className="flex flex-col gap-2 animate-nav-panel-fade-in">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-purple/50" />
          <div className="h-2 flex-1 rounded-full bg-border" />
        </div>
      ))}
    </div>
  );
}

/* ==========================================================================
   SOLUTIONS — editorial rows, not a repeated card grid.
   ========================================================================== */
function SolutionsPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="max-w-3xl">
      <p className="text-app-label text-brand-purple">Solutions</p>
      <h2 className="font-display mt-1.5 text-2xl font-bold tracking-tight text-foreground">
        Built for how you actually write
      </h2>
      <div className="mt-6 flex flex-col divide-y divide-border border-t border-border">
        {SOLUTIONS.map((s) => (
          <Link
            key={s.id}
            href="/#use-cases"
            onClick={onNavigate}
            className="focus-ring group grid grid-cols-1 gap-1.5 py-5 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-baseline sm:gap-6"
          >
            <span className="font-display text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-brand-purple">
              {s.label}
            </span>
            <span>
              <span className="block text-sm text-foreground-muted">{s.description}</span>
              <span className="mt-1 block text-xs text-foreground-subtle">Helps with: {s.helps}</span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ==========================================================================
   PRICING — compact and direct, reading real numbers from the same
   PLANS config the paywall and checkout use. No duplicated pricing logic.
   ========================================================================== */
function PricingPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="max-w-2xl">
      <p className="text-app-label text-brand-purple">Pricing</p>
      <h2 className="font-display mt-1.5 text-2xl font-bold tracking-tight text-foreground">Simple plans, no surprises</h2>
      <div className="mt-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-3">
        {PAID_PLAN_IDS.map((id) => {
          const plan = PLANS[id];
          return (
            <Link
              key={id}
              href="/#pricing"
              onClick={onNavigate}
              className="focus-ring group flex flex-col gap-1 bg-background-elevated p-4 transition-colors hover:bg-surface"
            >
              <span className="text-sm font-semibold text-foreground">{plan.name}</span>
              <span className="font-display text-xl font-bold text-foreground">
                ₹{plan.monthlyPriceInr}
                <span className="text-xs font-normal text-foreground-subtle">/mo</span>
              </span>
              <span className="mt-1 text-xs text-foreground-subtle">{plan.monthlyHumanizations} humanizations/mo</span>
            </Link>
          );
        })}
      </div>
      <Link
        href="/#pricing"
        onClick={onNavigate}
        className="focus-ring press-feedback mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-purple hover:text-brand-pink"
      >
        Compare all plans
        <ArrowRightIcon className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

/* ==========================================================================
   DEVELOPERS — quiet and technical. Only the one real destination
   (the API developer preview) — no invented SDKs or webhooks.
   ========================================================================== */
function DevelopersPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="max-w-2xl">
      <p className="text-app-label text-brand-purple">Developers</p>
      <h2 className="font-display mt-1.5 text-2xl font-bold tracking-tight text-foreground">Bring HUMANORA into your product</h2>
      <p className="mt-2 text-sm text-foreground-muted">
        A REST endpoint for the same rewrite engine behind Humanize — currently in developer preview.
      </p>
      <pre className="mt-5 overflow-x-auto rounded-lg border border-border bg-background-elevated p-4 font-mono text-xs text-foreground-muted">
        <code>{`POST https://api.humanora.dev/v1/humanize
{ "text": "...", "mode": "professional" }`}</code>
      </pre>
      <Link
        href="/api"
        onClick={onNavigate}
        className="focus-ring press-feedback mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-purple hover:text-brand-pink"
      >
        View the API overview
        <ArrowRightIcon className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

/* ==========================================================================
   RESOURCES — a short reading list, not a product menu.
   ========================================================================== */
function ResourcesPanel({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className="max-w-3xl">
      <p className="text-app-label text-brand-purple">Resources</p>
      <h2 className="font-display mt-1.5 text-2xl font-bold tracking-tight text-foreground">Learn HUMANORA</h2>
      <div className="mt-6 grid grid-cols-1 gap-8 sm:grid-cols-[1fr_1px_1fr]">
        <Link href="/blog" onClick={onNavigate} className="focus-ring group block">
          <p className="text-app-label text-foreground-subtle">Featured</p>
          <p className="font-display mt-1.5 text-lg font-bold text-foreground transition-colors group-hover:text-brand-purple">
            The HUMANORA blog
          </p>
          <p className="mt-1 text-sm text-foreground-muted">Writing tips, product updates, and how HUMANORA is built.</p>
        </Link>
        <span aria-hidden="true" className="hidden bg-border sm:block" />
        <div className="flex flex-col gap-4">
          <Link href="/#pricing" onClick={onNavigate} className="focus-ring group flex items-center justify-between text-sm text-foreground-muted transition-colors hover:text-foreground">
            FAQ
            <ArrowRightIcon className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
          <Link href="/affiliates" onClick={onNavigate} className="focus-ring group flex items-center justify-between text-sm text-foreground-muted transition-colors hover:text-foreground">
            Affiliates
            <ArrowRightIcon className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function MobileGroup({
  label,
  open,
  onToggle,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  children: ReactElement | ReactElement[];
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="focus-ring flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-2.5 text-sm text-foreground-muted hover:bg-surface hover:text-foreground"
      >
        {label}
        <ChevronIcon className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && <div className="ml-2 flex flex-col gap-1 border-l border-border pl-3">{children}</div>}
    </div>
  );
}

function MobileLink({ href, label, onNavigate, top }: { href: string; label: string; onNavigate: () => void; top?: boolean }) {
  return (
    <a
      href={href}
      onClick={onNavigate}
      className={cn(
        "focus-ring block rounded-md text-sm text-foreground-muted hover:bg-surface hover:text-foreground",
        top ? "px-2 py-2.5" : "px-3 py-2"
      )}
    >
      {label}
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

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="M4 10h12M11 5l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
