"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type LeaderboardRow = {
  id: string;
  full_name: string;
  school_name: string | null;
  avatar_url: string | null;
  total_verified_hours?: number;
  weekly_hours?: number;
  rank: number;
};

export function LeaderboardPreview({
  initialData,
}: {
  initialData: LeaderboardRow[];
}) {
  const [mode, setMode] = useState<"week" | "all">("all");
  const [rows, setRows] = useState(initialData);

  async function loadWeekly() {
    const supabase = createClient();
    const { data } = await supabase
      .from("individual_leaderboard_weekly")
      .select("*")
      .limit(3);
    setRows((data as LeaderboardRow[]) ?? []);
  }

  async function loadAllTime() {
    const supabase = createClient();
    const { data } = await supabase
      .from("individual_leaderboard_all_time")
      .select("*")
      .limit(3);
    setRows((data as LeaderboardRow[]) ?? []);
  }

  function switchMode(next: "week" | "all") {
    setMode(next);
    if (next === "week") loadWeekly();
    else loadAllTime();
  }

  return (
    <div className="overflow-hidden rounded border border-border bg-surface shadow-card">
      <div className="flex flex-col gap-3 border-b border-border bg-primary-light/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-sm font-semibold text-primary-dark">Leaderboard</span>
        <div className="flex gap-1" role="tablist" aria-label="Leaderboard period">
          {(["week", "all"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={mode === key}
              onClick={() => switchMode(key)}
              className={cn(
                "rounded-sm px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                mode === key
                  ? "bg-primary text-white"
                  : "border border-border bg-surface text-text-muted hover:border-primary-mid",
              )}
            >
              {key === "week" ? "This Week" : "All Time"}
            </button>
          ))}
        </div>
      </div>
      <div className="divide-y divide-border">
        {rows.length === 0 ? (
          <p className="p-5 text-sm text-text-muted">
            Be the first on the leaderboard!
          </p>
        ) : (
          rows.map((row) => (
            <div key={row.id} className="flex items-center gap-4 px-5 py-4">
              <span
                className={cn(
                  "w-8 text-sm font-semibold",
                  row.rank === 1 && "text-star",
                )}
              >
                #{row.rank}
              </span>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary-dark">
                {row.full_name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{row.full_name}</p>
                <p className="truncate text-xs text-text-muted">
                  {row.school_name ?? "Student"}
                </p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-primary">
                {Number(row.weekly_hours ?? row.total_verified_hours ?? 0)} hrs
              </span>
            </div>
          ))
        )}
      </div>
      <div className="border-t border-border p-4 text-center">
        <Link
          href="/leaderboard"
          className="text-sm font-semibold text-primary hover:text-primary-dark"
        >
          View full leaderboard →
        </Link>
      </div>
    </div>
  );
}
