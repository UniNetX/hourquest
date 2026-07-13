import { cn } from "@/lib/utils";

export function ProofInstructions({
  text,
  compact = false,
}: {
  text: string;
  compact?: boolean;
}) {
  if (!text) return null;

  if (compact) {
    return (
      <details className="group mt-2 shrink-0 text-xs leading-relaxed text-text-muted">
        <summary className="cursor-pointer list-none font-semibold text-text-caption marker:content-none [&::-webkit-details-marker]:hidden">
          <span className="underline decoration-border underline-offset-2 group-open:no-underline">
            Proof requirements
          </span>
        </summary>
        <p className="mt-1.5 whitespace-pre-wrap">{text}</p>
      </details>
    );
  }

  return (
    <div className="rounded-xl border border-primary-mid/40 bg-primary-light/40 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-text-caption">
        Proof instructions
      </p>
      <p className={cn("mt-1 text-sm leading-relaxed text-text-muted whitespace-pre-wrap")}>
        {text}
      </p>
    </div>
  );
}
