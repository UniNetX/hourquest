import { IconCheck, IconClock, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import type { SubmissionStatus } from "@/types/database";

const config: Record<
  SubmissionStatus,
  { className: string; label: string; Icon: typeof IconCheck }
> = {
  approved: {
    className: "bg-primary-light text-primary",
    label: "Approved",
    Icon: IconCheck,
  },
  pending: {
    className: "bg-[#fff8e1] text-warning",
    label: "Pending",
    Icon: IconClock,
  },
  rejected: {
    className: "bg-[#ffe8e8] text-error",
    label: "Rejected",
    Icon: IconX,
  },
};

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  const { className, label, Icon } = config[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        className,
      )}
    >
      <Icon size={12} />
      {label}
    </span>
  );
}
