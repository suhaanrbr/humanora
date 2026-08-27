"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/cn";

/**
 * "Continue with Google" — only rendered when the server confirms
 * Google is actually configured (see GET /api/auth-providers). Calling
 * signIn.social redirects the whole page to Google, then back to
 * Better Auth's OAuth callback, then to `callbackURL` — there is no
 * client-side token handling here at all.
 */
export function GoogleButton({ callbackURL = "/dashboard" }: { callbackURL?: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await authClient.signIn.social({ provider: "google", callbackURL });
      // On success this navigates away; if it resolves without
      // navigating (e.g. a popup-blocked edge case), fall through.
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={cn(
        "focus-ring press-feedback flex h-11 w-full cursor-pointer items-center justify-center gap-2.5 rounded-md border border-border-strong bg-surface text-sm font-medium text-foreground transition-colors hover:border-brand-purple/40 hover:bg-surface-hover disabled:opacity-60"
      )}
    >
      <GoogleIcon className="h-4.5 w-4.5" />
      {loading ? "Redirecting…" : "Continue with Google"}
    </button>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.58-5.17 3.58-8.82Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.46 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.28v3.11A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28V6.61H1.28A12 12 0 0 0 0 12c0 1.94.46 3.77 1.28 5.39l3.99-3.11Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.69 1.28 6.61l3.99 3.11C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}
