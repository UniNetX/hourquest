import { cn } from "@/lib/utils";

export function Marquee({
  items,
  className,
}: {
  items: string[];
  className?: string;
}) {
  if (items.length === 0) return null;

  const doubled = [...items, ...items];

  return (
    <div
      className={cn("overflow-hidden border-y border-border bg-surface py-4", className)}
      aria-label="Participating schools"
    >
      <div className="flex w-max motion-safe:animate-marquee">
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="mx-6 shrink-0 text-sm font-medium text-text-muted"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
