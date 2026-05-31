"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { PageHero } from "@/components/layout/PageHero";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  CHALLENGE_TRACKS,
  challengeTrack,
  getCategoriesForTrack,
} from "@/lib/challenges/constants";
import { createClient } from "@/lib/supabase/client";
import type { Challenge, ChallengeCategory, ChallengeTrack } from "@/types/database";

const filterBtn =
  "rounded-sm border px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2";

type TrackFilter = ChallengeTrack | "all";

const TRACK_FILTERS: { id: TrackFilter; label: string }[] = [
  { id: "all", label: "All" },
  ...CHALLENGE_TRACKS,
];

function parseTrack(value: string | null): TrackFilter {
  if (value === "medical" || value === "environmental" || value === "partnership") {
    return value;
  }
  return "all";
}

function isChallengeTrack(track: TrackFilter): track is ChallengeTrack {
  return track === "environmental" || track === "medical" || track === "partnership";
}

function parseCategory(
  raw: ChallengeCategory | null,
  track: TrackFilter,
): ChallengeCategory | "all" {
  if (!raw || !isChallengeTrack(track)) return "all";
  const valid = getCategoriesForTrack(track).some((c) => c.id === raw);
  return valid ? raw : "all";
}

export function ChallengeCatalog({
  initialChallenges,
  isLoggedIn,
}: {
  initialChallenges: Challenge[];
  isLoggedIn: boolean;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [challenges, setChallenges] =
    useState<Challenge[]>(initialChallenges);
  const [track, setTrack] = useState<TrackFilter>(() =>
    parseTrack(searchParams.get("track")),
  );
  const [category, setCategory] = useState<ChallengeCategory | "all">(() =>
    parseCategory(
      searchParams.get("category") as ChallengeCategory | null,
      parseTrack(searchParams.get("track")),
    ),
  );

  useEffect(() => {
    const nextTrack = parseTrack(searchParams.get("track"));
    setTrack(nextTrack);
    setCategory(
      parseCategory(
        searchParams.get("category") as ChallengeCategory | null,
        nextTrack,
      ),
    );
  }, [searchParams]);

  function updateFilters(nextTrack: TrackFilter, nextCategory: ChallengeCategory | "all") {
    const params = new URLSearchParams(searchParams.toString());
    if (nextTrack === "all") {
      params.delete("track");
    } else {
      params.set("track", nextTrack);
    }
    if (nextCategory === "all" || nextTrack === "all") {
      params.delete("category");
    } else {
      params.set("category", nextCategory);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setTrack(nextTrack);
    setCategory(nextTrack === "all" ? "all" : nextCategory);
  }

  function onTrackChange(nextTrack: TrackFilter) {
    if (nextTrack === "all" || nextTrack === "partnership") {
      updateFilters(nextTrack, "all");
      return;
    }
    const categories = getCategoriesForTrack(nextTrack);
    const nextCategory =
      category === "all" || categories.some((c) => c.id === category)
        ? category
        : "all";
    updateFilters(nextTrack, nextCategory);
  }

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
            .order("track")
            .order("category")
            .order("sort_order");
          if (data) setChallenges(data as Challenge[]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const trackCategories = isChallengeTrack(track) ? getCategoriesForTrack(track) : [];

  const filtered = useMemo(() => {
    const list = challenges.filter((c) => {
      if (track !== "all" && challengeTrack(c) !== track) return false;
      if (category !== "all" && c.category !== category) return false;
      return true;
    });
    return list.sort(
      (a, b) =>
        challengeTrack(a).localeCompare(challengeTrack(b)) ||
        a.category.localeCompare(b.category) ||
        a.sort_order - b.sort_order,
    );
  }, [category, challenges, track]);

  const startHref = (id: string) =>
    isLoggedIn
      ? `/dashboard/submit?challengeId=${id}`
      : `/signin?next=${encodeURIComponent(`/dashboard/submit?challengeId=${id}`)}`;

  return (
    <>
      <PageHero
        title="Challenge Catalog"
        subtitle="Browse environmental and medical challenges and start earning verified hours."
        large
      />
      <section className="section-y bg-page">
        <div className="section-container">
          <div
            className="filter-scroll mb-4 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:p-0"
            role="tablist"
            aria-label="Challenge track"
          >
            {TRACK_FILTERS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={track === t.id}
                onClick={() => onTrackChange(t.id)}
                className={cn(
                  filterBtn,
                  track === t.id
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-surface text-text-muted hover:text-text",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
          {track !== "all" && track !== "partnership" && (
            <div
              className="filter-scroll mb-8 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:p-0"
              role="tablist"
              aria-label="Category filter"
            >
              <button
                type="button"
                role="tab"
                aria-selected={category === "all"}
                onClick={() => updateFilters(track, "all")}
                className={cn(
                  filterBtn,
                  category === "all"
                    ? "border-primary bg-primary text-white"
                    : "border-border bg-surface text-text-muted hover:text-text",
                )}
              >
                All
              </button>
              {trackCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={category === cat.id}
                  onClick={() => updateFilters(track, cat.id)}
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
          )}
          {track === "all" && <div className="mb-8" />}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.length === 0 && track === "partnership" ? (
              <div className="col-span-full mx-auto max-w-lg rounded-lg border border-border bg-surface px-6 py-12 text-center">
                <h2 className="font-display text-xl text-primary-dark">
                  No partnership challenges yet
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-text-muted">
                  Partner organizations can post custom challenges here once approved.
                </p>
                <Button href="/signup?type=partner" variant="primary" className="mt-6">
                  Become a partner
                </Button>
              </div>
            ) : (
              filtered.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  startHref={startHref(challenge.id)}
                />
              ))
            )}
          </div>
        </div>
      </section>
    </>
  );
}
