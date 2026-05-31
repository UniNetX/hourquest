"use client";

import Link from "next/link";
import { DashboardSectionProvider } from "@/components/dashboard/DashboardSectionProvider";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";

function DashboardTopBar() {
  return (
    <header className="site-header sticky top-0 z-50 border-b border-white/20 shadow-nav">
      <div className="section-container flex h-14 items-center justify-between gap-4">
        <Link
          href="/"
          className="text-base font-bold tracking-tight text-white hover:text-white/90"
        >
          HourQuest
        </Link>
        <Link
          href="/challenges"
          className="text-sm font-medium text-white/85 hover:text-white lg:hidden"
        >
          Challenges
        </Link>
      </div>
    </header>
  );
}

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
      <DashboardTopBar />

      <div className="section-container py-6 lg:py-10">
        <div className="mb-4 lg:hidden">
          <DashboardSidebar name={name} school={school} variant="mobile" />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <div className="hidden lg:block">
            <div className="sticky top-[4.5rem]">
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
