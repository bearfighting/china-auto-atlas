import type { Metadata } from "next";
import Link from "next/link";
import { AtlasEntityCard } from "@/components/atlas-entity-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { BrandFilters } from "@/components/brand-filters";
import { BrandPagination } from "@/components/brand-pagination";
import { EmptyState } from "@/components/states";
import { PageContainer } from "@/components/page-container";
import { brandRepository } from "@/lib/data/repositories";
import { displayName, slugFor } from "@/lib/data/resolvers";

export const metadata: Metadata = {
  title: "Brands",
  description: "Explore automotive brands documented by China Auto Atlas.",
  alternates: { canonical: "/brands" },
  openGraph: {
    title: "Brands",
    description: "Explore automotive brands documented by China Auto Atlas.",
    url: "/brands",
  },
};

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BrandsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[]; q?: string | string[] }>;
}) {
  const params = await searchParams;
  const page = Number(queryValue(params.page) ?? 1);
  const query = queryValue(params.q)?.trim() || undefined;
  const brandPage = brandRepository.listPage({ page, query });
  const hasQuery = Boolean(query);
  const hasMatchingBrands = brandPage.total > 0;
  const firstResult = brandPage.items.length ? (brandPage.page - 1) * brandPage.pageSize + 1 : 0;
  const lastResult = brandPage.items.length ? firstResult + brandPage.items.length - 1 : 0;
  return (
    <PageContainer>
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Brands" }]} />
        <header className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Atlas entities</p>
          <h1 className="text-4xl font-bold tracking-tight">Brands</h1>
          <p className="max-w-2xl text-muted-foreground">
            Explore automotive brands and their connected vehicles, events, news, and sources.
          </p>
        </header>
        <BrandFilters query={query} />
        {brandPage.total > 0 && brandPage.items.length > 0 ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {firstResult}–{lastResult} of {brandPage.total} brands
          </p>
        ) : null}
        {brandPage.items.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brandPage.items.map((brand) => (
              <AtlasEntityCard
                key={brand.id}
                href={`/brands/${slugFor(brand)}`}
                title={displayName(brand.names)}
                titleZh={brand.names?.["zh-CN"]}
                eyebrow="Brand"
                status={brand.status}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <EmptyState
              title={
                hasQuery && !hasMatchingBrands
                  ? "No brands match this search"
                  : "No brands on this page"
              }
              description={
                hasQuery && !hasMatchingBrands
                  ? "Try a different name or alias, or clear the search."
                  : "Try another page or return to the first page."
              }
            />
            <div className="flex justify-center">
              <Link
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                href="/brands"
              >
                {hasQuery ? "Clear search" : "Return to all Brands"}
              </Link>
            </div>
          </div>
        )}
        <BrandPagination page={brandPage.page} totalPages={brandPage.totalPages} query={query} />
      </div>
    </PageContainer>
  );
}
