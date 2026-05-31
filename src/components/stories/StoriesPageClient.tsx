"use client";

import { useState } from "react";
import { IconStarFilled } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldError, Textarea } from "@/components/ui/Input";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Story = {
  id: string;
  rating: number;
  comment: string;
  user_id: string;
};

export function StoriesPageClient({
  stories,
  canReview,
}: {
  stories: (Story & { authorName?: string; authorSchool?: string | null })[];
  canReview: boolean;
}) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    const { error: insertError } = await supabase.from("student_stories").insert({
      user_id: user.id,
      rating,
      comment,
    });
    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setComment("");
    window.location.reload();
  }

  return (
    <section className="section-y bg-page">
      <div className="section-container">
        <div className="grid gap-4 md:grid-cols-3">
          {stories.map((story) => (
            <Card key={story.id}>
              <div className="mb-3 flex gap-0.5 text-star">
                {Array.from({ length: story.rating }).map((_, i) => (
                  <IconStarFilled key={i} size={16} />
                ))}
              </div>
              <p className="text-sm italic leading-relaxed text-text-muted">
                &ldquo;{story.comment}&rdquo;
              </p>
              <p className="mt-4 text-sm font-medium">
                {story.authorName ?? "Student"}
              </p>
              <p className="text-xs text-text-caption">
                {story.authorSchool ?? "Verified student"}
              </p>
            </Card>
          ))}
        </div>

        {canReview && (
          <Card className="mx-auto mt-12 max-w-xl">
            <h2 className="text-lg font-medium">Leave a Review</h2>
            <form onSubmit={submitReview} className="mt-5 space-y-4">
              <div className="flex gap-1" role="group" aria-label="Rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={cn(
                      "rounded p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      star <= rating ? "text-star" : "text-border",
                    )}
                    aria-label={`${star} stars`}
                  >
                    <IconStarFilled size={24} />
                  </button>
                ))}
              </div>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                required
              />
              <FieldError message={error ?? undefined} />
              <Button type="submit" disabled={loading}>
                Submit Review
              </Button>
            </form>
          </Card>
        )}
      </div>
    </section>
  );
}
