import { DashboardNav } from "@/components/dashboard/DashboardNav";

export function DashboardShell({
  name,
  school,
  title,
  children,
}: {
  name: string;
  school?: string | null;
  title?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-page">
      <DashboardNav />
      <div className="border-b border-border bg-surface">
        <div className="section-container py-6">
          <p className="text-sm text-text-muted">Welcome back</p>
          <h1 className="text-xl font-medium text-text md:text-2xl">
            {title ?? name}
          </h1>
          {school && !title && (
            <p className="mt-1 text-sm text-text-muted">{school}</p>
          )}
          {school && title && (
            <p className="mt-1 text-sm text-text-muted">{school}</p>
          )}
        </div>
      </div>
      <div className="section-container py-8">{children}</div>
    </div>
  );
}
