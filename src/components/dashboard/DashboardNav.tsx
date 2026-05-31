"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { IconLogout } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/dashboard", label: "Dashboard", exact: true },
  { href: "/dashboard/submit", label: "Submit" },
  { href: "/dashboard/submissions", label: "Submissions" },
  { href: "/dashboard/certificates", label: "Certificates" },
  { href: "/dashboard/profile", label: "Profile" },
];

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="site-nav sticky top-0 z-50 shadow-nav">
      <div className="section-container flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="shrink-0 text-sm font-bold tracking-tight text-primary-dark hover:text-primary"
        >
          HourQuest
        </Link>

        <nav
          className="hidden items-center gap-0.5 md:flex"
          aria-label="Dashboard"
        >
          {navLinks.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary-light text-primary-dark"
                    : "text-text-muted hover:bg-primary-light/50 hover:text-primary-dark",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-1.5 rounded px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-primary-light/50 hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <IconLogout size={18} />
          <span className="hidden sm:inline">Sign Out</span>
        </button>
      </div>

      <div className="border-t border-border bg-surface md:hidden">
        <div className="section-container flex gap-1 overflow-x-auto py-2">
          {navLinks.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "bg-primary text-white"
                    : "bg-primary-light text-primary-dark",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
