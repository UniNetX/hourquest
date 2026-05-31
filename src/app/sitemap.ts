import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
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
  ];

  return routes.map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "weekly" : "monthly",
    priority: route === "" ? 1 : 0.8,
  }));
}
