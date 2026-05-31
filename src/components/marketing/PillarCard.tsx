import Link from "next/link";
import { cn } from "@/lib/utils";

export function PillarCard({
  tag,
  title,
  description,
  href,
  linkLabel,
  className,
}: {
  tag: string;
  title: string;
  description: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  const content = (
    <article className={cn("pillar-card h-full", className)}>
      <span className="pillar-card__tag">{tag}</span>
      <h3 className="font-display">{title}</h3>
      <p>{description}</p>
      {href && linkLabel && (
        <span className="pillar-card__link">{linkLabel}</span>
      )}
    </article>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full no-underline">
        {content}
      </Link>
    );
  }

  return content;
}
