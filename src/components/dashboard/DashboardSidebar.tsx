"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconCertificate,
  IconLayoutDashboard,
  IconListCheck,
  IconLogout,
  IconMap2,
  IconUpload,
  IconUser,
} from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import {
  DASHBOARD_SECTIONS,
  type DashboardSectionId,
} from "@/lib/dashboard-nav";
import {
  dashboardNavLinkClass,
  DashboardSectionLink,
} from "@/components/dashboard/DashboardSectionLink";
import { useDashboardSection } from "@/components/dashboard/DashboardSectionProvider";
import { getDisplayInitial } from "@/lib/profile-display";
import { cn } from "@/lib/utils";

const icons: Record<DashboardSectionId, typeof IconLayoutDashboard> = {
  overview: IconLayoutDashboard,
  submit: IconUpload,
  submissions: IconListCheck,
  certificates: IconCertificate,
  profile: IconUser,
};

export function DashboardSidebar({
  name,
  school,
  variant = "sidebar",
}: {
  name: string;
  school?: string | null;
  variant?: "sidebar" | "mobile";
}) {
  const router = useRouter();
  const { section: active } = useDashboardSection();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (variant === "mobile") {
    return (
      <div className="filter-scroll flex gap-2 pb-1 lg:hidden">
        {DASHBOARD_SECTIONS.map((item) => (
          <DashboardSectionLink
            key={item.id}
            section={item.id}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              active === item.id
                ? "bg-primary text-white"
                : "border border-border bg-surface text-text-muted",
            )}
          >
            {item.label}
          </DashboardSectionLink>
        ))}
      </div>
    );
  }

  return (
    <aside className="flex w-full flex-col lg:w-56 lg:shrink-0">
      <div className="rounded-xl border border-border bg-surface p-4 shadow-card">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-base font-semibold text-primary-dark">
            {getDisplayInitial(name)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-text">{name}</p>
            {school && (
              <p className="truncate text-xs text-text-caption">{school}</p>
            )}
          </div>
        </div>
      </div>

      <nav className="mt-4 flex flex-col gap-1" aria-label="Dashboard">
        {DASHBOARD_SECTIONS.map((item) => {
          const Icon = icons[item.id];
          return (
            <DashboardSectionLink
              key={item.id}
              section={item.id}
              className={dashboardNavLinkClass(active === item.id)}
            >
              <Icon size={18} stroke={1.75} aria-hidden />
              {item.label}
            </DashboardSectionLink>
          );
        })}
        <div className="my-2 border-t border-border" />
        <Link
          href="/challenges"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-text-muted transition-colors hover:bg-primary-light/60 hover:text-primary-dark"
        >
          <IconMap2 size={18} stroke={1.75} aria-hidden />
          Browse challenges
        </Link>
      </nav>

      <button
        type="button"
        onClick={handleSignOut}
        className="mt-6 flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-red-50 hover:text-error"
      >
        <IconLogout size={18} />
        Sign out
      </button>
    </aside>
  );
}
