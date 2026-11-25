import type { MetadataRoute } from "next";
import { SITE_URL } from "./siteUrl";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/catalog", priority: 0.9 },
    { path: "/builder", priority: 0.9 },
    { path: "/builds", priority: 0.9 },
    { path: "/process", priority: 0.6 },
    { path: "/order", priority: 0.7 },
  ];
  return pages.map(({ path, priority }) => ({ url: `${SITE_URL}${path}`, changeFrequency: "weekly", priority }));
}
