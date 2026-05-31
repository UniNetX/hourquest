"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { IconGripVertical } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DifficultyBadge } from "@/components/ui/DifficultyBadge";
import { ChallengeCard } from "@/components/challenges/ChallengeCard";
import { CategoryIcon } from "@/components/challenges/CategoryIcon";
import { Input, Label, Textarea } from "@/components/ui/Input";
import {
  CHALLENGE_CATEGORIES,
  DIFFICULTY_DEFAULTS,
} from "@/lib/challenges/constants";
import { cn } from "@/lib/utils";
import type {
  Challenge,
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeSubmission,
  StudentStory,
} from "@/types/database";
import { createClient } from "@/lib/supabase/client";

type ProfileRow = {
  id: string;
  full_name: string;
  school_name: string | null;
  total_verified_hours: number;
  created_at: string;
};

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
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: challenge.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card"
    >
      <button type="button" className="text-[#ccc]" {...attributes} {...listeners}>
        <IconGripVertical size={20} />
      </button>
      <CategoryIcon category={challenge.category} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={challenge.difficulty} compact />
          {!challenge.active && (
            <span className="text-[10px] text-text-caption">Inactive</span>
          )}
        </div>
        <p className="truncate text-[13px] font-medium">{challenge.title}</p>
      </div>
      <span className="rounded-full bg-primary-light px-2 py-0.5 text-[10px] text-primary">
        {challenge.hours_earned} hrs
      </span>
      <button
        type="button"
        onClick={() => onToggle(challenge)}
        className={cn(
          "rounded-full px-2 py-1 text-[10px]",
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

export function AdminDashboard({
  initialStats,
  initialSubmissions,
  initialChallenges,
  initialStories,
  initialUsers,
}: {
  initialStats: {
    users: number;
    hours: number;
    pending: number;
    submissions: number;
  };
  initialSubmissions: ChallengeSubmission[];
  initialChallenges: Challenge[];
  initialStories: StudentStory[];
  initialUsers: ProfileRow[];
}) {
  const [tab, setTab] = useState<"submissions" | "challenges" | "stories" | "users">("submissions");
  const [submissions, setSubmissions] = useState(initialSubmissions);
  const [challenges, setChallenges] = useState(initialChallenges);
  const [stories, setStories] = useState(initialStories);
  const [users, setUsers] = useState(initialUsers);
  const [categoryFilter, setCategoryFilter] = useState<ChallengeCategory | "all">("all");
  const [activeOnly, setActiveOnly] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Challenge> | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [userSearch, setUserSearch] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const [subs, chals, sts, profs] = await Promise.all([
      supabase.from("challenge_submissions").select("*").order("submitted_at", { ascending: false }),
      supabase.from("challenges").select("*").order("category").order("sort_order"),
      supabase.from("student_stories").select("*").order("submitted_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, school_name, total_verified_hours, created_at").order("created_at", { ascending: false }).limit(100),
    ]);
    setSubmissions(subs.data ?? []);
    setChallenges(chals.data ?? []);
    setStories(sts.data ?? []);
    setUsers(profs.data ?? []);
  }, []);

  async function reviewSubmission(id: string, action: "approve" | "reject", reason?: string) {
    await fetch("/api/admin/review-submission", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ submissionId: id, action, rejectionReason: reason }),
    });
    setRejectId(null);
    setRejectReason("");
    await loadData();
  }

  async function saveChallenge() {
    if (!editing?.title || !editing.category || !editing.difficulty) return;
    const res = await fetch("/api/admin/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payload: editing }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      alert(body?.error ?? "Failed to save challenge. Check that admin database functions are installed.");
      return;
    }
    setPanelOpen(false);
    setEditing(null);
    loadData();
  }

  async function toggleChallenge(challenge: Challenge) {
    await fetch("/api/admin/challenges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        payload: { id: challenge.id, active: !challenge.active },
      }),
    });
    loadData();
  }

  async function deleteChallenge(id: string) {
    if (!confirm("Permanently delete this challenge?")) return;
    await fetch("/api/admin/challenges/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ challengeId: id }),
    });
    loadData();
  }

  async function moderateStory(id: string, approved: boolean) {
    await fetch("/api/admin/stories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId: id, approved }),
    });
    loadData();
  }

  const filteredChallenges = useMemo(() => {
    return challenges.filter((c) => {
      if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
      if (activeOnly && !c.active) return false;
      return true;
    });
  }, [challenges, categoryFilter, activeOnly]);

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.school_name ?? "").toLowerCase().includes(userSearch.toLowerCase()),
  );

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const items = filteredChallenges.filter((c) => categoryFilter === "all" || c.category === categoryFilter);
    const oldIndex = items.findIndex((c) => c.id === active.id);
    const newIndex = items.findIndex((c) => c.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    if (categoryFilter === "all") return;
    const category = categoryFilter;
    await fetch("/api/admin/challenges/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        orderedIds: reordered.map((c) => c.id),
      }),
    });
    loadData();
  }

  const pendingSubs = submissions.filter((s) => s.status === "pending");

  return (
    <div className="min-h-screen bg-page">
      <header className="site-header sticky top-0 z-50 border-b border-white/20 shadow-nav">
        <div className="section-container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-medium text-white/80 hover:text-white">
              ← TerraServe
            </Link>
            <span className="text-white/30">|</span>
            <span className="text-base font-medium">Admin</span>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/70">
            Founder Only
          </span>
        </div>
      </header>

      <div className="section-container space-y-8 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            [initialStats.users, "Total Users"],
            [initialStats.hours, "Verified Hours"],
            [initialStats.pending, "Pending Reviews"],
            [initialStats.submissions, "Total Submissions"],
          ].map(([value, label]) => (
            <Card key={label as string} className="text-center">
              <p className="text-3xl font-medium text-primary">{value}</p>
              <p className="mt-1 text-xs text-text-muted">{label}</p>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Admin sections">
          {(["submissions", "challenges", "stories", "users"] as const).map((key) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={tab === key}
              onClick={() => setTab(key)}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                tab === key
                  ? "bg-primary text-white"
                  : "border border-border bg-surface text-text-muted hover:text-text",
              )}
            >
              {key}
            </button>
          ))}
        </div>

        {tab === "submissions" && (
          <div className="space-y-3">
            <h2 className="text-lg font-medium">Pending Submissions</h2>
            {pendingSubs.length === 0 ? (
              <Card className="text-sm text-text-muted">No pending submissions.</Card>
            ) : (
              pendingSubs.map((sub) => (
                <Card key={sub.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[13px] font-medium">{sub.challenge_title}</p>
                      <p className="text-[11px] text-text-caption">
                        User {sub.user_id.slice(0, 8)}… · {sub.date_completed}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="px-3 py-1 text-[12px]"
                        onClick={() => reviewSubmission(sub.id, "approve")}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        className="px-3 py-1 text-[12px]"
                        onClick={() => setRejectId(sub.id)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {tab === "challenges" && (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
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
                {CHALLENGE_CATEGORIES.map((cat) => (
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
                  Active Only
                </label>
                <Button
                  onClick={() => {
                    setEditing({
                      active: true,
                      hours_earned: 0.5,
                      points: 50,
                      difficulty: "easy",
                      category: "cleanup",
                    });
                    setPanelOpen(true);
                  }}
                >
                  Add New Challenge
                </Button>
              </div>
            </div>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext
                items={filteredChallenges.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-2">
                  {filteredChallenges.map((challenge) => (
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
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        )}

        {tab === "stories" && (
          <div className="space-y-2">
            {stories
              .filter((s) => !s.approved)
              .map((story) => (
                <Card key={story.id}>
                  <p className="text-[13px]">{story.comment}</p>
                  <div className="mt-2 flex gap-2">
                    <Button className="px-3 py-1 text-[12px]" onClick={() => moderateStory(story.id, true)}>
                      Approve
                    </Button>
                    <Button variant="danger" className="px-3 py-1 text-[12px]" onClick={() => moderateStory(story.id, false)}>
                      Reject
                    </Button>
                  </div>
                </Card>
              ))}
          </div>
        )}

        {tab === "users" && (
          <div>
            <Input
              placeholder="Search users..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="mb-4 max-w-sm"
            />
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2">Name</th>
                    <th className="py-2">School</th>
                    <th className="py-2">Hours</th>
                    <th className="py-2">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="border-b border-border">
                      <td className="py-2">{u.full_name}</td>
                      <td className="py-2">{u.school_name}</td>
                      <td className="py-2">{u.total_verified_hours}</td>
                      <td className="py-2">{u.created_at.slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {rejectId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-md">
            <h3 className="text-[14px] font-medium">Rejection Reason</h3>
            <Textarea
              className="mt-3"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            <div className="mt-3 flex gap-2">
              <Button
                variant="danger"
                onClick={() => reviewSubmission(rejectId, "reject", rejectReason)}
              >
                Confirm Reject
              </Button>
              <Button variant="ghost" onClick={() => setRejectId(null)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}

      {panelOpen && editing && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40">
          <div className="h-full w-full max-w-lg overflow-y-auto bg-white p-6">
            <h3 className="text-[16px] font-medium">
              {editing.id ? "Edit Challenge" : "Add Challenge"}
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
                <Label>Proof Instructions</Label>
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
                  value={editing.category ?? "cleanup"}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      category: e.target.value as ChallengeCategory,
                    })
                  }
                >
                  {CHALLENGE_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Difficulty</Label>
                <div className="flex gap-2">
                  {(["easy", "medium", "hard"] as ChallengeDifficulty[]).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() =>
                        setEditing({
                          ...editing,
                          difficulty: d,
                          hours_earned: DIFFICULTY_DEFAULTS[d].hours,
                          points: DIFFICULTY_DEFAULTS[d].points,
                        })
                      }
                      className={cn(
                        "rounded-full px-3 py-1 text-[12px] capitalize",
                        editing.difficulty === d ? "bg-primary text-white" : "border border-border",
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Hours</Label>
                  <Input
                    type="number"
                    step="0.5"
                    value={editing.hours_earned ?? 0.5}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        hours_earned: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Points</Label>
                  <Input
                    type="number"
                    value={editing.points ?? 50}
                    onChange={(e) =>
                      setEditing({ ...editing, points: parseInt(e.target.value, 10) })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-4">
              <p className="mb-2 text-[10px] font-medium uppercase tracking-wide text-[#888]">
                Preview — how students will see this challenge
              </p>
              {editing.title && editing.description && editing.difficulty && (
                <ChallengeCard
                  challenge={editing as Challenge}
                  startHref="#"
                  preview
                />
              )}
            </div>

            <div className="mt-6 flex gap-2">
              <Button onClick={saveChallenge}>Save Challenge</Button>
              <Button variant="ghost" onClick={() => setPanelOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
