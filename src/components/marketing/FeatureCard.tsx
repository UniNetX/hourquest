import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";

export function FeatureCard({
  title,
  description,
  icon,
  tag,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  tag?: string;
}) {
  return (
    <Card className="flex h-full flex-col text-left">
      {tag && (
        <span className="mb-2 text-[0.6875rem] font-bold uppercase tracking-wider text-primary">
          {tag}
        </span>
      )}
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded border border-border bg-primary-light text-primary">
        {icon}
      </div>
      <h3 className="font-display text-base font-semibold text-text">{title}</h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
        {description}
      </p>
    </Card>
  );
}
