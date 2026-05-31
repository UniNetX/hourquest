"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconX } from "@tabler/icons-react";

const STORAGE_KEY = "hourquest-announcement-dismissed";

export function AnnouncementBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      setVisible(!dismissed);
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="relative bg-primary-dark px-4 py-2.5 pr-12 text-center text-xs leading-snug text-white sm:text-sm">
      <p className="mx-auto max-w-xl">
        Earn verified volunteer hours for college applications —{" "}
        <Link
          href="/challenges"
          className="font-semibold text-white underline underline-offset-2 hover:text-white/90"
        >
          start a challenge free
        </Link>
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-white transition-colors hover:bg-white/10"
        aria-label="Dismiss announcement"
      >
        <IconX size={16} className="text-white" />
      </button>
    </div>
  );
}
