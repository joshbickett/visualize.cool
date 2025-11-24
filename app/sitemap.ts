import type { MetadataRoute } from "next";

const baseUrl = "https://visualize.cool";

const routes = [
  "",
  "/visualizations",
  "/visualizations/solar-system",
  "/visualizations/planet-size-comparison",
  // "/visualizations/gpt-architecture",
  "/search",
  "/about",
  "/contribute"
];

export default function sitemap(): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.7
  }));
}
