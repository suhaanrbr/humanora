/**
 * Locale-PINNED date formatting for any Client Component that renders
 * a date — Next.js server-renders client components too, and if the
 * server process's default locale differs from the browser's (exactly
 * what happened here: a Node server defaulting to en-US vs. a browser
 * defaulting to en-GB), `toLocaleString()` with no explicit locale
 * produces different text in each environment, which is a real React
 * hydration-mismatch bug, not a cosmetic one. Explicit locale + format
 * options make server and client always agree regardless of the
 * runtime's ambient locale. Server-only components (plain server
 * components, never hydrated) don't have this risk and can keep using
 * the native methods directly.
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  // Day-month order with a named month ("14 Oct 2026, 6:37 pm"): never
  // ambiguous, unlike 6/11/2026, which reads as June in the US and
  // November everywhere else.
  return d
    .toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(/\s?([ap])\.?m\.?$/i, " $1m");
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
