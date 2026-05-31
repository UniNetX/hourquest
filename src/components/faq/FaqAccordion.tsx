"use client";

import { useState } from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { FAQ_ITEMS } from "@/lib/challenges/constants";

export function FaqAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      {FAQ_ITEMS.map((item, index) => {
        const open = openIndex === index;
        return (
          <div
            key={item.question}
            className="overflow-hidden rounded border border-border bg-surface shadow-card"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              onClick={() => setOpenIndex(open ? null : index)}
              aria-expanded={open}
            >
              <span className="font-display text-base font-semibold text-text">
                {item.question}
              </span>
              <IconChevronDown
                size={20}
                className={cn(
                  "shrink-0 text-text-muted transition-transform",
                  open && "rotate-180",
                )}
                aria-hidden
              />
            </button>
            <div
              className={cn(
                "grid border-t border-border px-5 transition-all duration-200 motion-reduce:transition-none",
                open ? "grid-rows-[1fr] py-4 opacity-100" : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <p className="text-sm leading-relaxed text-text-muted">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
