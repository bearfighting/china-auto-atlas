import type { Author, ContentIndex, DataIndex, Entity, LocalizedName, Media, Source, Topic } from "./types";

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

export function sourcesByIds(index: DataIndex, ids: string[] | undefined): Source[] {
  const wanted = new Set(ids ?? []);
  return index.sources.filter((source) => wanted.has(source.id));
}

export function mediaByIds(index: DataIndex, ids: string[] | undefined): Media[] {
  const wanted = new Set(ids ?? []);
  return index.media.filter((media) => wanted.has(media.id));
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
