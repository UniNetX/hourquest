"use client";

import { IconStarFilled } from "@tabler/icons-react";
import { getDisplayInitial } from "@/lib/profile-display";

type Story = {
  id: string;
  rating: number;
  comment: string;
  profiles?: { full_name: string; school_name: string | null } | null;
};

export function ReviewCarousel({ stories }: { stories: Story[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0">
      {stories.map((story) => (
        <article
          key={story.id}
          className="pillar-card min-w-[280px] shrink-0 snap-center md:min-w-0"
        >
          <div className="mb-3 flex gap-0.5 text-star" aria-label={`${story.rating} stars`}>
            {Array.from({ length: story.rating }).map((_, i) => (
              <IconStarFilled key={i} size={16} />
            ))}
          </div>
          <p className="font-display text-base italic leading-relaxed text-text-muted">
            &ldquo;{story.comment}&rdquo;
          </p>
          <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary-dark">
              {getDisplayInitial(story.profiles?.full_name ?? "Anonymous")}
            </div>
            <div>
              <p className="text-sm font-semibold">
                {story.profiles?.full_name ?? "Anonymous"}
              </p>
              <p className="text-xs text-text-caption">
                {story.profiles?.school_name ?? "Verified student"}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
