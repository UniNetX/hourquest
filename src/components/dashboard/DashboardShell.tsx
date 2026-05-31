"use client";

import { DashboardSectionProvider } from "@/components/dashboard/DashboardSectionProvider";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

function DashboardShellInner({
  name,
  school,
  children,
}: {
  name: string;
  school?: string | null;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-page">
      <div className="section-container py-6 lg:py-10">
        <div className="mb-4 lg:hidden">
          <DashboardSidebar name={name} school={school} variant="mobile" />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <div className="hidden lg:block">
            <div className="sticky top-24 lg:top-28">
              <DashboardSidebar name={name} school={school} />
            </div>
          </div>

          <main className="min-w-0 flex-1 rounded-xl border border-border bg-surface p-6 shadow-card md:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

export function DashboardShell({
  name,
  school,
  children,
}: {
  name: string;
  school?: string | null;
  children: React.ReactNode;
}) {
  return (
    <DashboardSectionProvider>
      <DashboardShellInner name={name} school={school}>
        {children}
      </DashboardShellInner>
    </DashboardSectionProvider>
  );
}
