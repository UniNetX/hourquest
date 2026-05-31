import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  children,
  className,
  active,
  interactive,
}: {
  children: ReactNode;
  className?: string;
  active?: boolean;
  interactive?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded border border-border bg-surface p-5 shadow-card",
        active && "border-primary-mid",
        interactive &&
          "transition-[border-color,box-shadow] hover:border-primary-mid hover:shadow-card-hover",
        className,
      )}
    >
      {children}
    </div>
  );
}
