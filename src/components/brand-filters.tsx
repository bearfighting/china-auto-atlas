import Link from "next/link";
import { Button } from "@/components/ui/button";

export function BrandFilters({ query }: { query?: string }) {
  return (
    <form
      key={query ?? ""}
      action="/brands"
      method="get"
      className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-end"
    >
      <label
        className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium"
        htmlFor="brand-query"
      >
        Search brands
        <input
          id="brand-query"
          name="q"
          type="search"
          defaultValue={query ?? ""}
          placeholder="Search by name or alias..."
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <Button type="submit">Search</Button>
      {query ? (
        <Link
          className="flex h-10 items-center whitespace-nowrap text-sm font-medium text-primary hover:underline"
          href="/brands"
        >
          Clear search
        </Link>
      ) : null}
    </form>
  );
}
