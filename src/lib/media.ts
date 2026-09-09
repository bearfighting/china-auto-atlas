import type { Media } from "@/lib/data/types";

export function publicMediaPath(assetPath: string): string | null {
  const normalized = assetPath.replace(/^\/+/, "");
  let decoded: string;
  try {
    decoded = decodeURIComponent(normalized);
  } catch {
    return null;
  }
  if (
    !decoded.startsWith("assets/") ||
    decoded.includes("\\") ||
    decoded.includes("\0") ||
    decoded.split("/").includes("..") ||
    /%2f|%5c|%2e/i.test(decoded)
  ) {
    return null;
  }
  return `/${normalized}`;
}

export function publicMediaAlt(media: Pick<Media, "alt">): string | null {
  const alt = [media.alt?.en, media.alt?.["zh-CN"]].find((value): value is string =>
    Boolean(value?.trim()),
  );
  return alt?.trim() || null;
}
