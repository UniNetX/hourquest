import type { DashboardSectionId } from "@/lib/dashboard-nav";
import { getDashboardSectionMeta } from "@/lib/dashboard-nav";

export function DashboardSectionHeader({ section }: { section: DashboardSectionId }) {
  const meta = getDashboardSectionMeta(section);

  return (
    <header className="mb-8">
      <p className="eyebrow mb-1">Dashboard</p>
      <h1 className="font-display text-2xl text-primary-dark md:text-3xl">
        {meta.label}
      </h1>
      <p className="mt-2 max-w-xl text-sm text-text-muted">{meta.description}</p>
    </header>
  );
}
