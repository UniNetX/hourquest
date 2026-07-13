"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CategoryIcon } from "@/components/challenges/CategoryIcon";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { Input, Label, Textarea } from "@/components/ui/Input";
import {
  DIFFICULTY_DEFAULTS,
  PARTNERSHIP_CHALLENGE_CATEGORIES,
  getCategoriesForTrack,
} from "@/lib/challenges/constants";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type {
  Challenge,
  ChallengeCategory,
  ChallengeDifficulty,
  PartnerOrganization,
} from "@/types/database";

function SortableChallengeRow({
  challenge,
  onEdit,
  onToggle,
  onDelete,
}: {
  challenge: Challenge;
  onEdit: (c: Challenge) => void;
  onToggle: (c: Challenge) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: challenge.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2"
    >
      <button
        type="button"
        className="cursor-grab text-text-caption"
        {...attributes}
        {...listeners}
        aria-label="Drag to reorder"
      >
        ⋮⋮
      </button>
      <CategoryIcon category={challenge.category} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <DifficultyBadge difficulty={challenge.difficulty} compact />
          {!challenge.active && (
            <span className="text-[10px] text-text-caption">Inactive</span>
          )}
        </div>
        <p className="truncate text-[13px] font-medium">{challenge.title}</p>
      </div>
      <span className="text-[11px] text-text-muted">{challenge.hours_earned} hrs</span>
      <button
        type="button"
        onClick={() => onToggle(challenge)}
        className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-medium",
          challenge.active ? "bg-primary text-white" : "bg-border",
        )}
      >
        {challenge.active ? "Active" : "Off"}
      </button>
      <Button variant="secondary" className="px-2 py-1 text-[11px]" onClick={() => onEdit(challenge)}>
        Edit
      </Button>
      <Button
        variant="danger"
        className="px-2 py-1 text-[11px]"
        disabled={challenge.total_submissions > 0}
        onClick={() => onDelete(challenge.id)}
      >
        Delete
      </Button>
    </div>
  );
}

export function PartnerDashboard({
  org,
  initialChallenges,
}: {
  org: PartnerOrganization;
  initialChallenges: Challenge[];
}) {
  const [challenges, setChallenges] = useState(initialChallenges);
  const [categoryFilter, setCategoryFilter] = useState<ChallengeCategory | "all">("all");
  const [activeOnly, setActiveOnly] = useState(false);
  const [editing, setEditing] = useState<Partial<Challenge> | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const loadChallenges = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("challenges")
      .select("*")
      .eq("partner_org_id", org.id)
      .eq("track", "partnership")
      .order("category")
      .order("sort_order");
    setChallenges((data as Challenge[]) ?? []);
  }, [org.id]);

  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
      if (activeOnly && !c.active) return false;
      return true;
    });
  }, [activeOnly, categoryFilter, challenges]);

  async function saveChallenge() {
    if (!editing?.title || !editing.category || !editing.difficulty) return;
    const difficulty = editing.difficulty as ChallengeDifficulty;
    const defaults = DIFFICULTY_DEFAULTS[difficulty];
    const payload = {
      id: editing.id,
      title: editing.title,
      description: editing.description ?? "",
      proof_instructions: editing.proof_instructions ?? "",
      category: editing.category,
      difficulty: editing.difficulty,
      hours_earned: editing.hours_earned ?? defaults.hours,
      points: editing.points ?? defaults.points,
      active: editing.active ?? true,
      sort_order: editing.sort_order,
    };
    const res = await fetch("/api/partner/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      alert(body?.error ?? "Failed to save challenge.");
      return;
    }
    setPanelOpen(false);
    setEditing(null);
    await loadChallenges();
  }

  async function toggleChallenge(challenge: Challenge) {
    await fetch("/api/partner/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: { id: challenge.id, active: !challenge.active },
      }),
    });
    await loadChallenges();
  }

  async function deleteChallenge(id: string) {
    if (!confirm("Permanently delete this challenge?")) return;
    await fetch("/api/partner/challenges/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId: id }),
    });
    await loadChallenges();
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id || categoryFilter === "all") return;
    const items = filteredChallenges.filter((c) => c.category === categoryFilter);
    const oldIndex = items.findIndex((c) => c.id === active.id);
    const newIndex = items.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    await fetch("/api/partner/challenges/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: categoryFilter,
        orderedIds: reordered.map((c) => c.id),
      }),
    });
    await loadChallenges();
  }

  const categories = getCategoriesForTrack("partnership");

  return (
    <div className="section-container space-y-8 py-8">
      <div>
        <h1 className="font-display text-2xl text-primary-dark">Your challenges</h1>
        <p className="mt-2 text-sm text-text-muted">
          Published challenges appear on the{" "}
          <Link href="/challenges?track=partnership" className="text-primary hover:underline">
            partnership catalog
          </Link>{" "}
          for students to complete.
        </p>
        {org.description && (
          <p className="mt-2 text-sm text-text-caption">{org.description}</p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoryFilter("all")}
            className={cn(
              "rounded-full px-3 py-1 text-[12px]",
              categoryFilter === "all" ? "bg-primary text-white" : "border border-border",
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={cn(
                "rounded-full px-3 py-1 text-[12px]",
                categoryFilter === cat.id ? "bg-primary text-white" : "border border-border",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-[12px]">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={(e) => setActiveOnly(e.target.checked)}
            />
            Active only
          </label>
          <Button
            onClick={() => {
              setEditing({
                active: true,
                hours_earned: 0.5,
                points: 50,
                difficulty: "easy",
                track: "partnership",
                category: PARTNERSHIP_CHALLENGE_CATEGORIES[0].id,
              });
              setPanelOpen(true);
            }}
          >
            Add challenge
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={filteredChallenges.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {filteredChallenges.length === 0 ? (
              <Card className="text-sm text-text-muted">
                No challenges yet. Add your first partnership challenge.
              </Card>
            ) : (
              filteredChallenges.map((challenge) => (
                <SortableChallengeRow
                  key={challenge.id}
                  challenge={challenge}
                  onEdit={(c) => {
                    setEditing(c);
                    setPanelOpen(true);
                  }}
                  onToggle={toggleChallenge}
                  onDelete={deleteChallenge}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {panelOpen && editing && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-lg overflow-y-auto bg-white p-6">
            <h3 className="text-[16px] font-medium">
              {editing.id ? "Edit challenge" : "New partnership challenge"}
            </h3>
            <div className="mt-4 space-y-3">
              <div>
                <Label>Title</Label>
                <Input
                  value={editing.title ?? ""}
                  maxLength={100}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  value={editing.description ?? ""}
                  maxLength={500}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Proof instructions</Label>
                <Textarea
                  value={editing.proof_instructions ?? ""}
                  maxLength={300}
                  onChange={(e) =>
                    setEditing({ ...editing, proof_instructions: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Category</Label>
                <select
                  className="h-[40px] w-full rounded-[10px] border px-3 text-[13px]"
                  value={editing.category ?? "community_service"}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      category: e.target.value as ChallengeCategory,
                    })
                  }
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Difficulty</Label>
                <select
                  className="h-[40px] w-full rounded-[10px] border px-3 text-[13px]"
                  value={editing.difficulty ?? "easy"}
                  onChange={(e) => {
                    const difficulty = e.target.value as ChallengeDifficulty;
                    const defaults = DIFFICULTY_DEFAULTS[difficulty];
                    setEditing({
                      ...editing,
                      difficulty,
                      hours_earned: defaults.hours,
                      points: defaults.points,
                    });
                  }}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Hours</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min={0}
                    value={editing.hours_earned ?? 0.5}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        hours_earned: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Points</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editing.points ?? 50}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        points: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-[13px]">
                <input
                  type="checkbox"
                  checked={editing.active !== false}
                  onChange={(e) => setEditing({ ...editing, active: e.target.checked })}
                />
                Published (visible to students)
              </label>
            </div>
            <div className="mt-6 flex gap-2">
              <Button onClick={saveChallenge}>Save</Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setPanelOpen(false);
                  setEditing(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
