/**
 * Single source of truth for Humanora's public site URL — used by
 * metadata, canonical URLs, sitemap.xml, robots.txt, and structured
 * data. Reading from an env var (rather than hard-coding the current
 * Vercel subdomain) means connecting a custom domain later is a
 * one-line env var change, not a find-and-replace across the codebase.
 *
 * NEXT_PUBLIC_SITE_URL should be set once a custom domain is connected;
 * until then it falls back to the real deployed Vercel URL, which is
 * itself a legitimate, indexable HTTPS origin — not a placeholder.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://humanora-beryl.vercel.app";

export const SITE_NAME = "Humanora";
// Humanora is a writing and study workspace, not a single-purpose
// "humanizer" tool — Humanize remains the flagship capability, but the
// tagline/description shouldn't describe less than what the product
// actually does (see docs/AI_COST_MODEL.md and the Study module for
// what's real today; nothing named here that isn't actually shipped).
export const SITE_TAGLINE = "AI Writing & Study Workspace";
export const SITE_DESCRIPTION =
  "Humanora edits AI-assisted drafts into natural writing that sounds like you, keeping every figure, date and quotation intact. With My Voice style profiles, six writing modes, and study tools for summaries and revision notes.";

/** A real, monitored support inbox, or null until one is configured —
 * never a placeholder address. */
export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL?.trim() || null;
