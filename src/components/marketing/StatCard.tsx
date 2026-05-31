import { cn } from "@/lib/utils";

export function StatCard({
  value,
  label,
  description,
  className,
}: {
  value: string;
  label: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded border border-border bg-surface p-6 shadow-card transition-[border-color,box-shadow] hover:border-primary-mid hover:shadow-card-hover",
        className,
      )}
    >
      <p className="font-display text-3xl font-semibold text-primary-dark md:text-4xl">
        {value}
      </p>
      <p className="mt-2 text-sm font-semibold text-text">{label}</p>
      {description && (
        <p className="mt-1 text-xs leading-relaxed text-text-muted">
          {description}
        </p>
      )}
    </div>
  );
}
