import { ComingSoon } from "@/components/dashboard/ComingSoon";

export const metadata = { title: "Chat with Docs — HUMANORA" };

export default function ChatWithDocsPage() {
  return (
    <ComingSoon
      title="Chat with Docs"
      description="Upload a document and ask questions about its contents."
      icon={ChatIcon}
    />
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 5.5h16v10H9l-4 3.5v-3.5H4Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
