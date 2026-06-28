import { NextResponse } from "next/server";
import { CANONICAL_SITE_URL } from "@/lib/site-url";

export const dynamic = "force-static";
export const revalidate = 86400;

export function GET() {
  const body = `User-Agent: *
Allow: /
Disallow: /admin
Disallow: /dashboard
Disallow: /partner

Host: ${CANONICAL_SITE_URL}
Sitemap: ${CANONICAL_SITE_URL}/sitemap.xml
`;

  return new NextResponse(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
