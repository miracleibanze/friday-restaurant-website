import type { MetadataRoute } from "next";
import { getMenuItems } from "@/lib/menu-catalog";
import { siteUrl } from "@/lib/site-config";

export const dynamic = "force-dynamic";

const publicPages = [
  "/",
  "/contact",
  "/faq",
  "/privacy-policy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const menuItems = await getMenuItems();

  return [
    ...publicPages.map((path) => ({ url: new URL(path, siteUrl).toString() })),
    ...menuItems
      .filter((item) => item.slug.trim().length > 0)
      .map((item) => ({
        url: new URL(`/food/${encodeURIComponent(item.slug)}`, siteUrl).toString(),
      })),
  ];
}
