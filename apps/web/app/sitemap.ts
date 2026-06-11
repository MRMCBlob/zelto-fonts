import type { MetadataRoute } from "next";
import { getFonts } from "@/lib/fonts-data";
import { siteConfig } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["", "/docs", "/submit"].map((path) => ({
    url: `${siteConfig.url}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.6,
  }));

  const fontRoutes = getFonts().map((font) => ({
    url: `${siteConfig.url}/fonts/${font.name}`,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [...staticRoutes, ...fontRoutes];
}
