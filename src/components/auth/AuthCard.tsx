export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded border border-border bg-surface shadow-card">
        <div className="h-1 bg-primary-mid" aria-hidden />
        <div className="p-8">
          <h1 className="text-center font-display text-xl font-semibold text-primary-dark">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-center text-sm text-text-muted">{subtitle}</p>
          )}
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
