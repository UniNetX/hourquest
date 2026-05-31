import type { ChallengeCategory, ChallengeDifficulty } from "@/types/database";

export const CHALLENGE_CATEGORIES: {
  id: ChallengeCategory;
  label: string;
  icon: string;
  bg: string;
  color: string;
}[] = [
  { id: "cleanup", label: "Clean Up", icon: "trash", bg: "#D8F3DC", color: "#2D6A4F" },
  { id: "plant", label: "Plant & Grow", icon: "plant", bg: "#E8F5E9", color: "#388E3C" },
  { id: "waste", label: "Reduce Waste", icon: "recycle", bg: "#FFF8E1", color: "#E65100" },
  { id: "water", label: "Water & Energy", icon: "droplet", bg: "#E3F2FD", color: "#185FA5" },
  { id: "social", label: "Social & Awareness", icon: "speakerphone", bg: "#FFF0F5", color: "#993556" },
  { id: "community", label: "Community", icon: "users", bg: "#F3E8FF", color: "#6B21A8" },
];

export const DIFFICULTY_DEFAULTS: Record<
  ChallengeDifficulty,
  { hours: number; points: number }
> = {
  easy: { hours: 0.5, points: 50 },
  medium: { hours: 1, points: 100 },
  hard: { hours: 2, points: 200 },
};

export const CERTIFICATE_MILESTONES = [10, 25, 50, 100] as const;

export const FAQ_ITEMS = [
  {
    question: "How long does verification take?",
    answer:
      "Most submissions are reviewed within 48–72 hours. You'll receive an email when your hours are approved or if we need more information.",
  },
  {
    question: "What counts as valid photo proof?",
    answer:
      "Photos should clearly show you completing the challenge as described. Follow the proof instructions on each challenge page. Blurry, unrelated, or stock photos will be rejected.",
  },
  {
    question: "Can I repeat the same challenge?",
    answer:
      "Each challenge can be submitted once unless it explicitly allows repeats. Check the challenge description for details.",
  },
  {
    question: "How do I download my certificate?",
    answer:
      "Once you reach 10, 25, 50, or 100 verified hours, your certificate appears on My Certificates. Click Download PDF to save it for college applications.",
  },
  {
    question: "Is TerraServe Challenges free?",
    answer:
      "Yes — completely free for students. No fees, no subscriptions, ever.",
  },
  {
    question: "What if my submission is rejected?",
    answer:
      "You'll receive an email with feedback and can resubmit with improved proof. Your original submission stays on record for reference.",
  },
];

export function getCategoryMeta(category: ChallengeCategory) {
  return CHALLENGE_CATEGORIES.find((c) => c.id === category)!;
}

export function getNextMilestone(hours: number): number | null {
  for (const m of CERTIFICATE_MILESTONES) {
    if (hours < m) return m;
  }
  return null;
}
