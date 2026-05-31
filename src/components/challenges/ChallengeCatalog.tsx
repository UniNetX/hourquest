"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { PageHero } from "@/components/layout/PageHero";
import { cn } from "@/lib/utils";
import { CHALLENGE_CATEGORIES } from "@/lib/challenges/constants";
import { createClient } from "@/lib/supabase/client";
import type { Challenge, ChallengeCategory } from "@/types/database";

const filterBtn =
  "rounded-sm border px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

export function ChallengeCatalog({
  initialChallenges,
  isLoggedIn,
}: {
  initialChallenges: Challenge[];
  isLoggedIn: boolean;
}) {
  const searchParams = useSearchParams();
  const [challenges, setChallenges] =
    useState<Challenge[]>(initialChallenges);
  const [category, setCategory] = useState<ChallengeCategory | "all">(
    (searchParams.get("category") as ChallengeCategory) || "all",
  );

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("challenges-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "challenges" },
        async () => {
          const { data } = await supabase
            .from("challenges")
            .select("*")
            .eq("active", true)
            .order("category")
            .order("sort_order");
          if (data) setChallenges(data);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = useMemo(() => {
    const list =
      category === "all"
        ? challenges
        : challenges.filter((c) => c.category === category);
    return list.sort(
      (a, b) =>
        a.category.localeCompare(b.category) || a.sort_order - b.sort_order,
    );
  }, [category, challenges]);

  const startHref = (id: string) =>
    isLoggedIn
      ? `/dashboard/submit?challengeId=${id}`
      : `/signin?next=${encodeURIComponent(`/dashboard/submit?challengeId=${id}`)}`;

  return (
    <>
      <PageHero
        eyebrow="Challenges"
        title="Challenge Catalog"
        subtitle="Browse all environmental challenges and start earning verified hours."
        large
      />
      <section className="section-y bg-page">
        <div className="section-container">
          <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label="Category filter">
            <button
              type="button"
              role="tab"
              aria-selected={category === "all"}
              onClick={() => setCategory("all")}
              className={cn(
                filterBtn,
                category === "all"
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface text-text-muted hover:text-text",
              )}
            >
              All
            </button>
            {CHALLENGE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                role="tab"
                aria-selected={category === cat.id}
                onClick={() => setCategory(cat.id)}
                className={cn(
                  filterBtn,
                  category === cat.id
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-surface text-text-muted hover:text-text",
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((challenge) => (
              <ChallengeCard
                key={challenge.id}
                challenge={challenge}
                startHref={startHref(challenge.id)}
              />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
