import { UnknownState } from "@/components/content/states";

export function EntityFacts({ children }: { children: React.ReactNode }) {
  return <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</dl>;
}

export function readableValue(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    const values = value.filter(
      (item): item is string | number => typeof item === "string" || typeof item === "number",
    );
    return values.length ? values.join(", ") : null;
  }
  if (value && typeof value === "object") {
    const localized = value as { en?: unknown; "zh-CN"?: unknown };
    if (typeof localized.en === "string") return localized.en;
    if (typeof localized["zh-CN"] === "string") return localized["zh-CN"];

    const structured = value as Record<string, unknown>;
    const parts = ["country", "region", "city", "value"]
      .map((key) => structured[key])
      .filter(
        (part): part is string | number => typeof part === "string" || typeof part === "number",
      );
    if (parts.length) return parts.join(" · ");
  }
  return null;
}

export function EntityFact({ label, value }: { label: string; value: unknown }) {
  const text = readableValue(value);
  return (
    <div className="rounded-lg border bg-card p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{text ?? <UnknownState />}</dd>
    </div>
  );
}
