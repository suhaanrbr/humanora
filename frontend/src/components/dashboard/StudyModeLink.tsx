"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

const STUDY_MODE_KEY = "humanora-study-mode";

// Icon components are React functions defined in the server-rendered
// page — they can't cross the server/client boundary as props (only
// serializable values can). This component takes a serializable key
// instead and renders the matching SVG itself.
const ICONS = {
  summarize: SummarizeIcon,
  explain: ExplainIcon,
  notes: NotesIcon,
} as const;

/**
 * Same visual treatment as a plain QuickAction card, but for the three
 * Study-mode shortcuts specifically — clicking one must actually land
 * on that mode, not just open Study's default tab. Mirrors the same
 * sessionStorage handoff CommandPalette already uses so StudyWorkspace
 * picks it up on mount (see StudyWorkspace.tsx).
 */
export function StudyModeLink({
  mode,
  title,
  description,
}: {
  mode: "summarize" | "explain" | "notes";
  title: string;
  description: string;
}) {
  const router = useRouter();
  const Icon = ICONS[mode];

  function handleClick() {
    try {
      window.sessionStorage.setItem(STUDY_MODE_KEY, mode);
    } catch {}
    router.push("/dashboard/study");
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "focus-ring hover-lift group relative flex w-full items-start gap-3.5 overflow-hidden rounded-xl border border-border bg-surface p-4.5 text-left transition-[border-color,box-shadow] hover:border-brand-purple/35 hover:shadow-glow-sm"
      )}
    >
      <span className="icon-chip h-10 w-10 shrink-0">
        <Icon className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs text-foreground-subtle">{description}</p>
      </div>
    </button>
  );
}

function SummarizeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 6h16M4 12h10M4 18h13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function ExplainIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 16v.01M12 8a2.2 2.2 0 0 1 2.2 2.2c0 1.6-2.2 1.8-2.2 3.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
function NotesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4.5" y="3.5" width="15" height="17" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 8.5h8M8 12.5h8M8 16.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
