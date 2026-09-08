import type { MetadataRoute } from "next";
import { loadContentIndex, loadDataIndex } from "@/lib/data/load-index";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://china-auto-atlas.vercel.app";
  const content = loadContentIndex();
  const data = loadDataIndex();
  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/news`, lastModified: new Date() },
    ...content.documents.map((document) => ({
      url: `${base}/news/${document.slug}`,
      lastModified: new Date(document.updated_at ?? document.published_at),
    })),
    ...data.entities
      .filter((entity) => entity.type === "vehicle")
      .map((vehicle) => ({
        url: `${base}/vehicles/${vehicle.slug ?? vehicle.id}`,
        lastModified: new Date(),
      })),
  ];
}
