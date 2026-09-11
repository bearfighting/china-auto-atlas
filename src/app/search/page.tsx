import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/states";
import { PageContainer } from "@/components/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { SearchPagination } from "@/components/search-pagination";
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

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string | string[];
    type?: string | string[];
    page?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const query = (queryValue(params.q) ?? "").slice(0, 200);
  const type = parseType(queryValue(params.type));
  const page = Number(queryValue(params.page) ?? 1);
  const searchPage = searchRepository.searchPage(query, { page, type });
  const hasQuery = query.trim().length > 0;
  const isOutOfRange = searchPage.total > 0 && searchPage.items.length === 0;
  const firstResult = searchPage.items.length ? (searchPage.page - 1) * searchPage.pageSize + 1 : 0;
  const lastResult = searchPage.items.length ? firstResult + searchPage.items.length - 1 : 0;

  return (
    <PageContainer>
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Search" }]} />
        <header className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Search</h1>
          <p className="text-muted-foreground">
            Find vehicles, brands, manufacturers, technologies, and news.
          </p>
          <form action="/search" method="get" className="flex max-w-2xl flex-col gap-2 sm:flex-row">
            <label htmlFor="search-page-query" className="sr-only">
              Search the atlas
            </label>
            <input
              id="search-page-query"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search by name, alias, slug, or ID"
              className="h-10 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
            {type !== "all" ? <input type="hidden" name="type" value={type} /> : null}
            <button
              type="submit"
              className="h-10 shrink-0 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
          {hasQuery && type !== "all" ? (
            <Link
              href={`/search?${new URLSearchParams({ q: query }).toString()}`}
              className="rounded-md px-3 py-2 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Clear type
            </Link>
          ) : null}
          {hasQuery ? (
            <Link
              href="/search"
              className="rounded-md px-3 py-2 text-sm font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Clear search
            </Link>
          ) : null}
        </nav>
        {hasQuery && searchPage.items.length ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {firstResult}–{lastResult} of {searchPage.total} results
          </p>
        ) : null}
        {hasQuery && searchPage.items.length ? (
          <section aria-labelledby="search-results-heading" className="space-y-4">
            <h2 id="search-results-heading" className="text-2xl font-semibold">
              Results for “{query}”
            </h2>
            <div className="grid gap-3">
              {searchPage.items.map((result) => (
                <Card
                  key={`${result.kind}-${result.id}`}
                  className="min-w-0"
                  data-testid="search-result"
                >
                  <CardContent className="p-5">
                    <Link
                      className="break-words font-medium leading-tight text-primary hover:underline"
                      href={result.href}
                    >
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
        ) : hasQuery ? (
          <EmptyState
            title={isOutOfRange ? "No results on this page" : "No results found"}
            description={
              isOutOfRange
                ? "Try another page or return to the search results."
                : `No atlas records matched “${query}”.`
            }
          />
        ) : (
          <EmptyState
            title="Search the atlas"
            description="Enter a name, alias, slug, or ID to find an atlas record."
          />
        )}
        {isOutOfRange ? (
          <div className="flex justify-center">
            <Link
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              href={`/search?${new URLSearchParams({ q: query, ...(type !== "all" ? { type } : {}) }).toString()}`}
            >
              Return to search results
            </Link>
          </div>
        ) : null}
        {hasQuery && searchPage.items.length ? (
          <SearchPagination
            page={searchPage.page}
            totalPages={searchPage.totalPages}
            query={query}
            type={type}
          />
        ) : null}
      </div>
    </PageContainer>
  );
}
