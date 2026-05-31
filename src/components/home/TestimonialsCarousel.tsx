"use client";

import { IconStarFilled } from "@tabler/icons-react";
import { getDisplayInitial } from "@/lib/profile-display";
import { cn } from "@/lib/utils";
import type { HomepageTestimonial } from "@/types/database";

export type Testimonial = {
  id: string;
  rating: number;
  comment: string;
  name: string;
  school: string;
};

function toTestimonials(items: HomepageTestimonial[]): Testimonial[] {
  return items.map((item) => ({
    id: item.id,
    rating: item.rating,
    comment: item.comment,
    name: item.display_name,
    school: item.display_school || "Verified student",
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
  testimonials = [],
  className,
}: {
  testimonials?: HomepageTestimonial[];
  className?: string;
}) {
  const items = toTestimonials(testimonials.slice(0, 3));

  if (items.length === 0) {
    return (
      <p className="text-center text-sm text-text-muted">
        Testimonials will appear here once added in admin.
      </p>
    );
  }

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
