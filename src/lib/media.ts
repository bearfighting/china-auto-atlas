export function publicMediaPath(assetPath: string): string | null {
  const normalized = assetPath.replace(/^\/+/, "");
  if (!normalized.startsWith("assets/") || normalized.split("/").includes("..")) return null;
  return `/${normalized}`;
}
