/**
 * Public changelog, newest first. Written for customers, not engineers:
 * each entry names what changed for the person using Humanora. Dates
 * match the real release history. Add new entries at the top.
 */
export interface ChangelogEntry {
  date: string; // ISO yyyy-mm-dd
  title: string;
  body: string;
  tag: "New" | "Improved" | "Fixed";
}

export const changelog: ChangelogEntry[] = [
  {
    date: "2026-10-15",
    title: "A free tells checker on the homepage",
    body: "Paste any paragraph and see throat-clearing, inflated vocabulary, hedging, reflex triplets and flat sentence rhythm highlighted as you type. It runs in your browser, with no account needed.",
    tag: "New",
  },
  {
    date: "2026-10-15",
    title: "Light mode",
    body: "Humanora now comes in paper as well as ink. It follows your system setting until you choose, and remembers your choice.",
    tag: "New",
  },
  {
    date: "2026-10-15",
    title: "A calmer, more readable Humanora",
    body: "A new serif type system and a quieter design across the site and the workspace, built for long reading and writing sessions.",
    tag: "Improved",
  },
  {
    date: "2026-09-03",
    title: "Much faster dashboard",
    body: "Your dashboard and profile now load in a fraction of the time, after we moved the app's servers next to its database and pooled connections.",
    tag: "Improved",
  },
  {
    date: "2026-08-29",
    title: "Password reset by email",
    body: "Forgot your password? Request a reset link from the login page.",
    tag: "New",
  },
  {
    date: "2026-08-29",
    title: "AI Detector and Projects",
    body: "Check how a passage reads with a likelihood band, a confidence level and the signals behind it. Group rewrites, notes and checks into Projects, and find everything in one Library.",
    tag: "New",
  },
  {
    date: "2026-08-27",
    title: "Study: summaries, explanations and revision notes",
    body: "Turn dense material into something you can learn from. Study works only from the text you give it.",
    tag: "New",
  },
  {
    date: "2026-08-27",
    title: "Several voices, custom instructions and Google sign-in",
    body: "Keep separate My Voice profiles for different kinds of writing, add your own standing instructions, and sign in with Google.",
    tag: "New",
  },
  {
    date: "2026-08-27",
    title: "Meaning check and multiple versions",
    body: "Every rewrite is checked for changed figures, dates, links and quotations, and paid plans get more than one version to choose from.",
    tag: "New",
  },
  {
    date: "2026-08-26",
    title: "Humanora opens",
    body: "Accounts, the core rewrite, six writing modes, and a free first rewrite for everyone.",
    tag: "New",
  },
];

export function formatChangelogDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
