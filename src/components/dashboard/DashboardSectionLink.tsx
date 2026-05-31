"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useDashboardSection } from "@/components/dashboard/DashboardSectionProvider";
import type { DashboardSectionId } from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

type Props = ComponentPropsWithoutRef<"button"> & {
  section: DashboardSectionId;
  challengeId?: string;
};

export function DashboardSectionLink({
  section,
  challengeId,
  className,
  children,
  onClick,
  ...props
}: Props) {
  const { goToSection, section: active } = useDashboardSection();

  return (
    <button
      type="button"
      {...props}
      className={className}
      aria-current={active === section ? "page" : undefined}
      onClick={(e) => {
        goToSection(section, { challengeId });
        onClick?.(e);
      }}
    >
      {children}
    </button>
  );
}

export function dashboardNavLinkClass(isActive: boolean) {
  return cn(
    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary text-white shadow-sm"
      : "text-text-muted hover:bg-primary-light/60 hover:text-primary-dark",
  );
}
