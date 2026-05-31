"use client";

import { IconStarFilled } from "@tabler/icons-react";
import { getDisplayInitial } from "@/lib/profile-display";
import { cn } from "@/lib/utils";

export type Testimonial = {
  id: string;
  rating: number;
  comment: string;
  name: string;
  school: string;
};

const FALLBACK_TESTIMONIALS: Testimonial[] = [
  {
    id: "fallback-1",
    rating: 5,
    comment:
      "HourQuest made it easy to log real volunteer work. My counselor loved the verified hours on my application.",
    name: "Maya R.",
    school: "Lincoln High School",
  },
  {
    id: "fallback-2",
    rating: 5,
    comment:
      "The medical challenges pushed me to learn first aid and help at community health events. Proof upload was simple.",
    name: "Jordan K.",
    school: "Westview Academy",
  },
  {
    id: "fallback-3",
    rating: 5,
    comment:
      "I completed environmental challenges with my club and earned certificates I could share with colleges.",
    name: "Priya S.",
    school: "Oak Ridge High",
  },
  {
    id: "fallback-4",
    rating: 5,
    comment:
      "Finally a platform that tracks hours honestly. Reviews were fast and the dashboard kept me motivated.",
    name: "Alex T.",
    school: "Summit Prep",
  },
  {
    id: "fallback-5",
    rating: 5,
    comment:
      "Partnership challenges from local orgs gave our class meaningful projects beyond one-off events.",
    name: "Sam L.",
    school: "Riverdale High",
  },
];

type StoryRow = {
  id: string;
  rating: number;
  comment: string;
  display_name?: string | null;
  display_school?: string | null;
  profiles?: { full_name: string; school_name: string | null } | null;
};

function toTestimonials(stories: StoryRow[]): Testimonial[] {
  return stories.map((s) => ({
    id: s.id,
    rating: s.rating,
    comment: s.comment,
    name: s.display_name?.trim() || s.profiles?.full_name || "Anonymous",
    school:
      s.display_school?.trim() || s.profiles?.school_name || "Verified student",
  }));
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <article className="pillar-card mx-3 w-[min(100%,320px)] shrink-0 sm:w-[340px]">
      <div className="mb-3 flex gap-0.5 text-star" aria-label={`${item.rating} stars`}>
        {Array.from({ length: item.rating }).map((_, i) => (
          <IconStarFilled key={i} size={16} />
        ))}
      </div>
      <p className="font-display text-base italic leading-relaxed text-text-muted">
        &ldquo;{item.comment}&rdquo;
      </p>
      <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary-dark">
          {getDisplayInitial(item.name)}
        </div>
        <div>
          <p className="text-sm font-semibold">{item.name}</p>
          <p className="text-xs text-text-caption">{item.school}</p>
        </div>
      </div>
    </article>
  );
}

export function TestimonialsCarousel({
  stories,
  className,
}: {
  stories?: StoryRow[];
  className?: string;
}) {
  const fromDb = stories?.length ? toTestimonials(stories) : [];
  const items =
    fromDb.length >= 3
      ? fromDb
      : [...fromDb, ...FALLBACK_TESTIMONIALS].slice(0, 6);

  const doubled = [...items, ...items];

  return (
    <div
      className={cn("relative overflow-hidden", className)}
      aria-label="Student testimonials"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-[var(--color-surface)] to-transparent sm:w-20" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-[var(--color-surface)] to-transparent sm:w-20" />
      <div className="flex w-max motion-safe:animate-marquee py-2">
        {doubled.map((item, i) => (
          <TestimonialCard key={`${item.id}-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}
