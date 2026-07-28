import type { MetadataRoute } from "next";

const productionUrl = "https://www.netlabcoach.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: productionUrl,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${productionUrl}/learn`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];
}
