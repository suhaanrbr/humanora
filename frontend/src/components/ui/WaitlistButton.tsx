"use client";

import { useState } from "react";
import { Button, type ButtonProps } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

export interface WaitlistButtonProps extends Omit<ButtonProps, "onClick"> {
  joinedLabel?: string;
  /** Shown under the button once clicked — should stay honest about what
   * actually happened (nothing is persisted anywhere yet). */
  noteClassName?: string;
}

/**
 * A CTA for features with no backend yet (affiliate program, API access,
 * newsletter-style signups). Clicking acknowledges interest locally —
 * nothing is sent to a server or stored anywhere. The label and note
 * deliberately avoid implying a real signup succeeded.
 */
export function WaitlistButton({
  children,
  joinedLabel = "Noted, thanks",
  noteClassName,
  ...props
}: WaitlistButtonProps) {
  const [joined, setJoined] = useState(false);

  return (
    <div className="flex flex-col items-center gap-2">
      <Button {...props} disabled={joined} onClick={() => setJoined(true)}>
        {joined ? joinedLabel : children}
      </Button>
      {joined && (
        <p className={cn("text-xs text-foreground-subtle", noteClassName)}>
          This isn&apos;t wired up to a real signup system yet — nothing was
          saved. Check back once this feature launches.
        </p>
      )}
    </div>
  );
}
