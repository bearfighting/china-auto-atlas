import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { EmptyState } from "@/components/content/states";
import { NewsFilters } from "@/app/news/_components/filters";
import { NewsPagination } from "@/app/news/_components/pagination";
import { PageContainer } from "@/components/layout/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { newsRepository } from "@/lib/data/repositories";

export const metadata: Metadata = {
  title: "News",
  description:
    "Evidence-led reporting connected to the entities, events, and sources in the atlas.",
  alternates: { canonical: "/news" },
  openGraph: {
    title: "News",
    description:
      "Evidence-led reporting connected to the entities, events, and sources in the atlas.",
    url: "/news",
  },
};

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function NewsIndexPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[];
    year?: string | string[];
    entity?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const page = Number(queryValue(params.page) ?? 1);
  const yearValue = queryValue(params.year);
  const year = yearValue ? Number(yearValue) : undefined;
  const entityId = queryValue(params.entity)?.trim() || undefined;
  const newsPage = newsRepository.listPage({ page, year, entityId });
  const filterOptions = newsRepository.getFilterOptions();
  const hasFilters = year !== undefined || Boolean(entityId);
  const firstResult = newsPage.items.length ? (newsPage.page - 1) * newsPage.pageSize + 1 : 0;
  const lastResult = newsPage.items.length ? firstResult + newsPage.items.length - 1 : 0;
  return (
    <PageContainer>
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "News" }]} />
        <header className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Editorial reporting</p>
          <h1 className="text-4xl font-bold tracking-tight">News</h1>
          <p className="max-w-2xl text-muted-foreground">
            Reporting connected to the entities, events and sources in the atlas.
          </p>
        </header>
        <NewsFilters options={filterOptions} year={year} entityId={entityId} />
        {newsPage.total > 0 && newsPage.items.length > 0 ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {firstResult}–{lastResult} of {newsPage.total} news articles
          </p>
        ) : null}
        {newsPage.items.length ? (
          <div className="grid gap-4">
            {newsPage.items.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{item.evidence_status ?? "unknown"}</Badge>
                    <time className="text-xs text-muted-foreground" dateTime={item.published_at}>
                      {item.published_at}
                    </time>
                  </div>
                  <CardTitle>
                    <Link className="hover:underline" href={`/news/${item.slug}`}>
                      {item.title}
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <EmptyState
              title={hasFilters ? "No news matches these filters" : "No news on this page"}
              description={
                hasFilters
                  ? "Try another year or related entity, or clear the filters."
                  : "Try another page or return to the first page."
              }
            />
            <div className="flex justify-center">
              <Link
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                href="/news"
              >
                {hasFilters ? "Clear filters" : "Return to all News"}
              </Link>
            </div>
          </div>
        )}
        <NewsPagination
          page={newsPage.page}
          totalPages={newsPage.totalPages}
          year={year}
          entityId={entityId}
        />
      </div>
    </PageContainer>
  );
}
