import type {
  ChallengeCategory,
  ChallengeDifficulty,
  ChallengeTrack,
} from "@/types/database";

export type CategoryMeta = {
  id: ChallengeCategory;
  label: string;
  icon: string;
  bg: string;
  color: string;
  track: ChallengeTrack;
};

export const CHALLENGE_TRACKS: { id: ChallengeTrack; label: string }[] = [
  { id: "environmental", label: "Environmental" },
  { id: "medical", label: "Medical" },
  { id: "partnership", label: "Partnership Challenges" },
];

export const PARTNERSHIP_CHALLENGE_CATEGORIES: CategoryMeta[] = [
  { id: "community_service", label: "Community Service", icon: "users", bg: "#F3E8FF", color: "#6B21A8", track: "partnership" },
  { id: "education", label: "Education", icon: "school", bg: "#E0E7FF", color: "#4338CA", track: "partnership" },
  { id: "fundraising", label: "Fundraising", icon: "speakerphone", bg: "#FFF8E1", color: "#E65100", track: "partnership" },
  { id: "outreach", label: "Outreach", icon: "speakerphone", bg: "#E3F2FD", color: "#185FA5", track: "partnership" },
  { id: "wellness_partner", label: "Health & Wellness", icon: "wellness", bg: "#E0F2FE", color: "#0369A1", track: "partnership" },
  { id: "other", label: "Other", icon: "users", bg: "#E8F5E9", color: "#388E3C", track: "partnership" },
];

export const ENVIRONMENTAL_CHALLENGE_CATEGORIES: CategoryMeta[] = [
  { id: "cleanup", label: "Clean Up", icon: "trash", bg: "#D8F3DC", color: "#2D6A4F", track: "environmental" },
  { id: "plant", label: "Plant & Grow", icon: "plant", bg: "#E8F5E9", color: "#388E3C", track: "environmental" },
  { id: "waste", label: "Reduce Waste", icon: "recycle", bg: "#FFF8E1", color: "#E65100", track: "environmental" },
  { id: "water", label: "Water & Energy", icon: "droplet", bg: "#E3F2FD", color: "#185FA5", track: "environmental" },
  { id: "social", label: "Social & Awareness", icon: "speakerphone", bg: "#FFF0F5", color: "#993556", track: "environmental" },
  { id: "community", label: "Community", icon: "users", bg: "#F3E8FF", color: "#6B21A8", track: "environmental" },
];

export const MEDICAL_CHALLENGE_CATEGORIES: CategoryMeta[] = [
  { id: "health_education", label: "Health Education", icon: "health_education", bg: "#E0E7FF", color: "#4338CA", track: "medical" },
  { id: "wellness", label: "Wellness & Prevention", icon: "wellness", bg: "#E0F2FE", color: "#0369A1", track: "medical" },
  { id: "first_aid", label: "First Aid & Safety", icon: "first_aid", bg: "#FFF8E1", color: "#E65100", track: "medical" },
  { id: "mental_health", label: "Mental Health Awareness", icon: "mental_health", bg: "#FFF0F5", color: "#993556", track: "medical" },
  { id: "nutrition", label: "Nutrition & Healthy Habits", icon: "nutrition", bg: "#F3E8FF", color: "#6B21A8", track: "medical" },
  { id: "community_health", label: "Community Health Service", icon: "community_health", bg: "#FCE7F3", color: "#BE185D", track: "medical" },
];

/** @deprecated Use getCategoriesForTrack or track-specific lists */
export const CHALLENGE_CATEGORIES = [
  ...ENVIRONMENTAL_CHALLENGE_CATEGORIES,
  ...MEDICAL_CHALLENGE_CATEGORIES,
  ...PARTNERSHIP_CHALLENGE_CATEGORIES,
];

export const DISPLAY_IMPACT_STATS = {
  hours: 1000,
  students: 400,
  challenges: 30,
} as const;

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
    question: "Is HourQuest free?",
    answer:
      "Yes — completely free for students. No fees, no subscriptions, ever.",
  },
  {
    question: "What if my submission is rejected?",
    answer:
      "You'll receive an email with feedback and can resubmit with improved proof. Your original submission stays on record for reference.",
  },
];

export function getCategoriesForTrack(track: ChallengeTrack): CategoryMeta[] {
  if (track === "medical") return MEDICAL_CHALLENGE_CATEGORIES;
  if (track === "partnership") return PARTNERSHIP_CHALLENGE_CATEGORIES;
  return ENVIRONMENTAL_CHALLENGE_CATEGORIES;
}

export function getCategoryMeta(category: ChallengeCategory): CategoryMeta {
  return CHALLENGE_CATEGORIES.find((c) => c.id === category)!;
}

export function getTrackForCategory(category: ChallengeCategory): ChallengeTrack {
  return getCategoryMeta(category).track;
}

export function getNextMilestone(hours: number): number | null {
  for (const m of CERTIFICATE_MILESTONES) {
    if (hours < m) return m;
  }
  return null;
}

export function challengeTrack(challenge: { track?: ChallengeTrack | null }): ChallengeTrack {
  if (challenge.track === "medical" || challenge.track === "partnership") {
    return challenge.track;
  }
  return "environmental";
}

export function displayImpactStats(stats: {
  hours: number;
  students: number;
  challenges: number;
}) {
  return {
    hours: Math.max(stats.hours, DISPLAY_IMPACT_STATS.hours),
    students: Math.max(stats.students, DISPLAY_IMPACT_STATS.students),
    challenges: Math.max(stats.challenges, DISPLAY_IMPACT_STATS.challenges),
  };
}
