import { Card } from "@/components/ui/Card";
import type { PartnerOrganization } from "@/types/database";

type ShowcasePartner = Pick<
  PartnerOrganization,
  "id" | "name" | "description" | "website" | "logo_url"
>;

function partnerInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatWebsiteUrl(website: string) {
  const trimmed = website.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function PartnerTile({ partner }: { partner: ShowcasePartner }) {
  const websiteUrl = partner.website ? formatWebsiteUrl(partner.website) : null;

  return (
    <article className="pillar-card flex h-full flex-col text-left">
      <div className="mb-4 flex h-14 items-center">
        {partner.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={partner.logo_url}
            alt=""
            className="h-14 w-auto max-w-[140px] object-contain"
          />
        ) : (
          <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary-light text-lg font-semibold text-primary-dark">
            {partnerInitials(partner.name)}
          </span>
        )}
      </div>
      <h3 className="font-display text-lg font-semibold text-text">
        {partner.name}
      </h3>
      {partner.description && (
        <p className="mt-2 flex-1 text-sm leading-relaxed text-text-muted">
          {partner.description}
        </p>
      )}
      {websiteUrl && (
        <a
          href={websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pillar-card__link mt-4"
        >
          Learn more →
        </a>
      )}
    </article>
  );
}

export function PartnerShowcase({ partners }: { partners: ShowcasePartner[] }) {
  return (
    <section className="relative section-alt section-y overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
      >
        <svg
          className="absolute left-1/2 top-1/2 h-[140%] w-[140%] -translate-x-1/2 -translate-y-1/2 text-primary-light"
          viewBox="0 0 800 400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="400" cy="200" r="180" stroke="currentColor" strokeWidth="1" />
          <circle cx="400" cy="200" r="120" stroke="currentColor" strokeWidth="1" />
          <line x1="120" y1="200" x2="680" y2="200" stroke="currentColor" strokeWidth="1" />
          <line x1="400" y1="40" x2="400" y2="360" stroke="currentColor" strokeWidth="1" />
          <line x1="200" y1="80" x2="600" y2="320" stroke="currentColor" strokeWidth="1" />
          <line x1="600" y1="80" x2="200" y2="320" stroke="currentColor" strokeWidth="1" />
        </svg>
      </div>

      <div className="section-container relative">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold text-text">
            Our Partners
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            Organizations working with HourQuest to create meaningful volunteer
            opportunities for students.
          </p>
        </div>

        {partners.length === 0 ? (
          <Card className="mx-auto mt-10 max-w-lg text-center text-sm text-text-muted">
            Partner organizations will appear here once approved.
          </Card>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {partners.map((partner) => (
              <PartnerTile key={partner.id} partner={partner} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
