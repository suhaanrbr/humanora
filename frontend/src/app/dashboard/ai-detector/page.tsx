import { ComingSoon } from "@/components/dashboard/ComingSoon";

export const metadata = { title: "AI Detector — HUMANORA" };

export default function AiDetectorPage() {
  return (
    <ComingSoon
      title="AI Detector"
      description="Check a piece of writing for an AI-likelihood estimate before you publish it."
      icon={DetectorIcon}
    />
  );
}

function DetectorIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
      <path d="m20.5 20.5-4.3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
