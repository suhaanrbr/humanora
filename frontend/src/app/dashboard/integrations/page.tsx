import { ComingSoon } from "@/components/dashboard/ComingSoon";

export const metadata = { title: "Integrations — HUMANORA" };

export default function IntegrationsPage() {
  return (
    <ComingSoon
      title="Integrations"
      description="Connect HUMANORA to the tools you already write in."
      icon={IntegrationsIcon}
    />
  );
}

function IntegrationsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3.5" y="9.5" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
      <rect x="14.5" y="9.5" width="6" height="6" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 12.5h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
