import { Button } from "@/components/ui/Button";

export function CtaBand({
  title,
  subtitle,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
}: {
  title: string;
  subtitle?: string;
  primaryLabel: string;
  primaryHref: string;
  secondaryLabel?: string;
  secondaryHref?: string;
}) {
  return (
    <section className="section-y section-join">
      <div className="section-container">
        <div className="join-panel">
          <div className="join-panel__head">
            <h2 className="font-display text-primary-dark">{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <div className="join-panel__cta flex flex-col items-stretch gap-3 border-t-0 pt-0 sm:flex-row sm:flex-wrap sm:justify-center sm:items-center">
            <Button href={primaryHref} variant="primary" size="lg" className="w-full sm:w-auto">
              {primaryLabel}
            </Button>
            {secondaryLabel && secondaryHref && (
              <Button href={secondaryHref} variant="secondary" size="lg" className="w-full sm:w-auto">
                {secondaryLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
