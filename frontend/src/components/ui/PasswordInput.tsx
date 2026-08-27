"use client";

import { useState } from "react";
import { Input, type InputProps } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

/** A password field with a show/hide toggle — standard on every commercial auth form. */
export function PasswordInput({ className, ...props }: InputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-11", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
        tabIndex={-1}
        className="focus-ring press-feedback absolute right-0 top-0 flex h-11 w-11 cursor-pointer items-center justify-center text-foreground-subtle transition-colors hover:text-foreground"
      >
        {visible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
      </button>
    </div>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M1.5 10S4.5 4 10 4s8.5 6 8.5 6-3 6-8.5 6-8.5-6-8.5-6Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function EyeOffIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path
        d="M2.5 2.5l15 15M8.3 4.3C8.85 4.1 9.42 4 10 4c5.5 0 8.5 6 8.5 6a15.6 15.6 0 0 1-2.6 3.4M6 5.9C3.8 7.2 1.5 10 1.5 10s3 6 8.5 6c1 0 1.93-.2 2.77-.53M8.2 8.2a2.5 2.5 0 0 0 3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
