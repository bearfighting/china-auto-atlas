import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EntityFacts, EntityFact } from "@/components/entity-facts";
import { RelatedNewsList } from "@/components/related-news-list";
import { SourceList, EvidenceBadge } from "@/components/source-list";
import { UnknownState } from "@/components/states";
import { Card, CardContent } from "@/components/ui/card";
import { PageContainer } from "@/components/page-container";
import { displayName, slugFor } from "@/lib/data/resolvers";
import { eventRepository } from "@/lib/data/repositories";
import type { Entity } from "@/lib/data/types";

export const dynamicParams = false;

export function generateStaticParams() {
  return eventRepository.list().map((event) => ({ id: event.id }));
}

function eventTitle(event: { summary?: string; event_type?: string; id: string }) {
  return event.summary ?? event.event_type ?? event.id;
}

function entityHref(entity: Entity) {
  if (entity.type === "vehicle") return `/vehicles/${slugFor(entity)}`;
  if (entity.type === "brand") return `/brands/${slugFor(entity)}`;
  if (entity.type === "manufacturer") return `/manufacturers/${slugFor(entity)}`;
  if (entity.type === "technology") return `/technologies/${slugFor(entity)}`;
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = eventRepository.getById(id);
  if (!event) return {};
  const title = eventTitle(event);
  return {
    title,
    description: `${title} event record and supporting sources.`,
    alternates: { canonical: `/events/${event.id}` },
    openGraph: { title, description: `${title} event record and supporting sources.` },
  };
}

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = eventRepository.getById(id);
  if (!event) notFound();
  const title = eventTitle(event);
  const entities = eventRepository.getRelatedEntities(event.id);
  return (
    <PageContainer>
      <div className="space-y-10">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Event" }, { label: title }]} />
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium">Event</span>
            <EvidenceBadge value={event.evidence_status} />
          </div>
          <h1 className="max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>
        </header>
        <EntityFacts>
          <EntityFact label="Event type" value={event.event_type} />
          <EntityFact label="Date" value={event.date ?? "Date unknown"} />
          <EntityFact label="Date precision" value={event.date_precision} />
          <EntityFact label="Record ID" value={event.id} />
        </EntityFacts>
        <section className="space-y-4" aria-labelledby="event-summary">
          <h2 id="event-summary" className="text-2xl font-semibold">
            Summary
          </h2>
          <p className="max-w-3xl leading-7">
            {event.summary ?? <UnknownState label="No event summary collected" />}
          </p>
        </section>
        <section className="space-y-4" aria-labelledby="event-entities">
          <h2 id="event-entities" className="text-2xl font-semibold">
            Related entities
          </h2>
          {entities.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {entities.map((entity) => {
                const href = entityHref(entity);
                return (
                  <Card key={entity.id} data-testid="event-entity">
                    <CardContent className="p-4">
                      {href ? (
                        <Link className="font-medium text-primary hover:underline" href={href}>
                          {displayName(entity.names)}
                        </Link>
                      ) : (
                        <span className="font-medium">{displayName(entity.names)}</span>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">{entity.type}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <UnknownState label="No related entities collected" />
          )}
        </section>
        <section className="space-y-4" aria-labelledby="event-news">
          <h2 id="event-news" className="text-2xl font-semibold">
            Related news
          </h2>
          <RelatedNewsList documents={eventRepository.getRelatedNews(event.id)} />
        </section>
        <section className="space-y-4" aria-labelledby="event-sources">
          <h2 id="event-sources" className="text-2xl font-semibold">
            Sources
          </h2>
          <SourceList sources={eventRepository.getRelatedSources(event.id)} />
        </section>
      </div>
    </PageContainer>
  );
}
