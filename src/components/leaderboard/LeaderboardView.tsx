"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHero } from "@/components/layout/PageHero";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { withBrowserSupabase } from "@/lib/supabase/safe";

type IndividualRow = {
  id: string;
  full_name: string;
  school_name: string | null;
  total_verified_hours?: number;
  weekly_hours?: number;
  rank: number;
};

type SchoolRow = {
  school_name: string;
  student_count: number;
  total_hours: number;
};

const pillBtn =
  "rounded-sm border px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

export function LeaderboardView({
  initialIndividual,
  initialSchools,
}: {
  initialIndividual: IndividualRow[];
  initialSchools: SchoolRow[];
}) {
  const [type, setType] = useState<"individual" | "schools">("individual");
  const [period, setPeriod] = useState<"week" | "all">("all");
  const [individual, setIndividual] = useState(initialIndividual);
  const [schools] = useState(initialSchools);

  async function loadIndividual(next: "week" | "all") {
    setPeriod(next);
    const table =
      next === "week"
        ? "individual_leaderboard_weekly"
        : "individual_leaderboard_all_time";
    const { data } = await withBrowserSupabase(async (supabase) => {
      const { data: rows } = await supabase.from(table).select("*").limit(50);
      return (rows as IndividualRow[] | null) ?? null;
    });
    if (data) setIndividual(data);
  }

  const rankColor = (rank: number) => {
    if (rank === 1) return "text-star";
    if (rank === 2) return "text-text-caption";
    if (rank === 3) return "text-warning";
    return "text-text";
  };

  return (
    <>
      <PageHero
        eyebrow="Rankings"
        title="Leaderboard"
        subtitle="See who's leading in verified environmental and medical volunteer hours."
        large
      />
      <section className="section-y bg-page">
        <div className="section-container max-w-3xl">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="filter-scroll sm:mx-0 sm:overflow-visible sm:p-0" role="tablist" aria-label="Leaderboard type">
              {(["individual", "schools"] as const).map((key) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={type === key}
                  onClick={() => setType(key)}
                  className={cn(
                    pillBtn,
                    type === key
                      ? "bg-primary text-white"
                      : "border border-border bg-surface text-text-muted hover:text-text",
                  )}
                >
                  {key === "individual" ? "Individual" : "Schools"}
                </button>
              ))}
            </div>
            {type === "individual" && (
              <div className="filter-scroll sm:mx-0 sm:overflow-visible sm:p-0" role="tablist" aria-label="Time period">
                {(["week", "all"] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={period === key}
                    onClick={() => loadIndividual(key)}
                    className={cn(
                      pillBtn,
                      period === key
                        ? "bg-primary text-white"
                        : "border border-border bg-surface text-text-muted hover:text-text",
                    )}
                  >
                    {key === "week" ? "This Week" : "All Time"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {type === "individual" ? (
            individual.length === 0 ? (
              <Card className="text-center">
                <p className="text-sm text-text-muted">
                  Be the first on the leaderboard!
                </p>
                <Link
                  href="/challenges"
                  className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
                >
                  Start a challenge
                </Link>
              </Card>
            ) : (
              <div className="space-y-3">
                {individual.map((row) => (
                  <Card key={row.id} className="flex items-center gap-4 py-4">
                    <span
                      className={cn("w-10 text-sm font-medium", rankColor(row.rank))}
                    >
                      #{row.rank}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-sm font-medium text-primary">
                      {row.full_name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{row.full_name}</p>
                      <p className="truncate text-xs text-text-muted">
                        {row.school_name ?? "Student"}
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-medium text-primary">
                      {Number(row.weekly_hours ?? row.total_verified_hours ?? 0)} hrs
                    </span>
                  </Card>
                ))}
              </div>
            )
          ) : schools.length === 0 ? (
            <Card className="text-center text-sm text-text-muted">
              No schools on the leaderboard yet.
            </Card>
          ) : (
            <div className="space-y-3">
              {schools.map((row, i) => (
                <Card
                  key={row.school_name}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">
                      #{i + 1} {row.school_name}
                    </p>
                    <p className="text-xs text-text-muted">
                      {row.student_count} students
                    </p>
                  </div>
                  <span className="text-sm font-medium text-primary">
                    {Number(row.total_hours)} hrs
                  </span>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
