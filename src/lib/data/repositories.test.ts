import { describe, expect, it } from "vitest";
import { loadContentIndex, loadDataIndex, loadSearchIndex } from "./load-index";
import { approvedMedia, displayName } from "./resolvers";
import { sortNewsDocuments } from "./repositories";
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
import type { NewsDocument } from "./types";

describe("generated data repositories", () => {
  it("loads the generated indexes", () => {
    expect(loadDataIndex().entities.length).toBeGreaterThan(0);
    expect(loadContentIndex().documents.length).toBe(12);
    expect(loadContentIndex().authors.length).toBeGreaterThan(0);
    expect(loadContentIndex().topics.length).toBeGreaterThan(0);
  });

  it("lists news in stable chronological order", () => {
    const news = newsRepository.list();
    expect(news).toHaveLength(12);
    expect(news.map((item) => item.slug)).toEqual([
      "denza-n9-shanghai-presentation",
      "byd-super-e-platform-launch",
      "byd-sealion-7-europe-launch",
      "zeekr-7x-launch",
      "geely-ex5-global-unveil",
      "yangwang-u9-launch",
      "byd-song-l-concept-debut",
      "avatr-11-global-launch",
      "chn-platform-launch",
      "byd-tang-norway-launch",
      "byd-han-launch",
      "byd-blade-battery-launch",
    ]);
  });

  it("uses the id as a deterministic tie-breaker for equal publication dates", () => {
    const documents = [
      { id: "news-b", published_at: "2024-01-01" },
      { id: "news-a", published_at: "2024-01-01" },
    ] as NewsDocument[];
    expect(sortNewsDocuments(documents).map((item) => item.id)).toEqual(["news-a", "news-b"]);
  });

  it("provides a stable news pagination contract", () => {
    expect(newsRepository.listPage()).toMatchObject({
      page: 1,
      pageSize: 10,
      total: 12,
      totalPages: 2,
    });
    expect(newsRepository.listPage({ page: 1, pageSize: 2 }).items.map((item) => item.slug)).toEqual([
      "denza-n9-shanghai-presentation",
      "byd-super-e-platform-launch",
    ]);
    expect(newsRepository.listPage({ page: 3, pageSize: 2 }).items.map((item) => item.slug)).toEqual([
      "geely-ex5-global-unveil",
      "yangwang-u9-launch",
    ]);
    expect(newsRepository.listPage({ page: 4, pageSize: 2 }).items.map((item) => item.slug)).toEqual([
      "byd-song-l-concept-debut",
      "avatr-11-global-launch",
    ]);
    expect(newsRepository.listPage({ page: 5, pageSize: 2 }).items.map((item) => item.slug)).toEqual([
      "chn-platform-launch",
      "byd-tang-norway-launch",
    ]);
    expect(newsRepository.listPage({ page: 6, pageSize: 2 }).items.map((item) => item.slug)).toEqual([
      "byd-han-launch",
      "byd-blade-battery-launch",
    ]);
    expect(newsRepository.listPage({ page: 7, pageSize: 2 }).items).toEqual([]);
    expect(newsRepository.listPage({ page: 0, pageSize: 0 })).toMatchObject({ page: 1, pageSize: 10 });
  });

  it("resolves the ZEEKR 7X by id and slug", () => {
    expect(vehicleRepository.getById("zeekr-7x")?.id).toBe("zeekr-7x");
    expect(vehicleRepository.getBySlug("zeekr-7x")?.id).toBe("zeekr-7x");
    expect(vehicleRepository.getRelatedNews("zeekr-7x").map((item) => item.slug)).toContain("zeekr-7x-launch");
  });

  it("exposes the BYD vertical-slice news and market specification", () => {
    expect(vehicleRepository.getRelatedNews("byd-sealion-7").map((item) => item.slug)).toContain(
      "byd-sealion-7-europe-launch",
    );
    expect(vehicleRepository.getRelatedNews("byd-han").map((item) => item.slug)).toContain("byd-han-launch");
    const sealionSpecification = vehicleRepository.getMarketSpecifications("byd-sealion-7")[0];
    expect(sealionSpecification?.id).toBe("ms-byd-sealion-7-eu-2024");
    expect(sealionSpecification?.variants?.every((variant) => variant.powertrain_type === "bev")).toBe(true);
    expect(sealionSpecification?.variants?.every((variant) => variant.range?.standard === "WLTP")).toBe(true);
    expect(newsRepository.getRelatedEvents("news-2025-05-08-denza-n9-shanghai-presentation")).not.toEqual([]);
  });

  it("lists vehicles with stable detail identifiers", () => {
    const vehicles = vehicleRepository.list();
    expect(vehicles).toHaveLength(16);
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
    expect(vehicleRepository.getApprovedMedia("zeekr-7x")).toEqual([]);
    expect(manufacturerRepository.getBrands("zeekr-group").map((brand) => brand.id)).toContain("zeekr");
  });

  it("lists events and resolves event relationships", () => {
    expect(eventRepository.list().length).toBe(61);
    const event = eventRepository.getById("event-zeekr-7x-china-launch-2024");
    expect(eventRepository.getRelatedEntities(event!.id).map((entity) => entity.id)).toContain("zeekr-7x");
    expect(eventRepository.getRelatedNews(event!.id).map((article) => article.slug)).toContain("zeekr-7x-launch");
    expect(eventRepository.getRelatedSources(event!.id).length).toBeGreaterThan(0);
    expect(eventRepository.getRelatedEntities("does-not-exist")).toEqual([]);
    expect(eventRepository.getRelatedNews("does-not-exist")).toEqual([]);
    expect(eventRepository.getRelatedSources("does-not-exist")).toEqual([]);
  });

  it("returns only media approved for public use", () => {
    expect(
      approvedMedia([
        { id: "approved", type: "media", collection_status: "approved", rights_status: "approved" },
        { id: "needs-review", type: "media", collection_status: "downloaded", rights_status: "needs_review" },
      ]),
    ).toMatchObject([{ id: "approved" }]);
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
    expect(loadSearchIndex()).toHaveLength(60);
    expect(loadSearchIndex().some((entry) => (entry.type as string) === "platform")).toBe(false);
    expect(searchRepository.search("")).toEqual([]);
    expect(searchRepository.search("极氪 7X")[0]).toMatchObject({
      id: "zeekr-7x",
      type: "vehicle",
      kind: "entity",
      href: "/vehicles/zeekr-7x",
    });
    expect(searchRepository.search("EX5")[0]).toMatchObject({
      id: "geely-ex5",
      kind: "entity",
      href: "/vehicles/geely-ex5",
    });
    expect(searchRepository.search("zeekr-7x-launch")[0]).toMatchObject({
      id: "news-2024-09-20-zeekr-7x-launch",
      type: "news",
      kind: "news",
      href: "/news/zeekr-7x-launch",
    });
    expect(searchRepository.search("ZEEKR")[0]).toMatchObject({ id: "zeekr", type: "brand" });
    expect(searchRepository.search("极氪汽车")[0]?.id).toBe("zeekr");
    expect(searchRepository.search("zeekr", { type: "vehicle" }).every((item) => item.type === "vehicle")).toBe(true);
    expect(() => searchRepository.search("zeekr", { type: "not-a-type" as never })).not.toThrow();
    expect(searchRepository.search("zeekr", { limit: 1 })).toHaveLength(1);
    expect(searchRepository.search("zeekr")).toEqual(searchRepository.search("zeekr"));
  });
});
