import { ComingSoon } from "@/components/dashboard/ComingSoon";

export const metadata = { title: "Brand Voice — HUMANORA" };

export default function BrandVoicePage() {
  return (
    <ComingSoon
      title="Brand Voice"
      description="A shared, organization-level writing voice, separate from your personal My Voice."
      icon={BrandVoiceIcon}
    />
  );
}

function BrandVoiceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M8 4h8l3 4-3 4H8l-3-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M12 12v8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
