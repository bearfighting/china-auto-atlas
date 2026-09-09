import type { Media } from "@/lib/data/types";

export function publicMediaPath(assetPath: string): string | null {
  const normalized = assetPath.replace(/^\/+/, "");
  if (!normalized.startsWith("assets/") || normalized.split("/").includes("..")) return null;
  return `/${normalized}`;
}

export function publicMediaAlt(media: Pick<Media, "alt">): string | null {
  const alt = media.alt?.en ?? media.alt?.["zh-CN"];
  return alt?.trim() || null;
}
