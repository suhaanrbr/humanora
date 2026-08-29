import Link from "next/link";

/**
 * Explicit "return to HUMANORA Home" control for deep/secondary pages
 * (Settings, Billing, Project detail, etc.) — always links to the real
 * dashboard route, never router.back() (which could land a user
 * outside HUMANORA entirely if they arrived via an external link).
 * A plain server-renderable Link — no client state needed since it
 * always points at a fixed destination.
 */
export function BackToHome({ label = "Home" }: { label?: string }) {
  return (
    <Link
      href="/dashboard"
      className="focus-ring group mb-6 inline-flex items-center gap-1.5 rounded-full py-1 pr-2 text-sm text-foreground-subtle transition-colors hover:text-foreground"
    >
      <ArrowLeftIcon className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-0.5" />
      <span>{label}</span>
    </Link>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
