import Link from "next/link";
import { displayName } from "@/lib/data/resolvers";
import type { NewsFilterOptions } from "@/lib/data/types";
import { Button } from "@/components/ui/button";

export function NewsFilters({
  options,
  year,
  entityId,
}: {
  options: NewsFilterOptions;
  year?: number;
  entityId?: string;
}) {
  return (
    <form
      key={`${year ?? ""}-${entityId ?? ""}`}
      action="/news"
      method="get"
      className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-end"
    >
      <label className="flex flex-1 flex-col gap-2 text-sm font-medium" htmlFor="news-year">
        Year
        <select
          id="news-year"
          name="year"
          defaultValue={year ? String(year) : ""}
          className="h-10 rounded-md border border-input bg-background px-3 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All years</option>
          {options.years.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-1 flex-col gap-2 text-sm font-medium" htmlFor="news-entity">
        Related entity
        <select
          id="news-entity"
          name="entity"
          defaultValue={entityId ?? ""}
          className="h-10 rounded-md border border-input bg-background px-3 font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All entities</option>
          {options.entities.map((entity) => (
            <option key={entity.id} value={entity.id}>
              {displayName(entity.names)}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit">Apply filters</Button>
      {year || entityId ? (
        <Link
          className="flex h-10 items-center text-sm font-medium text-primary hover:underline"
          href="/news"
        >
          Clear filters
        </Link>
      ) : null}
    </form>
  );
}
