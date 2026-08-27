"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

const links = [
  { label: "Home", href: "/dashboard" },
  { label: "Write", href: "/dashboard/humanize" },
  { label: "Study", href: "/dashboard/study" },
  { label: "My Voice", href: "/dashboard/voice" },
  { label: "Library", href: "/dashboard/history" },
];

/**
 * Session-aware account control for the header — replaces the static
 * "Log in / Get Started" pair once a user is authenticated. Fixes the
 * "logo click logs me out" report: that was never an actual session
 * loss, just the header rendering its logged-out state everywhere
 * (including inside the dashboard) because it had no idea a session
 * existed. `useSession` is Better Auth's reactive client hook — it
 * reflects the real cookie-backed session, never a locally-faked flag.
 */
export function AccountMenu({ showAppLinks = true }: { showAppLinks?: boolean } = {}) {
  const { data: session, isPending } = useSession();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  // Reserve the same slot while the session resolves, rather than
  // flashing "Log in" and then swapping to the account menu a moment
  // later — avoids a layout jump on every page load.
  if (isPending) {
    return <div className="h-9 w-24" aria-hidden="true" />;
  }

  if (!session) {
    return null; // caller renders the logged-out Log in / Get Started controls
  }

  const initial = session.user.name?.trim()?.[0]?.toUpperCase() ?? "U";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Account menu"
        className="focus-ring press-feedback flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-brand-gradient text-sm font-semibold text-white shadow-glow-sm"
      >
        {initial}
      </button>

      {open && (
        <div className="pearl-glass absolute right-0 top-full mt-2 w-56 rounded-lg p-2 shadow-glow-sm">
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-sm font-medium text-foreground">{session.user.name}</p>
            <p className="truncate text-xs text-foreground-subtle">{session.user.email}</p>
          </div>
          {showAppLinks && (
            <div className="flex flex-col gap-0.5 py-1.5">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "focus-ring rounded-md px-3 py-2 text-sm text-foreground-muted transition-colors hover:bg-background-elevated hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          )}
          {/* Billing and Settings live under Account everywhere, not as
              main product destinations — inside the dashboard, AppHeader's
              own top nav already covers Home/Write/Study/My Voice/Library,
              so repeating those here would just be the same destinations
              twice (showAppLinks=false skips them there). */}
          <div className={cn("flex flex-col gap-0.5", showAppLinks ? "border-t border-border pt-1.5" : "py-1.5")}>
            <Link
              href="/dashboard/billing"
              onClick={() => setOpen(false)}
              className="focus-ring rounded-md px-3 py-2 text-sm text-foreground-muted transition-colors hover:bg-background-elevated hover:text-foreground"
            >
              Billing
            </Link>
            <Link
              href="/dashboard/settings"
              onClick={() => setOpen(false)}
              className="focus-ring rounded-md px-3 py-2 text-sm text-foreground-muted transition-colors hover:bg-background-elevated hover:text-foreground"
            >
              Settings
            </Link>
          </div>
          <div className="border-t border-border pt-1.5">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={signingOut}
              className="focus-ring press-feedback w-full cursor-pointer rounded-md px-3 py-2 text-left text-sm text-foreground-muted transition-colors hover:bg-background-elevated hover:text-foreground disabled:opacity-50"
            >
              {signingOut ? "Logging out…" : "Log out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
