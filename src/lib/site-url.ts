const PRODUCTION_SITE_URL = "https://challenges.terraserve.org";

/** Canonical public URL for SEO (sitemap, robots, Open Graph). */
export function getCanonicalSiteUrl() {
  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_SITE_URL;
  }

  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || PRODUCTION_SITE_URL
  );
}

export const CANONICAL_SITE_URL = getCanonicalSiteUrl();

export const PUBLIC_SITEMAP_PATHS = [
  "",
  "/challenges",
  "/leaderboard",
  "/about",
  "/meet-the-team",
  "/partnership",
  "/faq",
  "/terraserve-app",
  "/download",
  "/stories",
  "/signin",
  "/signup",
  "/partner/signup",
] as const;
