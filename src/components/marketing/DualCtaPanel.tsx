import { Button } from "@/components/ui/Button";
import { SectionHeader } from "@/components/marketing/SectionHeader";

type PanelItem = {
  title: string;
  description: string;
  bullets?: string[];
  ctaLabel: string;
  ctaHref: string;
};

export function DualCtaPanel({
  title,
  subtitle,
  left,
  right,
}: {
  title: string;
  subtitle?: string;
  left: PanelItem;
  right: PanelItem;
}) {
  return (
    <section className="section-y section-join">
      <div className="section-container">
        <div className="join-panel join-panel--wide">
          <SectionHeader title={title} subtitle={subtitle} align="center" />
          <div className="grid gap-8 border-t border-border pt-8 md:grid-cols-2">
            {[left, right].map((panel) => (
              <div key={panel.title} className="flex flex-col">
                <span className="pillar-card__tag mb-2">For you</span>
                <h3 className="font-display text-lg font-semibold text-text">
                  {panel.title}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
                  {panel.description}
                </p>
                {panel.bullets && panel.bullets.length > 0 && (
                  <ul className="mt-4 space-y-2">
                    {panel.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-2 text-sm text-text-muted"
                      >
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary-mid" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                )}
                <Button href={panel.ctaHref} className="mt-6 w-full sm:w-auto">
                  {panel.ctaLabel}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
