import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  subtitle,
  eyebrow,
  className,
  align = "left",
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  className?: string;
  align?: "center" | "left";
}) {
  return (
    <div
      className={cn(
        "section-head",
        align === "center" && "section-head--center mx-auto",
        className,
      )}
    >
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="font-display text-text">{title}</h2>
      {subtitle && <p>{subtitle}</p>}
    </div>
  );
}
