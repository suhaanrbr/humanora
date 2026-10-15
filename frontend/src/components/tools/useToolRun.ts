"use client";

import { useState } from "react";
import type { AiToolId, ToolResult } from "@/lib/ai/tools";

export type ToolRunState = "idle" | "running" | "done" | "error" | "upgrade";

/**
 * Runs one AI Tool against /api/tools/[tool] and tracks its state. A 402
 * (free plan) becomes the "upgrade" state rather than a generic error,
 * so each tool can show a proper upsell instead of a red message.
 */
export function useToolRun<T extends AiToolId>(tool: T) {
  const [state, setState] = useState<ToolRunState>("idle");
  const [result, setResult] = useState<ToolResult[T] | null>(null);
  const [error, setError] = useState("");

  async function run(text: string, options: Record<string, unknown> = {}) {
    setState("running");
    setError("");
    try {
      const res = await fetch(`/api/tools/${tool}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, options }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 402) {
        setState("upgrade");
        return null;
      }
      if (!res.ok) {
        setError(data?.error ?? "Something went wrong. Please try again.");
        setState("error");
        return null;
      }
      setResult(data.result as ToolResult[T]);
      setState("done");
      return data.result as ToolResult[T];
    } catch {
      setError("Couldn't reach Humanora. Check your connection and try again.");
      setState("error");
      return null;
    }
  }

  function reset() {
    setState("idle");
    setResult(null);
    setError("");
  }

  return { state, result, error, run, reset, setResult };
}
