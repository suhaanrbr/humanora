import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { LoginArtworkLayer } from "@/components/auth/LoginArtworkLayer";
import { AuthPanelTransition } from "@/components/auth/AuthPanelTransition";
import type { ReactNode } from "react";

/**
 * The persistent HUMANORA authentication environment — artwork, logo,
 * badge, headline, and copy, shared by BOTH /login and /signup via
 * app/(auth)/layout.tsx. This is what makes switching between the two
 * routes feel like one floating interface changing state rather than
 * two separate pages: Next.js keeps a shared layout mounted across
 * navigation between routes that render it, so this entire shell
 * (including the artwork's own network request) never remounts or
 * reloads when a visitor moves between "Log in" and "Sign up free" —
 * only `children` (the glass panel itself) changes.
 *
 * The headline stays "Writing that sounds like you." on both routes,
 * deliberately — the environment doesn't re-pitch itself depending on
 * which form is showing.
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex h-dvh w-full [align-items:safe_center] justify-center overflow-x-hidden overflow-y-auto bg-[#02030b]">
      {/* `absolute`, not `fixed`. Login and Signup have different form
          heights, so — with the root pinned to a CONSTANT `h-dvh`
          instead of the old content-growable `min-h-screen` — the
          background never needs to resize when a route's content is
          taller: `absolute inset-0` on a fixed-height parent is already
          stable. `fixed` was tried here first and does stop the resize,
          but Android Chrome has a long-standing bug where `position:
          fixed` elements detach from the visual viewport under a
          viewport override (exactly what "Request Desktop Site" on
          Android applies) — producing a shifted/cropped background.
          `absolute` on a stable-height parent gets the same stillness
          without that failure mode. Root also switched from
          `overflow-hidden` (blocked scrolling entirely) to
          `overflow-y-auto` so a route whose content is taller than a
          short/landscape viewport can still be scrolled to, instead of
          being clipped.

          `items-[safe_center]`, not plain `items-center` — on a real
          phone's actual visible viewport (address bar/chrome eating
          into it, not the full device height), Signup's extra field
          made it taller than login and taller than the space
          available. Plain `center` clips an overflow SYMMETRICALLY
          top-and-bottom, which hid the logo above the fold entirely
          and made the rest read as an oversized crop rather than a
          whole page. `safe center` centers only while it fits, and
          falls back to top-alignment (scrollable, logo visible first)
          the moment it doesn't — exactly the "safe" behavior its name
          describes. */}
      {/* Phones (<md): the real artwork stays gated off for perf (see
          LoginArtworkLayer), but a flat #02030b behind a translucent
          glass panel read as a dead black rectangle with nothing for
          the panel to pick up. A few soft, static radial gradients
          evoke the same violet/blue cosmic palette at zero image cost,
          so the glass has something to glow against. Hidden at md+
          where the real artwork takes over. */}
      <div className="pointer-events-none absolute inset-0 md:hidden" aria-hidden="true">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 60% at 50% -10%, rgba(99,102,241,0.35) 0%, transparent 60%)," +
              "radial-gradient(90% 50% at 100% 100%, rgba(139,92,246,0.28) 0%, transparent 60%)," +
              "radial-gradient(80% 45% at 0% 85%, rgba(217,70,239,0.16) 0%, transparent 60%)",
          }}
        />
      </div>
      {/* Two separate instances, not one shared "hidden md:block" — the
          tablet range (768-1279px) gets a slightly higher encode
          quality (less visible compression softness, since this is
          exactly the range where the artwork sits closest to the
          panel with fewer competing elements around it) and a subtle
          dark overlay so the glass panel reads with a bit more
          contrast against it. Desktop (1280px+) keeps the original
          defaults untouched — each instance's own matchMedia range
          means only one is ever mounted/fetching at a time, so tuning
          one never affects or re-fetches the other. */}
      <LoginArtworkLayer className="absolute inset-0 hidden md:block xl:hidden" minWidth={768} maxWidth={1279} quality={92} dim={0.14} />
      {/* Desktop (xl+) only: `fixed`, not `absolute` — the root's height
          is pinned to one viewport (`h-dvh`) so the background never
          resizes, but if desktop window content (e.g. a tall Signup
          form) ever needs to scroll past that one viewport, an
          `absolute inset-0` background only ever covered the FIRST
          viewport height — scrolling further revealed a plain black
          void beneath it. `fixed` covers the full viewport for the
          entire scroll range regardless of content height. Scoped to
          xl+ only — the Android `position: fixed` + "Request Desktop
          Site" viewport bug this same file documents avoiding only
          affects phones/tablets, never a real desktop window. */}
      <LoginArtworkLayer className="absolute inset-0 hidden xl:fixed xl:block" minWidth={1280} dim={0.18} />
      {/* A little extra fog at the very bottom, desktop only — layered
          on top of LoginArtworkLayer's own (shorter) bottom wash. Text
          contrast is unaffected; this only darkens the artwork itself. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 hidden h-72 xl:block"
        style={{ background: "linear-gradient(to top, rgba(2,3,11,0.75), transparent)" }}
      />

      <div className="relative z-10 w-full">
        {/* >= xl (1280px): side-by-side layout — copy column on the left,
            panel on the right. Deliberately xl, not lg (1024) — 1024 is
            the iPad Pro 12.9" portrait width, and the two-column grid
            squeezed into that is a scaled-down desktop composition, not
            a real tablet layout. Pushing the cutover to xl keeps the
            entire tablet range (up to 1279px) on the stacked layout
            below; every actual desktop width (1440+) renders identically
            to before — only the breakpoint prefix changed, not any of
            the classes or content. */}
        <div className="hidden xl:grid xl:grid-cols-[1fr_440px] xl:gap-16 xl:p-20">
          <div className="flex flex-col justify-between">
            <Link href="/" className="focus-ring w-fit rounded-md">
              <Logo size="md" />
            </Link>

            <div className="flex max-w-md flex-col gap-6">
              <span className="login-badge inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground-muted">
                <SparkleIcon className="h-3.5 w-3.5 text-brand-purple" />
                AI-powered writing
              </span>
              <div>
                <p className="text-4xl font-bold leading-[1.05] tracking-[-0.01em] text-foreground xl:text-5xl">
                  Writing that
                  <br />
                  <span className="text-brand-gradient text-brand-gradient-glow">sounds like you.</span>
                </p>
                <p className="mt-4 max-w-sm text-base leading-relaxed text-foreground-muted">
                  HUMANORA turns stiff, AI-assisted drafts into natural writing —
                  without losing your meaning, facts, or voice.
                </p>
              </div>
            </div>

            <p className="text-xs text-foreground-subtle">&copy; {new Date().getFullYear()} HUMANORA</p>
          </div>

          <div className="flex flex-col items-center justify-center">
            <AuthPanelTransition>{children}</AuthPanelTransition>
          </div>
        </div>

        {/* < xl (1280px): one stacked, centered column. Tablet (md-xl,
            768-1279px) gets the real artwork behind it plus the full
            badge + headline treatment. Phones (<md) go back to the
            smaller, quieter version — compact logo and a single muted
            strap line instead of the badge/headline — since that's the
            version that read better at phone size; the real artwork
            also stays off phones for perf (LoginArtworkLayer's own
            gate), so the fuller headline treatment had less to sit on
            anyway. Covers the full tablet range including 1024px (iPad
            Pro 12.9" portrait), which used to fall into the desktop
            grid before the xl cutover below. */}
        <div className="flex flex-col items-center gap-7 px-6 py-10 text-center sm:gap-9 sm:px-8 sm:py-14 xl:hidden">
          <div className="flex flex-col items-center gap-4 sm:gap-6">
            <Link href="/" className="focus-ring w-fit rounded-md">
              {/* Two Logo instances, each in its own display-only wrapper —
                  not one Logo with a responsive className — because
                  passing `md:hidden` straight into Logo's own className
                  competes with the display utility already baked into
                  its root element for the same CSS property, and which
                  one wins the cascade isn't guaranteed by class order.
                  A dedicated wrapper's `hidden`/`block` never touches
                  Logo's own classes, so there's nothing to compete with. */}
              <span className="block md:hidden">
                <Logo size="sm" />
              </span>
              <span className="hidden md:block">
                <Logo size="lg" />
              </span>
            </Link>

            <span className="login-badge hidden w-fit items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium text-foreground-muted md:inline-flex">
              <SparkleIcon className="h-4 w-4 text-brand-purple" />
              AI-powered writing
            </span>

            {/* The `<br/>` (matching the desktop copy below) is load-bearing,
                not stylistic — a `background-clip: text` gradient span that
                wraps across two lines paints its gradient relative to the
                union of both line boxes, so glyphs on the line that starts
                further left than that union box render with no background
                at all (invisible). Forcing "sounds like you." onto its own
                single line keeps the whole phrase on one line box, so the
                gradient always has one line to paint, never two. */}
            <p className="hidden max-w-md text-4xl font-bold leading-[1.15] tracking-[-0.01em] text-foreground md:block lg:text-5xl">
              Writing that
              <br />
              <span className="text-brand-gradient text-brand-gradient-glow">sounds like you.</span>
            </p>

            <p className="max-w-xs text-sm text-foreground-muted md:hidden">
              Writing that sounds like you — without losing your meaning.
            </p>
          </div>

          <AuthPanelTransition>{children}</AuthPanelTransition>
        </div>
      </div>
    </div>
  );
}

function SparkleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
