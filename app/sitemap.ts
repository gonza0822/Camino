import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";

  return [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/semanal`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/objetivos-mensuales`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/objetivos-anuales`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/login`, changeFrequency: "monthly", priority: 0.5 },
  ];
}
