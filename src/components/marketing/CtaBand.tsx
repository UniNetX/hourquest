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
          <div className="join-panel__cta flex flex-wrap justify-center gap-3 border-t-0 pt-0">
            <Button href={primaryHref} variant="primary" size="lg">
              {primaryLabel}
            </Button>
            {secondaryLabel && secondaryHref && (
              <Button href={secondaryHref} variant="secondary" size="lg">
                {secondaryLabel}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
