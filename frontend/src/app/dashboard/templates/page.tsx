import { ComingSoon } from "@/components/dashboard/ComingSoon";

export const metadata = { title: "Templates — HUMANORA" };

export default function TemplatesPage() {
  return (
    <ComingSoon
      title="Templates"
      description="Start Humanize or Study from a ready-made scaffold — essay, blog post, case study, and more."
      icon={TemplatesIcon}
    />
  );
}

function TemplatesIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="4" y="4" width="7" height="7" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="4" width="7" height="7" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
      <rect x="4" y="13" width="7" height="7" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
      <rect x="13" y="13" width="7" height="7" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
