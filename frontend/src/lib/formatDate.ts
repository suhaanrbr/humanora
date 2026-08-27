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
  return d.toLocaleString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
