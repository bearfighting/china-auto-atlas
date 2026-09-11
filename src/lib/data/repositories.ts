import { loadContentIndex, loadDataIndex, loadSearchIndex } from "./load-index";
import {
  entitiesByType,
  entitiesByIds,
  entityById,
  eventsRelatedTo,
  mediaByIds,
  approvedMedia,
  relationshipsFor,
  sourcesByIds,
  vehiclesFromIndex,
  vehiclesRelatedTo,
} from "./resolvers";
import type {
  Brand,
  Entity,
  Event,
  Factory,
  Manufacturer,
  Media,
  NewsDocument,
  Author,
  Organization,
  ProductLine,
  Platform,
  ProductionLine,
  SearchResult,
  SearchOptions,
  SearchType,
  SearchPage,
  SearchPageOptions,
  Source,
  Topic,
  Technology,
  TechnologyCategory,
  TechnologyDomain,
  TechnologyFamily,
  TechnologyFilterOptions,
  TechnologyPage,
  TechnologyPageOptions,
  TechnologySummary,
  EventFilterOptions,
  EventPage,
  EventPageOptions,
  PowertrainArchitecture,
  Relationship,
  VehicleSeries,
  Vehicle,
  VehicleFilterOptions,
  VehiclePage,
  VehiclePageOptions,
  BrandPage,
  BrandPageOptions,
  ManufacturerSummary,
  NewsFilterOptions,
  NewsPage,
  NewsPageOptions,
} from "./types";
import { authorsByIds, displayName, topicsByIds } from "./resolvers";

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
    const documents = this.list().filter((document) => {
      const yearMatches = options.year === undefined || document.published_at.slice(0, 4) === String(options.year);
      const entityMatches = options.entityId === undefined || document.entity_ids?.includes(options.entityId);
      return yearMatches && entityMatches;
    });
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
  getFilterOptions(): NewsFilterOptions {
    const documents = this.list();
    const years = [...new Set(documents.map((document) => Number(document.published_at.slice(0, 4))))]
      .filter((year) => Number.isInteger(year))
      .sort((a, b) => b - a);
    const entityIds = new Set(documents.flatMap((document) => document.entity_ids ?? []));
    const entities = [...entityIds]
      .map((id) => entityById(loadDataIndex(), id))
      .filter((entity): entity is Entity => Boolean(entity))
      .sort((a, b) => displayName(a.names).localeCompare(displayName(b.names)) || a.id.localeCompare(b.id));
    return { years, entities };
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
  listPage(options: VehiclePageOptions = {}): VehiclePage {
    const dataIndex = loadDataIndex();
    const page = positiveInteger(options.page, 1);
    const pageSize = positiveInteger(options.pageSize, 12);
    const vehicles = this.list()
      .filter((vehicle) => {
        const brandMatches = options.brandId === undefined || vehicle.brand_id === options.brandId;
        const powertrainMatches =
          options.powertrainType === undefined || vehicle.powertrain_types?.includes(options.powertrainType);
        const statusMatches = options.status === undefined || vehicle.status === options.status;
        return brandMatches && powertrainMatches && statusMatches;
      })
      .sort((a, b) => {
        const brandA = a.brand_id ? entityById(dataIndex, a.brand_id) : null;
        const brandB = b.brand_id ? entityById(dataIndex, b.brand_id) : null;
        return (
          displayName(brandA?.type === "brand" ? brandA.names : undefined).localeCompare(
            displayName(brandB?.type === "brand" ? brandB.names : undefined),
          ) ||
          displayName(a.names).localeCompare(displayName(b.names)) ||
          a.id.localeCompare(b.id)
        );
      });
    const total = vehicles.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;

    return {
      items: vehicles.slice(start, start + pageSize),
      page,
      pageSize,
      total,
      totalPages,
    };
  },
  getFilterOptions(): VehicleFilterOptions {
    const vehicles = this.list();
    const brands = [...new Set(vehicles.map((vehicle) => vehicle.brand_id).filter(Boolean))]
      .map((brandId) => entityOfType<Brand>(brandId, "brand"))
      .filter((brand): brand is Brand => Boolean(brand))
      .sort((a, b) => displayName(a.names).localeCompare(displayName(b.names)) || a.id.localeCompare(b.id));
    const powertrainTypes = (["bev", "phev", "erev"] as const).filter((type) =>
      vehicles.some((vehicle) => vehicle.powertrain_types?.includes(type)),
    );
    const statuses = [...new Set(vehicles.map((vehicle) => vehicle.status).filter(Boolean))]
      .filter((status): status is string => Boolean(status))
      .sort((a, b) => a.localeCompare(b));
    return { brands, powertrainTypes: [...powertrainTypes], statuses };
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
  getProductLine(id: string): ProductLine | null {
    return entityOfType<ProductLine>(this.getById(id)?.product_line_id, "product_line");
  },
  getSeries(id: string): VehicleSeries | null {
    return entityOfType<VehicleSeries>(this.getById(id)?.series_id, "vehicle_series");
  },
  getFactories(id: string): Factory[] {
    return factoryRepository.list().filter((factory) => productionLineRepository.getVehiclesByFactory(factory.id).some((vehicle) => vehicle.id === id));
  },
  getProductionLines(id: string): ProductionLine[] {
    return productionLineRepository.list().filter((line) => line.vehicle_ids?.includes(id));
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
  getPowertrainArchitecture(id: string): PowertrainArchitecture | null {
    const architectureId = this.getById(id)?.powertrain_architecture_id;
    return architectureId ? powertrainArchitectureRepository.getById(architectureId) : null;
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
  listPage(options: BrandPageOptions = {}): BrandPage {
    const page = positiveInteger(options.page, 1);
    const pageSize = positiveInteger(options.pageSize, 12);
    const query = options.query?.trim().toLocaleLowerCase();
    const brands = this.list()
      .filter((brand) => {
        if (!query) return true;
        return [brand.names?.en, brand.names?.["zh-CN"], ...(brand.aliases ?? [])]
          .filter(Boolean)
          .some((value) => value?.toLocaleLowerCase().includes(query));
      })
      .sort(
        (a, b) =>
          displayName(a.names).localeCompare(displayName(b.names)) || a.id.localeCompare(b.id),
      );
    const total = brands.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    return {
      items: brands.slice(start, start + pageSize),
      page,
      pageSize,
      total,
      totalPages,
    };
  },
  getVehicles(id: string): Vehicle[] {
    return vehiclesRelatedTo(loadDataIndex(), id);
  },
  getProductLines(id: string): ProductLine[] {
    return entitiesByType<ProductLine>(loadDataIndex(), "product_line").filter((productLine) => productLine.brand_id === id);
  },
  getSeries(id: string): VehicleSeries[] {
    return entitiesByType<VehicleSeries>(loadDataIndex(), "vehicle_series").filter((vehicleSeries) => vehicleSeries.brand_id === id);
  },
  getFactories(id: string): Factory[] {
    const vehicleIds = new Set(this.getVehicles(id).map((vehicle) => vehicle.id));
    return factoryRepository.list().filter((factory) =>
      productionLineRepository.getVehiclesByFactory(factory.id).some((vehicle) => vehicleIds.has(vehicle.id)),
    );
  },
};

export const productLineRepository = {
  list(): ProductLine[] {
    return entitiesByType<ProductLine>(loadDataIndex(), "product_line");
  },
  getById(id: string): ProductLine | null {
    return this.list().find((productLine) => productLine.id === id) ?? null;
  },
  getBySlug(slug: string): ProductLine | null {
    return findBySlug(this.list(), slug);
  },
  getByBrand(brandId: string): ProductLine[] {
    return this.list().filter((productLine) => productLine.brand_id === brandId);
  },
  getSeries(productLineId: string): VehicleSeries[] {
    return vehicleSeriesRepository.list().filter((vehicleSeries) => vehicleSeries.product_line_id === productLineId);
  },
};

export const vehicleSeriesRepository = {
  list(): VehicleSeries[] {
    return entitiesByType<VehicleSeries>(loadDataIndex(), "vehicle_series");
  },
  getById(id: string): VehicleSeries | null {
    return this.list().find((vehicleSeries) => vehicleSeries.id === id) ?? null;
  },
  getBySlug(slug: string): VehicleSeries | null {
    return findBySlug(this.list(), slug);
  },
  getByBrand(brandId: string): VehicleSeries[] {
    return this.list().filter((vehicleSeries) => vehicleSeries.brand_id === brandId);
  },
  getByProductLine(productLineId: string): VehicleSeries[] {
    return this.list().filter((vehicleSeries) => vehicleSeries.product_line_id === productLineId);
  },
  getVehicles(seriesId: string): Vehicle[] {
    return vehiclesFromIndex(loadDataIndex()).filter((vehicle) => vehicle.series_id === seriesId);
  },
};

export const factoryRepository = {
  list(): Factory[] {
    return entitiesByType<Factory>(loadDataIndex(), "factory");
  },
  getById(id: string): Factory | null {
    return this.list().find((factory) => factory.id === id) ?? null;
  },
  getBySlug(slug: string): Factory | null {
    return findBySlug(this.list(), slug);
  },
  getProductionLines(factoryId: string): ProductionLine[] {
    return productionLineRepository.list().filter((line) => line.factory_id === factoryId);
  },
  getVehicles(factoryId: string): Vehicle[] {
    return this.getProductionLines(factoryId).flatMap((line) => line.vehicle_ids ?? [])
      .map((vehicleId) => vehicleRepository.getById(vehicleId))
      .filter((vehicle): vehicle is Vehicle => Boolean(vehicle));
  },
};

export const productionLineRepository = {
  list(): ProductionLine[] {
    return entitiesByType<ProductionLine>(loadDataIndex(), "production_line");
  },
  getById(id: string): ProductionLine | null {
    return this.list().find((line) => line.id === id) ?? null;
  },
  getBySlug(slug: string): ProductionLine | null {
    return findBySlug(this.list(), slug);
  },
  getByFactory(factoryId: string): ProductionLine[] {
    return this.list().filter((line) => line.factory_id === factoryId);
  },
  getVehicles(lineId: string): Vehicle[] {
    return (this.getById(lineId)?.vehicle_ids ?? [])
      .map((vehicleId) => vehicleRepository.getById(vehicleId))
      .filter((vehicle): vehicle is Vehicle => Boolean(vehicle));
  },
  getVehiclesByFactory(factoryId: string): Vehicle[] {
    return this.getByFactory(factoryId).flatMap((line) => this.getVehicles(line.id));
  },
};

export const manufacturerRepository = {
  ...relatedEntityRepository<Manufacturer>("manufacturer"),
  getSummary(id: string): ManufacturerSummary {
    return {
      brandCount: this.getBrands(id).length,
      vehicleCount: this.getVehicles(id).length,
      newsCount: this.getRelatedNews(id).length,
      sourceCount: this.getRelatedSources(id).length,
    };
  },
  getVehicles(id: string): Vehicle[] {
    return vehiclesRelatedTo(loadDataIndex(), id);
  },
  getBrands(id: string): Brand[] {
    const brandIds = new Set(this.getVehicles(id).map((vehicle) => vehicle.brand_id).filter(Boolean));
    return entitiesByType<Brand>(loadDataIndex(), "brand").filter((brand) => brandIds.has(brand.id));
  },
  getFactories(id: string): Factory[] {
    const vehicleIds = new Set(this.getVehicles(id).map((vehicle) => vehicle.id));
    return factoryRepository.list().filter((factory) =>
      productionLineRepository.getVehiclesByFactory(factory.id).some((vehicle) => vehicleIds.has(vehicle.id)),
    );
  },
  getProductionLines(id: string): ProductionLine[] {
    const vehicleIds = new Set(this.getVehicles(id).map((vehicle) => vehicle.id));
    return productionLineRepository.list().filter((line) => (line.vehicle_ids ?? []).some((vehicleId) => vehicleIds.has(vehicleId)));
  },
};

export const technologyRepository = {
  ...relatedEntityRepository<Technology>("technology"),
  getSummary(id: string): TechnologySummary {
    return {
      vehicleCount: this.getVehicles(id).length,
      eventCount: this.getRelatedEvents(id).length,
      newsCount: this.getRelatedNews(id).length,
      sourceCount: this.getRelatedSources(id).length,
    };
  },
  listPage(options: TechnologyPageOptions = {}): TechnologyPage {
    const page = positiveInteger(options.page, 1);
    const pageSize = positiveInteger(options.pageSize, 12);
    const query = options.query?.trim().toLocaleLowerCase();
    const technologies = this.list().filter((technology) => {
      const textMatches = !query || [
        technology.names?.en,
        technology.names?.["zh-CN"],
        ...(technology.aliases ?? []),
      ]
        .filter(Boolean)
        .some((value) => value?.toLocaleLowerCase().includes(query));
      const domainMatches = !options.domainId || technology.domain_ids.includes(options.domainId);
      const categoryMatches =
        !options.categoryId || technology.category_ids.includes(options.categoryId);
      const familyMatches = !options.familyId || technology.family_ids?.includes(options.familyId);
      return textMatches && domainMatches && categoryMatches && familyMatches;
    });
    const total = technologies.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    return {
      items: technologies.slice(start, start + pageSize),
      page,
      pageSize,
      total,
      totalPages,
    };
  },
  getFilterOptions(): TechnologyFilterOptions {
    const technologies = this.list();
    const usedDomains = new Set(technologies.flatMap((technology) => technology.domain_ids));
    const usedCategories = new Set(technologies.flatMap((technology) => technology.category_ids));
    const usedFamilies = new Set(
      technologies.flatMap((technology) => technology.family_ids ?? []),
    );
    const sortByName = <T extends { id: string; names?: Technology["names"] }>(a: T, b: T) =>
      displayName(a.names).localeCompare(displayName(b.names)) || a.id.localeCompare(b.id);
    const index = loadDataIndex();
    return {
      domains: index.technology_domains.filter((domain) => usedDomains.has(domain.id)).sort(sortByName),
      categories: index.technology_categories
        .filter((category) => usedCategories.has(category.id))
        .sort(sortByName),
      families: index.technology_families.filter((family) => usedFamilies.has(family.id)).sort(sortByName),
    };
  },
  getDomains(id: string): TechnologyDomain[] {
    const technology = this.getById(id);
    const wanted = new Set(technology?.domain_ids ?? []);
    return loadDataIndex().technology_domains.filter((domain) => wanted.has(domain.id));
  },
  getCategories(id: string): TechnologyCategory[] {
    const technology = this.getById(id);
    const wanted = new Set(technology?.category_ids ?? []);
    return loadDataIndex().technology_categories.filter((category) => wanted.has(category.id));
  },
  getFamilies(id: string): TechnologyFamily[] {
    const technology = this.getById(id);
    const wanted = new Set(technology?.family_ids ?? []);
    return loadDataIndex().technology_families.filter((family) => wanted.has(family.id));
  },
  getRelatedRelationships(id: string): Relationship[] {
    return relationshipsFor(loadDataIndex(), id);
  },
  getRelatedTechnologies(id: string): Technology[] {
    const index = loadDataIndex();
    const relatedIds = new Set(
      relationshipsFor(index, id).flatMap((relationship) =>
        relationship.from_id === id ? [relationship.to_id] : [relationship.from_id],
      ),
    );
    return index.entities.filter(
      (entity): entity is Technology => entity.type === "technology" && relatedIds.has(entity.id),
    );
  },
  getVehicles(id: string): Vehicle[] {
    return vehiclesRelatedTo(loadDataIndex(), id);
  },
};

export const technologyDomainRepository = {
  list(): TechnologyDomain[] {
    return loadDataIndex().technology_domains;
  },
  getById(id: string): TechnologyDomain | null {
    return this.list().find((domain) => domain.id === id) ?? null;
  },
};

export const technologyCategoryRepository = {
  list(): TechnologyCategory[] {
    return loadDataIndex().technology_categories;
  },
  getById(id: string): TechnologyCategory | null {
    return this.list().find((category) => category.id === id) ?? null;
  },
  getChildren(parentId: string): TechnologyCategory[] {
    return this.list().filter((category) => category.parent_id === parentId);
  },
};

export const technologyFamilyRepository = {
  list(): TechnologyFamily[] {
    return loadDataIndex().technology_families;
  },
  getById(id: string): TechnologyFamily | null {
    return this.list().find((family) => family.id === id) ?? null;
  },
};

export const powertrainArchitectureRepository = {
  list(): PowertrainArchitecture[] {
    return loadDataIndex().powertrain_architectures;
  },
  getById(id: string): PowertrainArchitecture | null {
    return this.list().find((architecture) => architecture.id === id) ?? null;
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
  listPage(options: EventPageOptions = {}): EventPage {
    const page = positiveInteger(options.page, 1);
    const pageSize = positiveInteger(options.pageSize, 12);
    const events = [...this.list()].sort((a, b) => {
      if (a.date && b.date) return b.date.localeCompare(a.date) || a.id.localeCompare(b.id);
      if (a.date) return -1;
      if (b.date) return 1;
      return a.id.localeCompare(b.id);
    });
    const filtered = events.filter((event) => {
      const yearMatches =
        options.year === undefined ||
        (Number.isInteger(options.year) && event.date?.slice(0, 4) === String(options.year));
      const typeMatches = options.eventType === undefined || event.event_type === options.eventType;
      const entityMatches =
        options.entityId === undefined || event.subject_ids?.includes(options.entityId);
      return yearMatches && typeMatches && entityMatches;
    });
    const total = filtered.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    return { items: filtered.slice(start, start + pageSize), page, pageSize, total, totalPages };
  },
  getFilterOptions(): EventFilterOptions {
    const events = this.list();
    const years = [...new Set(
      events
        .map((event) => event.date?.slice(0, 4))
        .filter((year): year is string => typeof year === "string" && /^\d{4}$/.test(year)),
    )]
      .map(Number)
      .sort((a, b) => b - a);
    const eventTypes = [
      ...new Set(
        events
          .map((event) => event.event_type)
          .filter((eventType): eventType is string => typeof eventType === "string" && eventType.length > 0),
      ),
    ].sort();
    const subjectIds = new Set(events.flatMap((event) => event.subject_ids ?? []));
    const entities = entitiesByIds(loadDataIndex(), [...subjectIds]).sort(
      (a, b) => displayName(a.names).localeCompare(displayName(b.names)) || a.id.localeCompare(b.id),
    );
    return { years, eventTypes, entities };
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
    const limit = positiveInteger(options.limit, 20);
    return rankedSearchResults(query, options.type).slice(0, limit);
  },
  searchPage(query: string, options: SearchPageOptions = {}): SearchPage {
    const page = positiveInteger(options.page, 1);
    const pageSize = positiveInteger(options.pageSize, 20);
    const results = rankedSearchResults(query.slice(0, 200), options.type);
    const total = results.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    return { items: results.slice(start, start + pageSize), page, pageSize, total, totalPages };
  },
};

function rankedSearchResults(query: string, type?: SearchType): SearchResult[] {
    const normalizedQuery = normalizeSearchValue(query);
    if (!normalizedQuery) return [];
    const wantedType = searchType(type);

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
      .map((item) => item.result);
}

export function relatedEntities(ids: string[] | undefined) {
  const index = loadDataIndex();
  return (ids ?? []).map((id) => entityById(index, id)).filter((entity): entity is NonNullable<typeof entity> => Boolean(entity));
}
