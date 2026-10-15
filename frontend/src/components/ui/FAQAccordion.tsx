"use client";

import { useState } from "react";
import { cn } from "@/lib/cn";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQAccordionProps {
  items: FAQItem[];
  className?: string;
}

/**
 * Reusable accordion FAQ list. One item open at a time, smooth
 * grid-template-rows transition (no height:auto animation hacks, no
 * layout dependency on JS-measured heights).
 */
export function FAQAccordion({ items, className }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className={cn("flex flex-col border-t border-border", className)}>
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={item.question} className="border-b border-border">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="focus-ring flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-display text-xl leading-snug text-foreground">{item.question}</span>
              <ChevronIcon className={cn("h-4 w-4 shrink-0 text-foreground-subtle transition-transform duration-300", open && "rotate-180")} />
            </button>
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-in-out",
                open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-6 text-base leading-relaxed text-foreground-muted">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ChevronIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
