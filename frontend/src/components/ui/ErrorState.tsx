import { Card } from "@/components/ui/Card";

/**
 * The shared shell for "this data failed to load" — previously
 * duplicated as a local `ErrorCard` function per page. Deliberately
 * generic (a message + a hint), not a place for a retry button by
 * default, since most call sites are server-rendered data that only
 * refreshes on navigation/reload anyway.
 */
export function ErrorState({
  message,
  hint = "Please refresh, or try again shortly.",
}: {
  message: string;
  hint?: string;
}) {
  return (
    <Card className="border-danger/30 bg-danger/5 p-6 text-center">
      <p className="text-sm text-foreground-muted">{message}</p>
      <p className="mt-1 text-xs text-foreground-subtle">{hint}</p>
    </Card>
  );
}
