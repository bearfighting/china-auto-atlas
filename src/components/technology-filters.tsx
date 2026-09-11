import Link from "next/link";
import { Button } from "@/components/ui/button";
import { displayName } from "@/lib/data/resolvers";
import type { TechnologyFilterOptions } from "@/lib/data/types";

export function TechnologyFilters({
  options,
  query,
  domainId,
  categoryId,
  familyId,
}: {
  options: TechnologyFilterOptions;
  query?: string;
  domainId?: string;
  categoryId?: string;
  familyId?: string;
}) {
  const hasFilters = Boolean(query || domainId || categoryId || familyId);
  return (
    <form
      key={`${query ?? ""}-${domainId ?? ""}-${categoryId ?? ""}-${familyId ?? ""}`}
      action="/technologies"
      method="get"
      className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-end sm:flex-wrap"
    >
      <label
        className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium"
        htmlFor="technology-query"
      >
        Search technologies
        <input
          id="technology-query"
          name="q"
          type="search"
          defaultValue={query ?? ""}
          placeholder="Search by name or alias..."
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>
      <label
        className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium"
        htmlFor="technology-domain"
      >
        Domain
        <select
          id="technology-domain"
          name="domain"
          defaultValue={domainId ?? ""}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All domains</option>
          {options.domains.map((domain) => (
            <option key={domain.id} value={domain.id}>
              {displayName(domain.names)}
            </option>
          ))}
        </select>
      </label>
      <label
        className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium"
        htmlFor="technology-category"
      >
        Category
        <select
          id="technology-category"
          name="category"
          defaultValue={categoryId ?? ""}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All categories</option>
          {options.categories.map((category) => (
            <option key={category.id} value={category.id}>
              {displayName(category.names)}
            </option>
          ))}
        </select>
      </label>
      <label
        className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium"
        htmlFor="technology-family"
      >
        Family
        <select
          id="technology-family"
          name="family"
          defaultValue={familyId ?? ""}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All families</option>
          {options.families.map((family) => (
            <option key={family.id} value={family.id}>
              {displayName(family.names)}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit">Apply filters</Button>
      {hasFilters ? (
        <Link
          className="flex h-10 items-center whitespace-nowrap text-sm font-medium text-primary hover:underline"
          href="/technologies"
        >
          Clear filters
        </Link>
      ) : null}
    </form>
  );
}
