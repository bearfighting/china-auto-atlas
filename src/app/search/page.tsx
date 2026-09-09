import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/states";
import { PageContainer } from "@/components/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { searchRepository } from "@/lib/data/repositories";
import type { SearchType } from "@/lib/data/types";

export const metadata: Metadata = {
  title: "Search",
  description:
    "Search vehicles, brands, manufacturers, technologies, and news in China Auto Atlas.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

const filters: { value: SearchType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "vehicle", label: "Vehicles" },
  { value: "brand", label: "Brands" },
  { value: "manufacturer", label: "Manufacturers" },
  { value: "technology", label: "Technologies" },
  { value: "news", label: "News" },
];

function parseType(value: string | undefined): SearchType {
  return filters.some((filter) => filter.value === value) ? (value as SearchType) : "all";
}

function typeLabel(type: string) {
  return filters.find((filter) => filter.value === type)?.label ?? type;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>;
}) {
  const params = await searchParams;
  const query = (params.q ?? "").slice(0, 200);
  const type = parseType(params.type);
  const results = searchRepository.search(query, { type, limit: 20 });

  return (
    <PageContainer>
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Search</h1>
          <p className="text-muted-foreground">
            Find vehicles, brands, manufacturers, technologies, and news.
          </p>
          <form action="/search" method="get" className="flex max-w-2xl gap-2">
            <label htmlFor="search-page-query" className="sr-only">
              Search the atlas
            </label>
            <input
              id="search-page-query"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search by name, alias, slug, or ID"
              className="min-w-0 flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            {type !== "all" ? <input type="hidden" name="type" value={type} /> : null}
            <button
              type="submit"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Search
            </button>
          </form>
        </header>
        <nav aria-label="Search filters" className="flex flex-wrap gap-2">
          {filters.map((filter) => {
            const href =
              filter.value === "all"
                ? `/search${query ? `?q=${encodeURIComponent(query)}` : ""}`
                : `/search?${new URLSearchParams({ ...(query ? { q: query } : {}), type: filter.value }).toString()}`;
            return (
              <Link
                key={filter.value}
                href={href}
                className={`rounded-md border px-3 py-2 text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${type === filter.value ? "bg-muted font-medium" : ""}`}
                aria-current={type === filter.value ? "page" : undefined}
                data-testid={`search-filter-${filter.value}`}
              >
                {filter.label}
              </Link>
            );
          })}
        </nav>
        {query && results.length ? (
          <section aria-labelledby="search-results-heading" className="space-y-4">
            <h2 id="search-results-heading" className="text-2xl font-semibold">
              Results for “{query}”
            </h2>
            <div className="grid gap-3">
              {results.map((result) => (
                <Card key={`${result.kind}-${result.id}`} data-testid="search-result">
                  <CardContent className="p-5">
                    <Link className="font-medium text-primary hover:underline" href={result.href}>
                      {result.display_name}
                    </Link>
                    {result.display_name_zh ? (
                      <p className="mt-1 text-sm text-muted-foreground">{result.display_name_zh}</p>
                    ) : null}
                    <p className="mt-2 text-xs text-muted-foreground">
                      {typeLabel(result.type)} · {result.kind === "entity" ? "Entity" : "News"}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        ) : query ? (
          <EmptyState
            title="No results found"
            description={`No atlas records matched “${query}”.`}
          />
        ) : (
          <EmptyState
            title="Search the atlas"
            description="Enter a name, alias, slug, or ID to find an atlas record."
          />
        )}
      </div>
    </PageContainer>
  );
}
