import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { displayName, slugFor } from "@/lib/data/resolvers";
import { formatEventType } from "@/lib/event-utils";
import type { Entity, Event } from "@/lib/data/types";

function eventTitle(event: Event) {
  return event.summary ?? event.event_type ?? event.id;
}

function entityHref(entity: Entity) {
  if (entity.type === "vehicle") return `/vehicles/${slugFor(entity)}`;
  if (entity.type === "brand") return `/brands/${slugFor(entity)}`;
  if (entity.type === "manufacturer") return `/manufacturers/${slugFor(entity)}`;
  if (entity.type === "technology") return `/technologies/${slugFor(entity)}`;
  return null;
}

export function EventCard({ event, relatedEntities }: { event: Event; relatedEntities: Entity[] }) {
  const visibleEntities = relatedEntities.slice(0, 2);
  const remainingEntityCount = Math.max(relatedEntities.length - visibleEntities.length, 0);

  return (
    <Card
      className="h-full min-w-0 transition-colors hover:border-foreground/30"
      data-testid="event-card"
    >
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Event</Badge>
          {event.evidence_status ? <Badge variant="muted">{event.evidence_status}</Badge> : null}
        </div>
        <CardTitle className="leading-tight">
          <Link
            className="break-words focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href={`/events/${event.id}`}
          >
            {eventTitle(event)}
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <time dateTime={event.date ?? undefined}>{event.date ?? "Date unknown"}</time>
          <span aria-hidden="true">·</span>
          <span>{formatEventType(event.event_type)}</span>
        </div>
        {visibleEntities.length ? (
          <div className="flex min-w-0 flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span>Related:</span>
            {visibleEntities.map((entity, index) => {
              const href = entityHref(entity);
              const name = displayName(entity.names);
              return (
                <span key={entity.id} className="min-w-0 break-words">
                  {index > 0 ? <span aria-hidden="true"> · </span> : null}
                  {href ? (
                    <Link className="text-primary underline-offset-4 hover:underline" href={href}>
                      {name}
                    </Link>
                  ) : (
                    name
                  )}
                </span>
              );
            })}
            {remainingEntityCount ? <span>+{remainingEntityCount} more entities</span> : null}
          </div>
        ) : null}
        <Link
          className="inline-flex text-sm font-medium text-primary underline-offset-4 hover:underline"
          href={`/events/${event.id}`}
        >
          View event profile
        </Link>
      </CardContent>
    </Card>
  );
}
