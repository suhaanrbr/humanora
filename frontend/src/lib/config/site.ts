/**
 * Single source of truth for HUMANORA's public site URL — used by
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

export const SITE_NAME = "HUMANORA";
export const SITE_TAGLINE = "AI Writing Humanizer";
export const SITE_DESCRIPTION =
  "HUMANORA rewrites AI-assisted drafts into natural, human-sounding writing — preserving meaning, facts, and structure. Includes My Voice, a personal writing-style profile, and a real meaning-preservation check.";
