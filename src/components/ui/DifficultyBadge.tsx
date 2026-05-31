import { cn } from "@/lib/utils";
import type { ChallengeDifficulty } from "@/types/database";

const styles: Record<ChallengeDifficulty, string> = {
  easy: "bg-primary-light text-primary",
  medium: "bg-[#fff8e1] text-warning",
  hard: "bg-[#ffe8e8] text-error",
};

const labels: Record<ChallengeDifficulty, string> = {
  easy: "Easy · 0.5 hrs · 50 pts",
  medium: "Medium · 1 hr · 100 pts",
  hard: "Hard · 2 hrs · 200 pts",
};

export function DifficultyBadge({
  difficulty,
  compact,
}: {
  difficulty: ChallengeDifficulty;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-medium",
        styles[difficulty],
      )}
    >
      {compact ? difficulty : labels[difficulty]}
    </span>
  );
}
