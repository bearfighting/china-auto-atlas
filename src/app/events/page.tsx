import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { EventCard } from "@/app/events/_components/card";
import { EventFilters } from "@/app/events/_components/filters";
import { EventPagination } from "@/app/events/_components/pagination";
import { EmptyState } from "@/components/content/states";
import { PageContainer } from "@/components/layout/page-container";
import { eventRepository } from "@/lib/data/repositories";

export const metadata: Metadata = {
  title: "Events",
  description: "Explore automotive events and milestones documented by China Auto Atlas.",
  alternates: { canonical: "/events" },
  openGraph: {
    title: "Events",
    description: "Explore automotive events and milestones documented by China Auto Atlas.",
    url: "/events",
  },
};

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[];
    year?: string | string[];
    type?: string | string[];
    entity?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const page = Number(queryValue(params.page) ?? 1);
  const yearValue = queryValue(params.year)?.trim() || undefined;
  const year = yearValue && /^\d{4}$/.test(yearValue) ? Number(yearValue) : undefined;
  const invalidYear = Boolean(yearValue && year === undefined);
  const eventType = queryValue(params.type)?.trim() || undefined;
  const entityId = queryValue(params.entity)?.trim() || undefined;
  const eventPage = eventRepository.listPage({
    page,
    year: invalidYear ? Number.NaN : year,
    eventType,
    entityId,
  });
  const filterOptions = eventRepository.getFilterOptions();
  const hasFilters = Boolean(yearValue || eventType || entityId);
  const isOutOfRange = eventPage.total > 0 && eventPage.items.length === 0;
  const firstResult = eventPage.items.length ? (eventPage.page - 1) * eventPage.pageSize + 1 : 0;
  const lastResult = eventPage.items.length ? firstResult + eventPage.items.length - 1 : 0;
  return (
    <PageContainer>
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Events" }]} />
        <header className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Atlas history</p>
          <h1 className="text-4xl font-bold tracking-tight">Events</h1>
          <p className="max-w-2xl text-muted-foreground">
            Explore dated announcements, launches, milestones, and other events in the atlas.
          </p>
        </header>
        <EventFilters
          options={filterOptions}
          year={year}
          eventType={eventType}
          entityId={entityId}
          hasFilters={hasFilters}
        />
        {eventPage.items.length ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {firstResult}–{lastResult} of {eventPage.total} events
          </p>
        ) : null}
        {eventPage.items.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {eventPage.items.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                relatedEntities={eventRepository.getRelatedEntities(event.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <EmptyState
              title={
                isOutOfRange || !hasFilters
                  ? "No events on this page"
                  : "No events match these filters"
              }
              description={
                isOutOfRange || !hasFilters
                  ? "Try another page or return to the first page."
                  : "Try another year, event type, or related entity, or clear the filters."
              }
            />
            <div className="flex justify-center">
              <Link
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                href="/events"
              >
                {isOutOfRange || !hasFilters ? "Return to all Events" : "Clear filters"}
              </Link>
            </div>
          </div>
        )}
        <EventPagination
          page={eventPage.page}
          totalPages={eventPage.totalPages}
          year={year}
          eventType={eventType}
          entityId={entityId}
        />
      </div>
    </PageContainer>
  );
}
