import { NextResponse } from "next/server";
import {
  CANONICAL_SITE_URL,
  PUBLIC_SITEMAP_PATHS,
} from "@/lib/site-url";

export const dynamic = "force-static";
export const revalidate = 86400;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function GET() {
  const lastModified = new Date().toISOString();

  const urls = PUBLIC_SITEMAP_PATHS.map((path) => {
    const loc = `${CANONICAL_SITE_URL}${path}`;
    const changeFreq = path === "" ? "weekly" : "monthly";
    const priority = path === "" ? "1.0" : "0.8";

    return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${changeFreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
