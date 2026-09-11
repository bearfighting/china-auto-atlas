import type { Metadata } from "next";
import Link from "next/link";
import { AtlasEntityCard } from "@/components/atlas-entity-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { TechnologyFilters } from "@/components/technology-filters";
import { TechnologyPagination } from "@/components/technology-pagination";
import { EmptyState } from "@/components/states";
import { PageContainer } from "@/components/page-container";
import { technologyRepository } from "@/lib/data/repositories";
import { displayName, slugFor } from "@/lib/data/resolvers";

export const metadata: Metadata = {
  title: "Technologies",
  description: "Explore automotive technologies documented by China Auto Atlas.",
  alternates: { canonical: "/technologies" },
  openGraph: {
    title: "Technologies",
    description: "Explore automotive technologies documented by China Auto Atlas.",
    url: "/technologies",
  },
};

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function TechnologiesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[];
    q?: string | string[];
    domain?: string | string[];
    category?: string | string[];
    family?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const page = Number(queryValue(params.page) ?? 1);
  const query = queryValue(params.q)?.trim() || undefined;
  const domainId = queryValue(params.domain)?.trim() || undefined;
  const categoryId = queryValue(params.category)?.trim() || undefined;
  const familyId = queryValue(params.family)?.trim() || undefined;
  const technologyPage = technologyRepository.listPage({
    page,
    query,
    domainId,
    categoryId,
    familyId,
  });
  const filterOptions = technologyRepository.getFilterOptions();
  const hasFilters = Boolean(query || domainId || categoryId || familyId);
  const firstResult = technologyPage.items.length
    ? (technologyPage.page - 1) * technologyPage.pageSize + 1
    : 0;
  const lastResult = technologyPage.items.length
    ? firstResult + technologyPage.items.length - 1
    : 0;
  return (
    <PageContainer>
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Technologies" }]} />
        <header className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Atlas entities</p>
          <h1 className="text-4xl font-bold tracking-tight">Technologies</h1>
          <p className="max-w-2xl text-muted-foreground">
            Explore technology records connected to vehicles, events, news, and sources.
          </p>
        </header>
        <TechnologyFilters
          options={filterOptions}
          query={query}
          domainId={domainId}
          categoryId={categoryId}
          familyId={familyId}
        />
        {technologyPage.total > 0 && technologyPage.items.length > 0 ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {firstResult}–{lastResult} of {technologyPage.total} technologies
          </p>
        ) : null}
        {technologyPage.items.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {technologyPage.items.map((technology) => (
              <AtlasEntityCard
                key={technology.id}
                href={`/technologies/${slugFor(technology)}`}
                title={displayName(technology.names)}
                titleZh={technology.names?.["zh-CN"]}
                eyebrow="Technology"
                status={technology.status}
                meta={technology.kind ? `Kind: ${technology.kind}` : undefined}
                description={
                  typeof technology.description === "string" ? technology.description : undefined
                }
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <EmptyState
              title={
                hasFilters ? "No technologies match these filters" : "No technologies on this page"
              }
              description={
                hasFilters
                  ? "Try another name or taxonomy filter, or clear the filters."
                  : "Try another page or return to the first page."
              }
            />
            <div className="flex justify-center">
              <Link
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                href="/technologies"
              >
                {hasFilters ? "Clear filters" : "Return to all Technologies"}
              </Link>
            </div>
          </div>
        )}
        <TechnologyPagination
          page={technologyPage.page}
          totalPages={technologyPage.totalPages}
          query={query}
          domainId={domainId}
          categoryId={categoryId}
          familyId={familyId}
        />
      </div>
    </PageContainer>
  );
}
