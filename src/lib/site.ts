export const siteUrl = "https://china-auto-atlas.vercel.app";

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl).toString();
}
