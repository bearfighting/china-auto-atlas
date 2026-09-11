import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EventCard } from "./card";
import type { Entity, Event } from "@/lib/data/types";

const event: Event = {
  id: "event-example",
  type: "event",
  date: "2024-01-02",
  event_type: "vehicle_reveal",
  summary: "Example event",
  evidence_status: "confirmed",
};

const entities = [
  {
    id: "vehicle-example",
    type: "vehicle",
    names: { en: "Example Vehicle" },
    slug: "example-vehicle",
  },
  {
    id: "brand-example",
    type: "brand",
    names: { en: "Example Brand" },
    slug: "example-brand",
  },
  {
    id: "manufacturer-example",
    type: "manufacturer",
    names: { en: "Example Manufacturer" },
    slug: "example-manufacturer",
  },
] as Entity[];

describe("EventCard", () => {
  it("renders readable event context and limits related entities", () => {
    const html = renderToStaticMarkup(<EventCard event={event} relatedEntities={entities} />);
    expect(html).toContain("Vehicle reveal");
    expect(html).toContain("2024-01-02");
    expect(html).toContain("Example Vehicle");
    expect(html).toContain("Example Brand");
    expect(html).toContain("+1 more entities");
    expect(html).not.toContain("Example Manufacturer");
    expect(html).toContain('href="/vehicles/example-vehicle"');
    expect(html).toContain('href="/events/event-example"');
  });

  it("renders safe fallbacks for missing context", () => {
    const html = renderToStaticMarkup(
      <EventCard event={{ id: "event-unknown", type: "event" }} relatedEntities={[]} />,
    );
    expect(html).toContain("Date unknown");
    expect(html).toContain("Unknown");
    expect(html).toContain("View event profile");
  });
});
