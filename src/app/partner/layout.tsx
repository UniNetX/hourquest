import Link from "next/link";
import { redirect } from "next/navigation";
import { getPartnerSession } from "@/lib/partner";

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getPartnerSession();
  if (!session) redirect("/signin?next=/partner");

  if (session.profile.user_type !== "partner") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-page">
      <header className="site-header border-b border-white/20 shadow-nav">
        <div className="section-container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm font-medium text-white/80 hover:text-white">
              ← HourQuest
            </Link>
            <span className="text-white/30">|</span>
            <span className="text-base font-medium">Partner Portal</span>
          </div>
          <span className="max-w-[12rem] truncate text-xs text-white/70 sm:max-w-none">
            {session.org.name}
          </span>
        </div>
      </header>
      {children}
    </div>
  );
}
