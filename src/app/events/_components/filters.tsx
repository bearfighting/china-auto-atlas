import Link from "next/link";
import { Button } from "@/components/ui/button";
import { displayName } from "@/lib/data/resolvers";
import { formatEventType } from "@/lib/event-utils";
import type { EventFilterOptions } from "@/lib/data/types";

export function EventFilters({
  options,
  year,
  eventType,
  entityId,
  hasFilters: hasFiltersProp,
}: {
  options: EventFilterOptions;
  year?: number;
  eventType?: string;
  entityId?: string;
  hasFilters?: boolean;
}) {
  const hasFilters = hasFiltersProp ?? (year !== undefined || Boolean(eventType || entityId));
  return (
    <form
      key={`${year ?? ""}-${eventType ?? ""}-${entityId ?? ""}`}
      action="/events"
      method="get"
      className="flex flex-col flex-wrap gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-end"
    >
      <label
        className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium"
        htmlFor="event-year"
      >
        Year
        <select
          id="event-year"
          name="year"
          defaultValue={year ?? ""}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All years</option>
          {options.years.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <label
        className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium"
        htmlFor="event-type"
      >
        Event type
        <select
          id="event-type"
          name="type"
          defaultValue={eventType ?? ""}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All event types</option>
          {options.eventTypes.map((option) => (
            <option key={option} value={option}>
              {formatEventType(option)}
            </option>
          ))}
        </select>
      </label>
      <label
        className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium"
        htmlFor="event-entity"
      >
        Related entity
        <select
          id="event-entity"
          name="entity"
          defaultValue={entityId ?? ""}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All entities</option>
          {options.entities.map((entity) => (
            <option key={entity.id} value={entity.id}>
              {displayName(entity.names)}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit">Apply filters</Button>
      {hasFilters ? (
        <Link
          className="flex h-10 items-center whitespace-nowrap text-sm font-medium text-primary hover:underline"
          href="/events"
        >
          Clear filters
        </Link>
      ) : null}
    </form>
  );
}
