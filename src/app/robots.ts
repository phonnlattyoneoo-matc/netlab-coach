import type { MetadataRoute } from "next";

const productionUrl = "https://www.netlabcoach.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${productionUrl}/sitemap.xml`,
    host: productionUrl,
  };
}
