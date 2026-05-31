"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconMenu2, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";
import { dashboardSectionHref } from "@/lib/dashboard-nav";
import { getDisplayInitial } from "@/lib/profile-display";
import { cn } from "@/lib/utils";

const submitSignInNext = encodeURIComponent(dashboardSectionHref("submit"));

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/challenges", label: "Challenges" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/terraserve-app", label: "TerraServe iOS" },
];

const aboutLinks = [
  { href: "/about", label: "About" },
  { href: "/partnership", label: "Partnership" },
  { href: "/faq", label: "FAQ" },
];

function isAboutActive(pathname: string) {
  return aboutLinks.some((link) => pathname === link.href);
}

export function NavBar({
  user,
}: {
  user?: { name: string; avatarUrl?: string | null } | null;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [mobileAboutOpen, setMobileAboutOpen] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);

  const onDashboard = pathname.startsWith("/dashboard");

  useEffect(() => {
    setOpen(false);
    setMobileAboutOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!aboutOpen) return;
    function onPointerDown(event: MouseEvent) {
      if (!aboutRef.current?.contains(event.target as Node)) {
        setAboutOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [aboutOpen]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setAboutOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const linkClass = (active: boolean) =>
    cn(
      "rounded px-3 py-2 text-sm font-medium transition-colors",
      active
        ? "bg-primary-light text-primary-dark"
        : "text-text-muted hover:bg-primary-light/50 hover:text-primary-dark",
    );

  if (onDashboard) {
    return null;
  }

  const loggedInLinks = user
    ? [
        { href: "/challenges", label: "Challenges" },
        { href: "/leaderboard", label: "Leaderboard" },
        { href: dashboardSectionHref("overview"), label: "My dashboard" },
      ]
    : null;

  const submitHref = user
    ? dashboardSectionHref("submit")
    : `/signin?next=${submitSignInNext}`;

  return (
    <header
      data-site-nav
      className="site-nav sticky top-0 z-50 shadow-nav pt-[env(safe-area-inset-top,0px)]"
    >
      <div className="section-container flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="shrink-0 text-base font-bold tracking-tight text-primary-dark hover:text-primary"
        >
          HourQuest
        </Link>

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {(loggedInLinks ?? publicLinks).map((link) => {
            const active =
              link.href.startsWith("/dashboard")
                ? pathname.startsWith("/dashboard")
                : pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className={linkClass(active)}>
                {link.label}
              </Link>
            );
          })}
          {!user && (
            <div ref={aboutRef} className="relative">
              <button
                type="button"
                className={cn(
                  linkClass(isAboutActive(pathname)),
                  "inline-flex items-center gap-1",
                )}
                aria-expanded={aboutOpen}
                aria-haspopup="true"
                onClick={() => setAboutOpen((prev) => !prev)}
              >
                About
                <IconChevronDown
                  size={16}
                  stroke={2}
                  className={cn(
                    "transition-transform",
                    aboutOpen && "rotate-180",
                  )}
                />
              </button>
              {aboutOpen && (
                <div
                  className="absolute left-0 top-full z-50 mt-1 min-w-[11rem] rounded-md border border-border bg-page py-1 shadow-lg"
                  role="menu"
                >
                  {aboutLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      role="menuitem"
                      className={cn(
                        "block px-4 py-2 text-sm font-medium transition-colors",
                        pathname === link.href
                          ? "bg-primary-light text-primary-dark"
                          : "text-text-muted hover:bg-primary-light/50 hover:text-primary-dark",
                      )}
                      onClick={() => setAboutOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Button href={submitHref} variant="navCta" size="sm">
            Submit
          </Button>
          {user ? (
            <Link
              href={dashboardSectionHref("profile")}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-muted transition-colors hover:bg-primary-light/50 hover:text-primary-dark"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary-dark">
                {getDisplayInitial(user.name)}
              </span>
              <span className="max-w-[8rem] truncate">{user.name.split(" ")[0]}</span>
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
          <div className="absolute left-0 right-0 top-full z-50 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain border-b border-border bg-page/95 px-4 py-4 shadow-lg backdrop-blur-md lg:hidden">
            <nav className="flex flex-col gap-0.5" aria-label="Mobile">
              {(loggedInLinks ?? publicLinks).map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={linkClass(active)}
                  >
                    {link.label}
                  </Link>
                );
              })}
              {!user && (
                <>
                  <button
                    type="button"
                    className={cn(
                      linkClass(isAboutActive(pathname)),
                      "flex w-full items-center justify-between text-left",
                    )}
                    aria-expanded={mobileAboutOpen}
                    onClick={() => setMobileAboutOpen((prev) => !prev)}
                  >
                    About
                    <IconChevronDown
                      size={16}
                      stroke={2}
                      className={cn(
                        "transition-transform",
                        mobileAboutOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {mobileAboutOpen && (
                    <div className="ml-3 flex flex-col gap-0.5 border-l border-border pl-3">
                      {aboutLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={linkClass(pathname === link.href)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
              <div className="mt-4 space-y-2 border-t border-border pt-4">
                <Button
                  href={submitHref}
                  variant="navCta"
                  size="md"
                  className="w-full"
                >
                  Submit
                </Button>
                {user ? (
                  <Link
                    href={dashboardSectionHref("profile")}
                    onClick={() => setOpen(false)}
                    className="block rounded py-2.5 text-center text-sm font-medium text-primary-dark hover:bg-primary-light/50"
                  >
                    Profile settings
                  </Link>
                ) : (
                  <Link
                    href="/signin"
                    onClick={() => setOpen(false)}
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
