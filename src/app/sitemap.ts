import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://jay-capstone.vercel.app"
  ).replace(/\/$/, "");
  return [
    "",
    "/select-vehicle",
    "/compare",
    "/rewards",
    "/contact",
    "/terms",
    "/signin",
    "/signup",
  ].map((path) => ({
    url: `${appUrl}${path}`,
    changeFrequency:
      path === "" || path === "/select-vehicle" ? "daily" : "monthly",
    priority: path === "" ? 1 : 0.6,
  }));
}
