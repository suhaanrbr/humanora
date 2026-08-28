import { ComingSoon } from "@/components/dashboard/ComingSoon";

export const metadata = { title: "Projects — HUMANORA" };

export default function ProjectsPage() {
  return (
    <ComingSoon
      title="Projects"
      description="Group related Humanize and Study work together under one project."
      icon={ProjectsIcon}
    />
  );
}

function ProjectsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="6" width="17" height="13" rx="1.6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 6.5 6 4h4l1.6 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
