import type { Metadata } from "next";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://challenges.terraserve.org";

export function createMetadata({
  title,
  description,
  path = "",
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
}): Metadata {
  const url = `${siteUrl}${path}`;

  return {
    title,
    description,
    robots: noIndex ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      url,
      siteName: "TerraServe Challenges",
      images: [{ url: `${siteUrl}/og-image.svg`, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/og-image.svg`],
    },
  };
}

export const SITE_URL = siteUrl;
