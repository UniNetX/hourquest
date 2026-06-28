"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDashboardSection } from "@/components/dashboard/DashboardSectionProvider";
import { IconCloudUpload, IconX } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FieldError, Input, Label, Textarea } from "@/components/ui/Input";
import type { Challenge } from "@/types/database";
import {
  CHALLENGE_TRACKS,
  challengeTrack,
  getCategoryMeta,
} from "@/lib/challenges/constants";

export default function SubmitChallengeClient({
  initialChallenges,
}: {
  initialChallenges: Challenge[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { goToSection } = useDashboardSection();
  const [challenges, setChallenges] = useState<Challenge[]>(initialChallenges);
  const [challengeId, setChallengeId] = useState(
    searchParams.get("challengeId") ?? "",
  );
  const [description, setDescription] = useState("");
  const [dateCompleted, setDateCompleted] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [files, setFiles] = useState<File[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const selectedChallenge = challenges.find((c) => c.id === challengeId);

  useEffect(() => {
    const id = searchParams.get("challengeId");
    if (id) setChallengeId(id);
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/signin");
        return;
      }
      if (initialChallenges.length > 0) return;
      const { data: challengeData, error: loadError } = await supabase
        .from("challenges")
        .select("*")
        .eq("active", true)
        .order("track")
        .order("category")
        .order("sort_order");
      if (loadError) {
        setError(loadError.message);
        return;
      }
      setChallenges(challengeData ?? []);
    }
    load();
  }, [router, initialChallenges.length]);

  function onFilesSelected(list: FileList | null) {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)].slice(0, 3));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!challengeId || files.length === 0) {
      setError("Select a challenge and upload at least one photo.");
      return;
    }
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) return;

    const submissionId = crypto.randomUUID();
    const photoPaths: string[] = [];

    for (const file of files) {
      const path = `${user.id}/${submissionId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("challenge-proofs")
        .upload(path, file);
      if (uploadError) {
        setError(uploadError.message);
        setLoading(false);
        return;
      }
      photoPaths.push(path);
    }

    const { error: insertError } = await supabase
      .from("challenge_submissions")
      .insert({
        id: submissionId,
        user_id: user.id,
        challenge_id: challenge.id,
        challenge_title: challenge.title,
        challenge_category: challenge.category,
        photo_paths: photoPaths,
        description,
        date_completed: dateCompleted,
      });

    setLoading(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    try {
      await fetch("/api/notify-admin-submission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submissionId }),
      });
    } catch {
      // Submission saved; notification email is best-effort.
    }

    goToSection("submissions");
  }

  return (
    <div className="mx-auto max-w-xl">
      <Card>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Challenge</Label>
              <select
                className="h-11 w-full rounded-xl border border-border bg-page px-4 text-sm"
                value={challengeId}
                onChange={(e) => setChallengeId(e.target.value)}
                required
              >
                <option value="">Select a challenge</option>
                {CHALLENGE_TRACKS.map((track) => (
                  <optgroup key={track.id} label={track.label}>
                    {challenges
                      .filter((c) => challengeTrack(c) === track.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {getCategoryMeta(c.category).label}: {c.title}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {selectedChallenge?.proof_instructions && (
              <div className="rounded-xl border border-primary-mid/40 bg-primary-light/40 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-text-caption">
                  Proof instructions
                </p>
                <p className="mt-1 text-sm leading-relaxed text-text-muted whitespace-pre-wrap">
                  {selectedChallenge.proof_instructions}
                </p>
              </div>
            )}

            <div>
              <Label>Photo Proof (1–3 photos, max 10MB each)</Label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-primary-mid bg-primary-light/30 px-4 py-8">
                <IconCloudUpload className="text-primary" />
                <span className="mt-2 text-sm text-text-muted">
                  Click to upload photos
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onFilesSelected(e.target.files)}
                />
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {files.map((file, i) => (
                  <div key={`${file.name}-${i}`} className="relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="h-16 w-16 rounded object-cover"
                    />
                    <button
                      type="button"
                      className="absolute -right-1 -top-1 rounded-full bg-error p-0.5 text-white"
                      onClick={() =>
                        setFiles((prev) => prev.filter((_, idx) => idx !== i))
                      }
                    >
                      <IconX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your challenge..."
              />
            </div>

            <div>
              <Label>Date Completed</Label>
              <Input
                type="date"
                value={dateCompleted}
                onChange={(e) => setDateCompleted(e.target.value)}
                required
              />
            </div>

            <FieldError message={error ?? undefined} />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Submitting..." : "Submit Challenge"}
            </Button>
            <p className="text-center text-xs text-text-muted">
              Most submissions reviewed within 48–72 hours
            </p>
          </form>
        </Card>
    </div>
  );
}
