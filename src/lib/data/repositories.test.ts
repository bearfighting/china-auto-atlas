import { describe, expect, it } from "vitest";
import { loadContentIndex, loadDataIndex } from "./load-index";
import { displayName } from "./resolvers";
import {
  brandRepository,
  eventRepository,
  manufacturerRepository,
  newsRepository,
  organizationById,
  platformById,
  searchRepository,
  sourceRepository,
  technologyRepository,
  vehicleRepository,
} from "./repositories";

describe("generated data repositories", () => {
  it("loads the generated indexes", () => {
    expect(loadDataIndex().entities.length).toBeGreaterThan(0);
    expect(loadContentIndex().documents.length).toBe(5);
    expect(loadContentIndex().authors.length).toBeGreaterThan(0);
    expect(loadContentIndex().topics.length).toBeGreaterThan(0);
  });

  it("resolves the ZEEKR 7X by id and slug", () => {
    expect(vehicleRepository.getById("zeekr-7x")?.id).toBe("zeekr-7x");
    expect(vehicleRepository.getBySlug("zeekr-7x")?.id).toBe("zeekr-7x");
    expect(vehicleRepository.getRelatedNews("zeekr-7x").map((item) => item.slug)).toContain("zeekr-7x-launch");
  });

  it("lists vehicles with stable detail identifiers", () => {
    const vehicles = vehicleRepository.list();
    expect(vehicles).toHaveLength(10);
    expect(vehicles.map((vehicle) => vehicle.id)).toContain("zeekr-7x");
    expect(vehicleRepository.getBySlug("zeekr-7x")?.id).toBe("zeekr-7x");
  });

  it("resolves typed entities and reverse vehicle relationships", () => {
    expect(brandRepository.getById("zeekr")?.type).toBe("brand");
    expect(brandRepository.getBySlug("zeekr")?.id).toBe("zeekr");
    expect(brandRepository.getVehicles("zeekr").map((vehicle) => vehicle.id)).toContain("zeekr-7x");

    expect(manufacturerRepository.getById("zeekr-group")?.type).toBe("manufacturer");
    expect(manufacturerRepository.getVehicles("zeekr-group").map((vehicle) => vehicle.id)).toContain("zeekr-7x");
    expect(organizationById("zeekr-group")?.type).toBe("manufacturer");

    expect(technologyRepository.getById("zeekr-800v-system")?.type).toBe("technology");
    expect(technologyRepository.getVehicles("zeekr-800v-system").map((vehicle) => vehicle.id)).toContain("zeekr-7x");
    expect(platformById("geely-sea")?.type).toBe("platform");
  });

  it("resolves typed entity relations and media", () => {
    expect(brandRepository.getRelatedEvents("zeekr").length).toBeGreaterThan(0);
    expect(brandRepository.getRelatedSources("zeekr").length).toBeGreaterThan(0);
    expect(brandRepository.getRelatedNews("zeekr").map((article) => article.slug)).toContain("zeekr-7x-launch");
    expect(vehicleRepository.getMedia("zeekr-7x").map((media) => media.id)).toContain("media-vehicle-zeekr-7x-hero");
  });

  it("returns null for missing records and empty results for missing relations", () => {
    expect(vehicleRepository.getById("does-not-exist")).toBeNull();
    expect(sourceRepository.getById("does-not-exist")).toBeNull();
    expect(eventRepository.getById("does-not-exist")).toBeNull();
    expect(vehicleRepository.getRelatedEvents("does-not-exist")).toEqual([]);
    expect(brandRepository.getById("does-not-exist")).toBeNull();
    expect(brandRepository.getVehicles("does-not-exist")).toEqual([]);
    expect(platformById("does-not-exist")).toBeNull();
  });

  it("resolves news and its generated body", () => {
    const article = newsRepository.getBySlug("zeekr-7x-launch");
    expect(article?.body).toContain("official brand timeline");
    expect(article?.entity_ids).toContain("zeekr-7x");
    expect(article?.author_ids).toContain("caa-editorial");
    expect(article?.topic_ids).toContain("vehicle-launch");
  });

  it("exposes page relations through repositories", () => {
    const article = newsRepository.getBySlug("zeekr-7x-launch");
    expect(article).not.toBeNull();
    expect(newsRepository.getRelatedEntities(article!.id).map((entity) => entity.id)).toContain("zeekr-7x");
    expect(newsRepository.getRelatedEvents(article!.id).map((event) => event.id)).toContain(
      "event-zeekr-7x-china-launch-2024",
    );
    expect(newsRepository.getRelatedSources(article!.id).length).toBeGreaterThan(0);
    expect(newsRepository.getAuthors(article!.id).length).toBeGreaterThan(0);
    expect(newsRepository.getTopics(article!.id).length).toBeGreaterThan(0);

    expect(vehicleRepository.getBrand("zeekr-7x")?.id).toBe("zeekr");
    expect(vehicleRepository.getManufacturers("zeekr-7x").map((entity) => entity.id)).toContain("zeekr-group");
    expect(vehicleRepository.getPlatform("zeekr-7x")?.id).toBe("geely-sea");
    expect(vehicleRepository.getTechnologies("zeekr-7x").map((entity) => entity.id)).toContain("zeekr-800v-system");
  });

  it("falls back from Chinese names to English names", () => {
    expect(displayName({ en: "ZEEKR 7X" }, "zh-CN")).toBe("ZEEKR 7X");
    expect(displayName({ "zh-CN": "极氪 7X" }, "en")).toBe("极氪 7X");
    expect(displayName(undefined)).toBe("Unknown");
  });

  it("provides deterministic basic search across entities and news", () => {
    expect(searchRepository.search("")).toEqual([]);
    expect(searchRepository.search("极氪 7X")[0]).toMatchObject({
      id: "zeekr-7x",
      type: "vehicle",
      kind: "entity",
    });
    expect(searchRepository.search("EX5")[0]).toMatchObject({ id: "geely-ex5", kind: "entity" });
    expect(searchRepository.search("zeekr-7x-launch")[0]).toMatchObject({
      id: "news-2024-09-20-zeekr-7x-launch",
      type: "news",
      kind: "news",
    });
    expect(searchRepository.search("ZEEKR")[0]).toMatchObject({ id: "zeekr", type: "brand" });
  });
});
