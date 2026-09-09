import type { Metadata } from "next";
import { AtlasEntityCard } from "@/components/atlas-entity-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/states";
import { PageContainer } from "@/components/page-container";
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

function eventTitle(event: { summary?: string; event_type?: string; id: string }) {
  return event.summary ?? event.event_type ?? event.id;
}

export default function EventsPage() {
  const events = eventRepository.list();
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
        {events.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <AtlasEntityCard
                key={event.id}
                href={`/events/${event.id}`}
                title={eventTitle(event)}
                eyebrow="Event"
                status={event.evidence_status}
                meta={`${event.date ?? "Date unknown"} · ${event.event_type ?? "event"}`}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No events collected"
            description="Event records will appear here when they are added to the atlas."
          />
        )}
      </div>
    </PageContainer>
  );
}
