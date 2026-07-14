"use client";

import Image from "next/image";
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
  avatarUrl: string | null;
};

function toTestimonials(items: HomepageTestimonial[]): Testimonial[] {
  return items.map((item) => ({
    id: item.id,
    rating: item.rating,
    comment: item.comment,
    name: item.display_name,
    school: item.display_school || "Verified student",
    avatarUrl: item.avatar_url,
  }));
}

function TestimonialAvatar({ item }: { item: Testimonial }) {
  if (item.avatarUrl) {
    return (
      <Image
        src={item.avatarUrl}
        alt=""
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-full object-cover"
        unoptimized
      />
    );
  }

  return (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-sm font-semibold text-primary-dark">
      {getDisplayInitial(item.name)}
    </div>
  );
}

function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <article className="pillar-card min-w-[min(85vw,280px)] shrink-0 snap-center md:min-w-0">
      <div className="mb-3 flex gap-0.5 text-star" aria-label={`${item.rating} stars`}>
        {Array.from({ length: item.rating }).map((_, i) => (
          <IconStarFilled key={i} size={16} />
        ))}
      </div>
      <p className="font-display text-base italic leading-relaxed text-text-muted">
        &ldquo;{item.comment}&rdquo;
      </p>
      <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
        <TestimonialAvatar item={item} />
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

  return (
    <div
      className={cn(
        "flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0",
        className,
      )}
      aria-label="Student testimonials"
    >
      {items.map((item) => (
        <TestimonialCard key={item.id} item={item} />
      ))}
    </div>
  );
}
