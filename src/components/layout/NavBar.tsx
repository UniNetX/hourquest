"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/challenges", label: "Challenges" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/about", label: "About" },
  { href: "/partnership", label: "Partnership" },
  { href: "/faq", label: "FAQ" },
];

export function NavBar({
  user,
}: {
  user?: { name: string; avatarUrl?: string | null } | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header
      data-site-nav
      className="site-nav sticky top-0 z-50 shadow-nav"
    >
      <div className="section-container flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="shrink-0 text-base font-bold tracking-tight text-primary-dark hover:text-primary"
        >
          TerraServe
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {links.map((link) => {
            const active = pathname === link.href;
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

        <div className="hidden items-center gap-3 lg:flex">
          <Button href="/challenges" variant="primary" size="sm">
            Start a Challenge
          </Button>
          {user ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 rounded px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-primary-light/50 hover:text-primary-dark"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary-dark">
                {user.name.charAt(0).toUpperCase()}
              </span>
              {user.name.split(" ")[0]}
            </Link>
          ) : (
            <Link
              href="/signin"
              className="rounded px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-primary-light/50 hover:text-primary-dark"
            >
              Sign In
            </Link>
          )}
        </div>

        <button
          type="button"
          className="rounded border border-border bg-surface p-2 text-text transition-colors hover:bg-primary-light/40 lg:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <IconX size={22} stroke={1.75} /> : <IconMenu2 size={22} stroke={1.75} />}
        </button>
      </div>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 top-16 z-40 bg-black/20 lg:hidden"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-50 border-b border-border bg-page/95 px-4 py-4 shadow-lg backdrop-blur-md lg:hidden">
            <nav className="flex flex-col gap-0.5" aria-label="Mobile">
              {links.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "rounded px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary-light text-primary-dark"
                        : "text-text-muted hover:bg-primary-light/50",
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
                <Button href="/challenges" variant="primary" className="w-full">
                  Start a Challenge
                </Button>
                {user ? (
                  <Button href="/dashboard" variant="secondary" className="w-full">
                    Dashboard
                  </Button>
                ) : (
                  <Link
                    href="/signin"
                    className="block rounded py-2.5 text-center text-sm font-medium text-primary-dark hover:bg-primary-light/50"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  );
}
