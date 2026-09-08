import { loadContentIndex, loadDataIndex } from "./load-index";
import { entityById, slugFor, sourcesByIds } from "./resolvers";
import type { Event, NewsDocument, Source, Vehicle } from "./types";

export const newsRepository = {
  list(): NewsDocument[] {
    return [...loadContentIndex().documents].sort((a, b) => b.published_at.localeCompare(a.published_at));
  },
  getById(id: string): NewsDocument | null {
    return loadContentIndex().documents.find((document) => document.id === id) ?? null;
  },
  getBySlug(slug: string): NewsDocument | null {
    return loadContentIndex().documents.find((document) => document.slug === slug) ?? null;
  },
};

export const vehicleRepository = {
  list(): Vehicle[] {
    return loadDataIndex().entities.filter((entity): entity is Vehicle => entity.type === "vehicle");
  },
  getById(id: string): Vehicle | null {
    return this.list().find((vehicle) => vehicle.id === id) ?? null;
  },
  getBySlug(slug: string): Vehicle | null {
    return this.list().find((vehicle) => slugFor(vehicle) === slug || vehicle.id === slug) ?? null;
  },
  getRelatedSources(id: string): Source[] {
    const vehicle = this.getById(id);
    return sourcesByIds(loadDataIndex(), vehicle?.source_ids);
  },
  getRelatedEvents(id: string): Event[] {
    const index = loadDataIndex();
    const vehicle = this.getById(id);
    const eventIds = new Set(vehicle?.event_ids ?? []);
    return index.events.filter((event) => eventIds.has(event.id));
  },
  getMarketSpecifications(id: string) {
    return loadDataIndex().market_specifications.filter((specification) => specification.vehicle_id === id);
  },
  getRelatedNews(id: string): NewsDocument[] {
    return newsRepository.list().filter((document) => document.entity_ids?.includes(id));
  },
};

export const sourceRepository = {
  getById(id: string): Source | null {
    return loadDataIndex().sources.find((source) => source.id === id) ?? null;
  },
};

export const eventRepository = {
  getById(id: string): Event | null {
    return loadDataIndex().events.find((event) => event.id === id) ?? null;
  },
};

export function relatedEntities(ids: string[] | undefined) {
  const index = loadDataIndex();
  return (ids ?? []).map((id) => entityById(index, id)).filter((entity): entity is NonNullable<typeof entity> => Boolean(entity));
}
