import type { ReactNode } from "react";

export function StepCard({
  step,
  title,
  description,
  icon,
}: {
  step: string;
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <article className="pillar-card h-full">
      <span className="pillar-card__tag">Step {step}</span>
      <div className="mb-2 flex items-center gap-2">
        {icon}
        <h3 className="font-display !m-0">{title}</h3>
      </div>
      {description && (
        <p className="!mb-0">{description}</p>
      )}
    </article>
  );
}
