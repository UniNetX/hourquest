import {
  IconApple,
  IconDroplet,
  IconFirstAidKit,
  IconHeart,
  IconPlant,
  IconRecycle,
  IconSchool,
  IconSpeakerphone,
  IconTrash,
  IconUsers,
} from "@tabler/icons-react";
import type { ChallengeCategory } from "@/types/database";
import { getCategoryMeta } from "@/lib/challenges/constants";

const icons = {
  trash: IconTrash,
  plant: IconPlant,
  recycle: IconRecycle,
  droplet: IconDroplet,
  speakerphone: IconSpeakerphone,
  users: IconUsers,
  school: IconSchool,
  health_education: IconSchool,
  wellness: IconHeart,
  first_aid: IconFirstAidKit,
  mental_health: IconHeart,
  nutrition: IconApple,
  community_health: IconUsers,
} as const;

export function CategoryIcon({
  category,
  size = 18,
}: {
  category: ChallengeCategory;
  size?: number;
}) {
  const meta = getCategoryMeta(category);
  const Icon = icons[meta.icon as keyof typeof icons] ?? IconTrash;

  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[9px]"
      style={{ backgroundColor: meta.bg, color: meta.color }}
    >
      <Icon size={size} />
    </div>
  );
}
