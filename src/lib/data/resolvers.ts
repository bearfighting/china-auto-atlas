import type {
  Author,
  ContentIndex,
  DataIndex,
  Entity,
  LocalizedName,
  Media,
  Relationship,
  Source,
  Topic,
  Vehicle,
} from "./types";

export function displayName(value: LocalizedName | undefined, locale = "en") {
  if (!value) return "Unknown";
  return value[locale as keyof LocalizedName] ?? value.en ?? value["zh-CN"] ?? Object.values(value)[0] ?? "Unknown";
}

export function slugFor(record: Entity) {
  return record.slug ?? record.id;
}

export function entityById(index: DataIndex, id: string | undefined) {
  return id ? index.entities.find((entity) => entity.id === id) ?? null : null;
}

export function entitiesByType<T extends Entity>(index: DataIndex, type: T["type"]): T[] {
  return index.entities.filter((entity): entity is T => entity.type === type);
}

export function entitiesByIds<T extends Entity>(index: DataIndex, ids: string[] | undefined): T[] {
  const wanted = new Set(ids ?? []);
  return index.entities.filter((entity): entity is T => wanted.has(entity.id));
}

export function vehiclesFromIndex(index: DataIndex): Vehicle[] {
  return entitiesByType<Vehicle>(index, "vehicle");
}

export function vehiclesRelatedTo(index: DataIndex, entityId: string): Vehicle[] {
  return vehiclesFromIndex(index).filter(
    (vehicle) =>
      vehicle.brand_id === entityId ||
      vehicle.platform_id === entityId ||
      vehicle.manufacturer_ids?.includes(entityId) ||
      vehicle.technology_ids?.includes(entityId),
  );
}

export function eventsRelatedTo(index: DataIndex, entityId: string, eventIds: string[] | undefined) {
  const wanted = new Set(eventIds ?? []);
  return index.events.filter((event) => wanted.has(event.id) || event.subject_ids?.includes(entityId));
}

export function sourcesByIds(index: DataIndex, ids: string[] | undefined): Source[] {
  const wanted = new Set(ids ?? []);
  return index.sources.filter((source) => wanted.has(source.id));
}

export function mediaByIds(index: DataIndex, ids: string[] | undefined): Media[] {
  const wanted = new Set(ids ?? []);
  return index.media.filter((media) => wanted.has(media.id));
}

export function relationshipsFor(index: DataIndex, entityId: string): Relationship[] {
  return index.relationships.filter(
    (relationship) => relationship.from_id === entityId || relationship.to_id === entityId,
  );
}

export function approvedMedia(media: Media[]) {
  return media.filter((item) => item.collection_status === "approved" && item.rights_status === "approved");
}

export function authorsByIds(index: ContentIndex, ids: string[] | undefined): Author[] {
  const wanted = new Set(ids ?? []);
  return index.authors.filter((author) => wanted.has(author.id));
}

export function topicsByIds(index: ContentIndex, ids: string[] | undefined): Topic[] {
  const wanted = new Set(ids ?? []);
  return index.topics.filter((topic) => wanted.has(topic.id));
}
