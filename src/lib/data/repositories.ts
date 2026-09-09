import { loadContentIndex, loadDataIndex, loadSearchIndex } from "./load-index";
import {
  entitiesByType,
  entitiesByIds,
  entityById,
  eventsRelatedTo,
  mediaByIds,
  approvedMedia,
  sourcesByIds,
  vehiclesFromIndex,
  vehiclesRelatedTo,
} from "./resolvers";
import type {
  Brand,
  Entity,
  Event,
  Manufacturer,
  Media,
  NewsDocument,
  Author,
  Organization,
  Platform,
  SearchResult,
  SearchOptions,
  SearchType,
  Source,
  Topic,
  Technology,
  Vehicle,
  NewsPage,
  NewsPageOptions,
} from "./types";
import { authorsByIds, topicsByIds } from "./resolvers";

function entitySources(entity: { source_ids?: string[] }): Source[] {
  return sourcesByIds(loadDataIndex(), entity.source_ids);
}

export function sortNewsDocuments(documents: NewsDocument[]): NewsDocument[] {
  return [...documents].sort(
    (a, b) => b.published_at.localeCompare(a.published_at) || a.id.localeCompare(b.id),
  );
}

function positiveInteger(value: number | undefined, fallback: number): number {
  return Number.isFinite(value) && value !== undefined && value >= 1
    ? Math.floor(value)
    : fallback;
}

function entityEvents(entity: { id: string; event_ids?: string[] }): Event[] {
  return eventsRelatedTo(loadDataIndex(), entity.id, entity.event_ids);
}

function entityNews(id: string): NewsDocument[] {
  const entity = entityById(loadDataIndex(), id);
  const relatedNewsIds = new Set(entity?.news_ids ?? []);
  return newsRepository
    .list()
    .filter((document) => relatedNewsIds.has(document.id) || document.entity_ids?.includes(id));
}

function findBySlug<T extends { id: string; slug?: string }>(records: T[], slug: string): T | null {
  return records.find((record) => record.slug === slug || record.id === slug) ?? null;
}

function entityOfType<T extends Entity>(id: string | undefined, type: T["type"]): T | null {
  const entity = id ? entityById(loadDataIndex(), id) : null;
  return entity?.type === type ? (entity as T) : null;
}

function relatedEntityRepository<T extends Entity>(
  type: T["type"],
) {
  return {
    list(): T[] {
      return entitiesByType<T>(loadDataIndex(), type);
    },
    getById(id: string): T | null {
      return this.list().find((entity) => entity.id === id) ?? null;
    },
    getBySlug(slug: string): T | null {
      return findBySlug(this.list(), slug);
    },
    getRelatedNews(id: string): NewsDocument[] {
      return entityNews(id);
    },
    getRelatedEvents(id: string): Event[] {
      const entity = this.getById(id);
      return entity ? entityEvents(entity) : [];
    },
    getRelatedSources(id: string): Source[] {
      const entity = this.getById(id);
      return entity ? entitySources(entity) : [];
    },
  };
}

export const newsRepository = {
  list(): NewsDocument[] {
    return sortNewsDocuments(loadContentIndex().documents);
  },
  listPage(options: NewsPageOptions = {}): NewsPage {
    const page = positiveInteger(options.page, 1);
    const pageSize = positiveInteger(options.pageSize, 10);
    const documents = this.list();
    const total = documents.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;

    return {
      items: documents.slice(start, start + pageSize),
      page,
      pageSize,
      total,
      totalPages,
    };
  },
  getById(id: string): NewsDocument | null {
    return loadContentIndex().documents.find((document) => document.id === id) ?? null;
  },
  getBySlug(slug: string): NewsDocument | null {
    return loadContentIndex().documents.find((document) => document.slug === slug) ?? null;
  },
  getRelatedEntities(id: string): Entity[] {
    const document = this.getById(id);
    return document ? relatedEntities(document.entity_ids) : [];
  },
  getRelatedEvents(id: string): Event[] {
    const document = this.getById(id);
    const wanted = new Set(document?.event_ids ?? []);
    return loadDataIndex().events.filter((event) => wanted.has(event.id));
  },
  getRelatedSources(id: string): Source[] {
    const document = this.getById(id);
    return document ? sourcesByIds(loadDataIndex(), document.source_ids) : [];
  },
  getAuthors(id: string): Author[] {
    const document = this.getById(id);
    return document ? authorsByIds(loadContentIndex(), document.author_ids) : [];
  },
  getTopics(id: string): Topic[] {
    const document = this.getById(id);
    return document ? topicsByIds(loadContentIndex(), document.topic_ids) : [];
  },
};

export const vehicleRepository = {
  list(): Vehicle[] {
    return vehiclesFromIndex(loadDataIndex());
  },
  getById(id: string): Vehicle | null {
    return this.list().find((vehicle) => vehicle.id === id) ?? null;
  },
  getBySlug(slug: string): Vehicle | null {
    return findBySlug(this.list(), slug);
  },
  getBrand(id: string): Brand | null {
    return entityOfType(this.getById(id)?.brand_id, "brand");
  },
  getManufacturers(id: string): Manufacturer[] {
    return (this.getById(id)?.manufacturer_ids ?? [])
      .map((manufacturerId) => entityOfType<Manufacturer>(manufacturerId, "manufacturer"))
      .filter((manufacturer): manufacturer is Manufacturer => Boolean(manufacturer));
  },
  getPlatform(id: string): Platform | null {
    return entityOfType(this.getById(id)?.platform_id, "platform");
  },
  getTechnologies(id: string): Technology[] {
    return (this.getById(id)?.technology_ids ?? [])
      .map((technologyId) => entityOfType<Technology>(technologyId, "technology"))
      .filter((technology): technology is Technology => Boolean(technology));
  },
  getRelatedSources(id: string): Source[] {
    const vehicle = this.getById(id);
    return vehicle ? entitySources(vehicle) : [];
  },
  getRelatedEvents(id: string): Event[] {
    const vehicle = this.getById(id);
    return vehicle ? entityEvents(vehicle) : [];
  },
  getMarketSpecifications(id: string) {
    return loadDataIndex().market_specifications.filter((specification) => specification.vehicle_id === id);
  },
  getRelatedNews(id: string): NewsDocument[] {
    return entityNews(id);
  },
  getMedia(id: string): Media[] {
    const vehicle = this.getById(id);
    return vehicle ? mediaByIds(loadDataIndex(), vehicle.media_ids) : [];
  },
  getApprovedMedia(id: string): Media[] {
    return approvedMedia(this.getMedia(id));
  },
};

export const brandRepository = {
  ...relatedEntityRepository<Brand>("brand"),
  getVehicles(id: string): Vehicle[] {
    return vehiclesRelatedTo(loadDataIndex(), id);
  },
};

export const manufacturerRepository = {
  ...relatedEntityRepository<Manufacturer>("manufacturer"),
  getVehicles(id: string): Vehicle[] {
    return vehiclesRelatedTo(loadDataIndex(), id);
  },
  getBrands(id: string): Brand[] {
    const brandIds = new Set(this.getVehicles(id).map((vehicle) => vehicle.brand_id).filter(Boolean));
    return entitiesByType<Brand>(loadDataIndex(), "brand").filter((brand) => brandIds.has(brand.id));
  },
};

export const technologyRepository = {
  ...relatedEntityRepository<Technology>("technology"),
  getVehicles(id: string): Vehicle[] {
    return vehiclesRelatedTo(loadDataIndex(), id);
  },
};

export function platformById(id: string): Platform | null {
  const platform = entityById(loadDataIndex(), id);
  return platform?.type === "platform" ? (platform as Platform) : null;
}

export function organizationById(id: string): Organization | null {
  const organization = entityById(loadDataIndex(), id);
  return organization?.type === "organization" ||
    organization?.type === "supplier" ||
    organization?.type === "manufacturer"
    ? (organization as Organization)
    : null;
}

export const sourceRepository = {
  getById(id: string): Source | null {
    return loadDataIndex().sources.find((source) => source.id === id) ?? null;
  },
};

export const eventRepository = {
  list(): Event[] {
    return [...loadDataIndex().events];
  },
  getById(id: string): Event | null {
    return loadDataIndex().events.find((event) => event.id === id) ?? null;
  },
  getRelatedEntities(id: string): Entity[] {
    const event = this.getById(id);
    return event ? entitiesByIds(loadDataIndex(), event.subject_ids) : [];
  },
  getRelatedNews(id: string): NewsDocument[] {
    const event = this.getById(id);
    const relatedDocumentIds = new Set(event?.related_document_ids ?? []);
    return newsRepository
      .list()
      .filter((document) => relatedDocumentIds.has(document.id) || document.event_ids?.includes(id));
  },
  getRelatedSources(id: string): Source[] {
    const event = this.getById(id);
    return event ? sourcesByIds(loadDataIndex(), event.source_ids) : [];
  },
};

const searchableTypes: SearchType[] = ["vehicle", "brand", "manufacturer", "technology", "news"];
const typeOrder = new Map<SearchType, number>(searchableTypes.map((type, index) => [type, index]));

export function normalizeSearchValue(value: string) {
  return value.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, " ");
}

function searchType(value: string | undefined): SearchType {
  return value && ["all", ...searchableTypes].includes(value) ? (value as SearchType) : "all";
}

function resultHref(type: SearchType, slug: string) {
  const route = {
    vehicle: "vehicles",
    brand: "brands",
    manufacturer: "manufacturers",
    technology: "technologies",
    news: "news",
  }[type as Exclude<SearchType, "all">];
  return `/${route}/${slug}`;
}

export const searchRepository = {
  search(query: string, options: SearchOptions = {}): SearchResult[] {
    const normalizedQuery = normalizeSearchValue(query);
    if (!normalizedQuery) return [];
    const wantedType = searchType(options.type);
    const limit = positiveInteger(options.limit, 20);

    return loadSearchIndex()
      .filter((entry) => wantedType === "all" || entry.type === wantedType)
      .map((entry) => {
        const values = [entry.id, entry.slug, entry.display_name, entry.display_name_zh, ...(entry.aliases ?? [])]
          .filter((value): value is string => Boolean(value))
          .map(normalizeSearchValue);
        const exact = values.some((value) => value === normalizedQuery);
        const prefix = !exact && values.some((value) => value.startsWith(normalizedQuery));
        const match = exact || prefix || values.some((value) => value.includes(normalizedQuery));
        if (!match) return null;
        const matchRank = exact ? (entry.kind === "entity" ? 0 : 1) : prefix ? (entry.kind === "entity" ? 2 : 3) : entry.kind === "entity" ? 4 : 5;
        return {
          result: {
            id: entry.id,
            type: entry.type,
            slug: entry.slug,
            display_name: entry.display_name,
            display_name_zh: entry.display_name_zh,
            kind: entry.kind,
            href: resultHref(entry.type, entry.slug),
          },
          matchRank,
          typeRank: typeOrder.get(entry.type) ?? searchableTypes.length,
        };
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .sort(
        (a, b) =>
          a.matchRank - b.matchRank ||
          a.typeRank - b.typeRank ||
          a.result.id.localeCompare(b.result.id),
      )
      .slice(0, limit)
      .map((item) => item.result);
  },
};

export function relatedEntities(ids: string[] | undefined) {
  const index = loadDataIndex();
  return (ids ?? []).map((id) => entityById(index, id)).filter((entity): entity is NonNullable<typeof entity> => Boolean(entity));
}
