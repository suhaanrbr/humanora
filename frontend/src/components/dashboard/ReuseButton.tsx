"use client";

import { useRouter } from "next/navigation";

const DRAFT_STORAGE_KEY = "humanora-draft"; // must match HumanizeWorkspace.tsx

/** Loads a past humanization's ORIGINAL input back into the workspace draft. */
export function ReuseButton({ text }: { text: string }) {
  const router = useRouter();

  function handleReuse() {
    try {
      window.sessionStorage.setItem(DRAFT_STORAGE_KEY, text);
    } catch {
      // sessionStorage can throw in some private-browsing contexts —
      // the user can still paste manually, not worth blocking on.
    }
    router.push("/dashboard/humanize");
  }

  return (
    <button
      type="button"
      onClick={handleReuse}
      className="focus-ring press-feedback cursor-pointer text-xs text-foreground-subtle underline underline-offset-2 hover:text-foreground"
    >
      Reuse this draft
    </button>
  );
}
