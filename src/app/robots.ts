import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://jay-capstone.vercel.app"
  ).replace(/\/$/, "");
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/api/",
        "/account",
        "/bookings",
        "/checkout",
        "/confirmation",
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
