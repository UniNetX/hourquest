import Link from "next/link";

const exploreLinks = [
  { href: "/challenges", label: "Challenges" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/stories", label: "Student Stories" },
];

const aboutLinks = [
  { href: "/about", label: "About" },
  { href: "/partnership", label: "Partnership" },
  { href: "/faq", label: "FAQ" },
  { href: "/download", label: "Download App" },
];

const connectLinks = [
  { href: "/partnership", label: "Partner With Us" },
  { href: "/faq", label: "FAQ & Support" },
];

const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="section-container py-12 sm:py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link
              href="/"
              className="text-base font-bold tracking-tight text-primary-dark hover:text-primary"
            >
              TerraServe
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-muted">
              Complete environmental challenges, upload photo proof, and earn
              verified volunteer hours for college applications — completely
              free.
            </p>
          </div>

          <div className="lg:col-span-2">
            <p className="site-footer__heading">Explore</p>
            <ul className="space-y-2">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-text transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="site-footer__heading">About</p>
            <ul className="space-y-2">
              {aboutLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-text transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <p className="site-footer__heading">Connect</p>
            <ul className="space-y-2">
              {connectLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm font-semibold text-text transition-colors hover:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {contactEmail && (
                <li>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="text-sm font-semibold text-text transition-colors hover:text-primary"
                  >
                    {contactEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-rule pt-8 sm:flex-row">
          <p className="text-xs text-text-muted">
            © {new Date().getFullYear()} TerraServe. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link
              href="/signin"
              className="text-xs font-semibold text-text-muted transition-colors hover:text-primary"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-xs font-semibold text-text-muted transition-colors hover:text-primary"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
