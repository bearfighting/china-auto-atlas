import { describe, expect, it, vi } from "vitest";
import * as loadIndexModule from "./load-index";
import { loadContentIndex, loadDataIndex, loadSearchIndex } from "./load-index";
import { approvedMedia, displayName } from "./resolvers";
import { sortNewsDocuments } from "./repositories";
import {
  brandRepository,
  eventRepository,
  factoryRepository,
  manufacturerRepository,
  newsRepository,
  organizationById,
  platformById,
  productLineRepository,
  productionLineRepository,
  powertrainArchitectureRepository,
  searchRepository,
  sourceRepository,
  technologyCategoryRepository,
  technologyDomainRepository,
  technologyFamilyRepository,
  technologyRepository,
  vehicleSeriesRepository,
  vehicleRepository,
} from "./repositories";
import type { NewsDocument } from "./types";

describe("generated data repositories", () => {
  it("loads the generated indexes", () => {
    const dataIndex = loadDataIndex();
    expect(dataIndex.entities.length).toBeGreaterThan(0);
    expect(dataIndex.entities.filter((entity) => entity.type.endsWith("_domain") || entity.type.endsWith("_category") || entity.type.endsWith("_family") || entity.type === "powertrain_architecture")).toEqual([]);
    expect(dataIndex.technology_domains).toHaveLength(6);
    expect(dataIndex.technology_categories).toHaveLength(9);
    expect(dataIndex.technology_families).toHaveLength(5);
    expect(dataIndex.powertrain_architectures).toHaveLength(8);
    expect(loadContentIndex().documents.length).toBe(23);
    expect(loadContentIndex().authors.length).toBeGreaterThan(0);
    expect(loadContentIndex().topics.length).toBeGreaterThan(0);
  });

  it("resolves taxonomy through generated-index repositories", () => {
    expect(technologyDomainRepository.list()).toHaveLength(6);
    expect(technologyDomainRepository.getById("energy-storage")?.names.en).toBe("Energy Storage");
    expect(technologyDomainRepository.getById("missing-domain")).toBeNull();

    expect(technologyCategoryRepository.getById("battery-pack")?.domain_id).toBe("energy-storage");
    expect(technologyCategoryRepository.getChildren("missing-category")).toEqual([]);

    expect(technologyFamilyRepository.getById("lfp")?.id).toBe("lfp");
    expect(technologyFamilyRepository.getById("missing-family")).toBeNull();
    expect(powertrainArchitectureRepository.getById("battery-electric")?.id).toBe("battery-electric");
    expect(powertrainArchitectureRepository.getById("missing-architecture")).toBeNull();
  });

  it("returns children for a taxonomy category with a parent", () => {
    const dataIndex = loadDataIndex();
    const child = {
      ...dataIndex.technology_categories[0],
      id: "battery-cell-child",
      parent_id: "battery-pack",
    };
    const spy = vi.spyOn(loadIndexModule, "loadDataIndex").mockReturnValue({
      ...dataIndex,
      technology_categories: [...dataIndex.technology_categories, child],
    });

    try {
      expect(technologyCategoryRepository.getChildren("battery-pack").map((category) => category.id)).toEqual([
        "battery-cell-child",
      ]);
    } finally {
      spy.mockRestore();
    }
  });

  it("requires classification fields on every migrated Technology", () => {
    const technologies = loadDataIndex().entities.filter((entity) => entity.type === "technology");
    expect(technologies).toHaveLength(15);
    expect(
      technologies.every(
        (technology) =>
          typeof technology.kind === "string" &&
          Array.isArray(technology.domain_ids) &&
          Array.isArray(technology.category_ids),
      ),
    ).toBe(true);
  });

  it("resolves Technology classification without changing legacy relations", () => {
    expect(technologyRepository.getById("byd-blade-battery")).toMatchObject({
      kind: "branded",
      domain_ids: ["energy-storage"],
      category_ids: ["battery-cell", "battery-pack", "battery-safety"],
      family_ids: ["lfp"],
      category: "battery",
    });
    expect(technologyRepository.getDomains("byd-blade-battery").map((domain) => domain.id)).toEqual(["energy-storage"]);
    expect(technologyRepository.getCategories("byd-ctb").map((category) => category.id)).toEqual([
      "battery-pack",
      "structural-battery",
    ]);
    expect(technologyRepository.getFamilies("byd-ctb").map((family) => family.id)).toEqual(["structural-battery-family"]);
    expect(technologyRepository.getDomains("missing-technology")).toEqual([]);
    expect(technologyRepository.getCategories("missing-technology")).toEqual([]);
    expect(technologyRepository.getFamilies("missing-technology")).toEqual([]);
  });

  it("resolves Technology relationships and Vehicle Architecture", () => {
    const relationships = loadDataIndex().relationships;
    expect(relationships).toHaveLength(37);
    const technologyFamilyRelationships = relationships.filter((relationship) =>
      ["lfp", "structural-battery-family", "highly-integrated-e-drive"].includes(relationship.to_id),
    );
    expect(technologyFamilyRelationships).toHaveLength(5);
    expect(technologyFamilyRelationships).toEqual(expect.arrayContaining([
        expect.objectContaining({ from_id: "byd-blade-battery", to_id: "lfp", relationship: "based_on" }),
        expect.objectContaining({ from_id: "byd-ctb", to_id: "structural-battery-family", relationship: "based_on" }),
        expect.objectContaining({ from_id: "byd-ctc", to_id: "structural-battery-family", relationship: "based_on" }),
        expect.objectContaining({ from_id: "geely-short-blade-battery", to_id: "lfp", relationship: "based_on" }),
        expect.objectContaining({
          from_id: "geely-11-in-1-electric-drive",
          to_id: "highly-integrated-e-drive",
          relationship: "based_on",
        }),
    ]));
    expect(technologyRepository.getRelatedRelationships("byd-blade-battery")).toMatchObject([
      expect.objectContaining({
        from_id: "byd-blade-battery",
        to_id: "lfp",
        relationship: "based_on",
      }),
    ]);
    expect(vehicleRepository.getPowertrainArchitecture("byd-sealion-7")?.id).toBe("battery-electric");
    expect(vehicleRepository.getPowertrainArchitecture("deepal-s05")).toBeNull();
  });

  it("resolves Technology to Technology relationships without copying reverse fields", () => {
    const dataIndex = loadDataIndex();
    const spy = vi.spyOn(loadIndexModule, "loadDataIndex").mockReturnValue({
      ...dataIndex,
      relationships: [
        ...dataIndex.relationships,
        {
          id: "fixture-technology-relationship",
          type: "relationship",
          from_id: "byd-blade-battery",
          to_id: "geely-short-blade-battery",
          relationship: "complements",
          source_ids: ["src-byd-blade-tech"],
          evidence_status: "confirmed",
        },
      ],
    });

    try {
      expect(technologyRepository.getRelatedTechnologies("byd-blade-battery").map((technology) => technology.id)).toEqual([
        "geely-short-blade-battery",
      ]);
    } finally {
      spy.mockRestore();
    }
  });

  it("lists news in stable chronological order", () => {
    const news = newsRepository.list();
    expect(news).toHaveLength(23);
    expect(news.map((item) => item.slug)).toEqual([
      "deepal-l07-launch",
      "avatr-07-launch",
      "deepal-s05-launch",
      "denza-n9-shanghai-presentation",
      "byd-super-e-platform-launch",
      "byd-sealion-7-europe-launch",
      "zeekr-7x-launch",
      "geely-ex5-global-unveil",
      "byd-qin-l-launch",
      "xiaomi-su7-launch",
      "yangwang-u9-launch",
      "geely-galaxy-e8-launch",
      "zeekr-007-launch",
      "avatr-12-global-debut",
      "deepal-s07-debut",
      "byd-song-l-concept-debut",
      "zeekr-009-launch",
      "avatr-11-global-launch",
      "chn-platform-launch",
      "zeekr-001-launch",
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
      total: 23,
      totalPages: 3,
    });
    expect(newsRepository.listPage({ page: 1, pageSize: 2 }).items.map((item) => item.slug)).toEqual([
      "deepal-l07-launch",
      "avatr-07-launch",
    ]);
    expect(newsRepository.listPage({ page: 3, pageSize: 2 }).items.map((item) => item.slug)).toEqual([
      "byd-super-e-platform-launch",
      "byd-sealion-7-europe-launch",
    ]);
    expect(newsRepository.listPage({ page: 4, pageSize: 2 }).items.map((item) => item.slug)).toEqual([
      "zeekr-7x-launch",
      "geely-ex5-global-unveil",
    ]);
    expect(newsRepository.listPage({ page: 5, pageSize: 2 }).items.map((item) => item.slug)).toEqual([
      "byd-qin-l-launch",
      "xiaomi-su7-launch",
    ]);
    expect(newsRepository.listPage({ page: 6, pageSize: 2 }).items.map((item) => item.slug)).toEqual([
      "yangwang-u9-launch",
      "geely-galaxy-e8-launch",
    ]);
    expect(newsRepository.listPage({ page: 7, pageSize: 2 }).items.map((item) => item.slug)).toEqual([
      "zeekr-007-launch",
      "avatr-12-global-debut",
    ]);
    expect(newsRepository.listPage({ page: 8, pageSize: 2 }).items.map((item) => item.slug)).toEqual([
      "deepal-s07-debut",
      "byd-song-l-concept-debut",
    ]);
    expect(newsRepository.listPage({ page: 12, pageSize: 2 }).items.map((item) => item.slug)).toEqual([
      "byd-blade-battery-launch",
    ]);
    expect(newsRepository.listPage({ page: 13, pageSize: 2 }).items).toEqual([]);
    expect(newsRepository.listPage({ page: 0, pageSize: 0 })).toMatchObject({ page: 1, pageSize: 10 });
  });

  it("filters news before applying pagination", () => {
    expect(newsRepository.listPage({ year: 2025 }).items.map((item) => item.slug)).toEqual([
      "denza-n9-shanghai-presentation",
      "byd-super-e-platform-launch",
    ]);
    expect(newsRepository.listPage({ entityId: "zeekr-7x" }).items.map((item) => item.slug)).toEqual([
      "zeekr-7x-launch",
    ]);
    expect(
      newsRepository.listPage({ year: 2022, entityId: "avatr-11" }).items.map((item) => item.slug),
    ).toEqual(["avatr-11-global-launch", "chn-platform-launch"]);
    expect(newsRepository.listPage({ year: 2025, page: 2 }).items).toEqual([]);
    expect(newsRepository.listPage({ year: 2099 }).items).toEqual([]);
    expect(newsRepository.listPage({ entityId: "missing-entity" }).items).toEqual([]);
  });

  it("provides only entities referenced by news as filter options", () => {
    const options = newsRepository.getFilterOptions();
    expect(options.years).toEqual([2026, 2025, 2024, 2023, 2022, 2021, 2020]);
    expect(options.entities.map((entity) => entity.id)).toContain("zeekr-7x");
    expect(options.entities.map((entity) => entity.id)).not.toContain("mg4");
    expect(options.entities.every((entity) => entity.type !== "technology_domain")).toBe(true);
  });

  it("provides stable vehicle pagination and filters", () => {
    expect(vehicleRepository.listPage()).toMatchObject({
      page: 1,
      pageSize: 12,
      total: 25,
      totalPages: 3,
    });
    expect(vehicleRepository.listPage().items.map((vehicle) => vehicle.id)).toEqual([
      "avatr-07",
      "avatr-11",
      "avatr-12",
      "byd-han",
      "byd-qin-l",
      "byd-seal",
      "byd-sealion-7",
      "byd-song-l",
      "byd-tang",
      "deepal-l07",
      "deepal-s05",
      "deepal-s07",
    ]);
    expect(vehicleRepository.listPage({ page: 2 }).items[0]?.id).toBe("denza-d9");
    expect(vehicleRepository.listPage({ page: 3 }).items).toHaveLength(1);
    expect(vehicleRepository.listPage({ page: 4 }).items).toEqual([]);
    expect(vehicleRepository.listPage({ page: 0 })).toMatchObject({ page: 1, pageSize: 12 });

    expect(vehicleRepository.listPage({ brandId: "byd" }).items).toHaveLength(6);
    expect(
      vehicleRepository.listPage({ powertrainType: "phev" }).items.every((vehicle) =>
        vehicle.powertrain_types?.includes("phev"),
      ),
    ).toBe(true);
    expect(vehicleRepository.listPage({ status: "active" }).total).toBe(25);
    expect(vehicleRepository.listPage({ brandId: "byd", powertrainType: "bev", status: "active" }).total).toBe(5);
    expect(vehicleRepository.listPage({ brandId: "missing-brand" }).items).toEqual([]);
    expect(vehicleRepository.listPage({ powertrainType: "unknown" as "bev" }).items).toEqual([]);
    expect(vehicleRepository.listPage({ status: "missing-status" }).items).toEqual([]);
  });

  it("provides only values used by vehicles as filter options", () => {
    const options = vehicleRepository.getFilterOptions();
    expect(options.brands.map((brand) => brand.id)).toEqual([
      "avatr",
      "byd",
      "deepal",
      "denza",
      "fangchengbao",
      "geely-auto",
      "mg",
      "xiaomi-auto",
      "yangwang",
      "zeekr",
    ]);
    expect(options.powertrainTypes).toEqual(["bev", "phev", "erev"]);
    expect(options.statuses).toEqual(["active"]);
  });

  it("provides stable brand pagination and name search", () => {
    expect(brandRepository.listPage()).toMatchObject({
      page: 1,
      pageSize: 12,
      total: 10,
      totalPages: 1,
    });
    expect(brandRepository.listPage({ page: 0 })).toMatchObject({ page: 1, pageSize: 12 });
    expect(brandRepository.listPage({ page: 2 }).items).toEqual([]);
    expect(brandRepository.listPage({ page: 1, pageSize: 2 }).items.map((brand) => brand.id)).toEqual([
      "avatr",
      "byd",
    ]);
    expect(brandRepository.listPage({ query: "byd" }).items.map((brand) => brand.id)).toEqual(["byd"]);
    expect(brandRepository.listPage({ query: "方程豹" }).items.map((brand) => brand.id)).toEqual([
      "fangchengbao",
    ]);
    expect(brandRepository.listPage({ query: "FANG CHENG BAO" }).items.map((brand) => brand.id)).toEqual([
      "fangchengbao",
    ]);
    expect(brandRepository.listPage({ query: "BYD" }).items.map((brand) => brand.id)).toEqual(["byd"]);
    expect(brandRepository.listPage({ query: "missing-brand" }).items).toEqual([]);
    expect(brandRepository.listPage({ query: "   " }).total).toBe(10);
  });

  it("resolves the ZEEKR 7X by id and slug", () => {
    expect(vehicleRepository.getById("zeekr-7x")?.id).toBe("zeekr-7x");
    expect(vehicleRepository.getBySlug("zeekr-7x")?.id).toBe("zeekr-7x");
    expect(vehicleRepository.getRelatedNews("zeekr-7x").map((item) => item.slug)).toContain("zeekr-7x-launch");
  });

  it("keeps Geely and Zeekr brand indexes and vehicle relations aligned", () => {
    expect(loadDataIndex().entities.find((entity) => entity.id === "geely-auto")?.vehicle_ids).toEqual([
      "geely-ex5",
      "geely-galaxy-e8",
    ]);
    expect(loadDataIndex().entities.find((entity) => entity.id === "zeekr")?.vehicle_ids).toEqual([
      "zeekr-7x",
      "zeekr-001",
      "zeekr-007",
      "zeekr-009",
    ]);
    expect(vehicleRepository.getRelatedNews("geely-ex5").map((item) => item.slug)).toContain("geely-ex5-global-unveil");
    expect(vehicleRepository.getPlatform("geely-ex5")?.id).toBe("geely-gea");
    expect(vehicleRepository.getTechnologies("geely-ex5").map((technology) => technology.id)).toEqual([
      "geely-short-blade-battery",
      "geely-11-in-1-electric-drive",
    ]);
    expect(vehicleRepository.getPlatform("zeekr-7x")?.id).toBe("geely-sea");
    expect(vehicleRepository.getTechnologies("zeekr-7x").map((technology) => technology.id)).toEqual([
      "zeekr-800v-system",
      "zeekr-golden-battery",
    ]);
  });

  it("keeps the Changan, AVATR and DEEPAL slice navigable", () => {
    expect(loadDataIndex().entities.find((entity) => entity.id === "avatr")?.vehicle_ids).toEqual([
      "avatr-11",
      "avatr-07",
      "avatr-12",
    ]);
    expect(loadDataIndex().entities.find((entity) => entity.id === "deepal")?.vehicle_ids).toEqual([
      "deepal-s07",
      "deepal-l07",
      "deepal-s05",
    ]);
    expect(vehicleRepository.getRelatedNews("avatr-11").map((item) => item.slug)).toContain("avatr-11-global-launch");
    expect(vehicleRepository.getRelatedNews("deepal-s07").map((item) => item.slug)).toContain("deepal-s07-debut");
    expect(vehicleRepository.getRelatedEvents("deepal-s07").map((event) => event.id)).toEqual(
      expect.arrayContaining([
      "event-deepal-s07-debut-2023",
      "event-deepal-s07-thailand-preorder-2023",
      "event-deepal-s07-thailand-launch-2023",
      "event-deepal-s07-indonesia-market",
      ]),
    );
    expect(vehicleRepository.getRelatedEvents("deepal-s07")).toHaveLength(4);
    expect(vehicleRepository.getMarketSpecifications("deepal-s07").find((item) => item.id === "ms-deepal-s07-id-bev")?.variants?.[0]).toMatchObject({
      name: "S07 BEV",
      powertrain_type: "bev",
    });
    expect(vehicleRepository.getMarketSpecifications("deepal-s07").find((item) => item.id === "ms-deepal-s07-mu-bev")?.variants?.[0]).toMatchObject({
      name: "S07 BEV",
      powertrain_type: "bev",
    });
    expect(newsRepository.getRelatedEvents("news-2023-05-18-deepal-s07-debut").map((event) => event.id)).toContain(
      "event-deepal-s07-debut-2023",
    );
  });

  it("resolves the optional BYD product hierarchy without changing direct brand access", () => {
    expect(brandRepository.getVehicles("byd").map((vehicle) => vehicle.id)).toEqual([
      "byd-han",
      "byd-qin-l",
      "byd-seal",
      "byd-sealion-7",
      "byd-song-l",
      "byd-tang",
    ]);
    expect(productLineRepository.getByBrand("byd").map((line) => line.id)).toEqual(["byd-dynasty", "byd-ocean"]);
    expect(productLineRepository.getSeries("byd-dynasty").map((series) => series.id)).toEqual([
      "byd-han-series",
      "byd-qin-series",
      "byd-song-series",
      "byd-tang-series",
    ]);
    expect(vehicleSeriesRepository.getVehicles("byd-qin-series").map((vehicle) => vehicle.id)).toEqual(["byd-qin-l"]);
    expect(vehicleSeriesRepository.getVehicles("byd-sea-lion-series").map((vehicle) => vehicle.id)).toEqual(["byd-sealion-7"]);
    expect(vehicleRepository.getProductLine("byd-qin-l")?.id).toBe("byd-dynasty");
    expect(vehicleRepository.getSeries("byd-qin-l")?.id).toBe("byd-qin-series");
    expect(vehicleRepository.getSeries("zeekr-007")).toBeNull();
    expect(brandRepository.getProductLines("zeekr")).toEqual([]);
  });

  it("resolves the sourced Factory and Production Line pilot", () => {
    expect(factoryRepository.getById("chongqing-plant")?.location).toMatchObject({ city: "Chongqing" });
    expect(factoryRepository.getProductionLines("chongqing-plant").map((line) => line.id)).toEqual([
      "chongqing-avatr-12-line",
    ]);
    expect(productionLineRepository.getVehicles("chongqing-avatr-12-line").map((vehicle) => vehicle.id)).toEqual([
      "avatr-12",
    ]);
    expect(vehicleRepository.getFactories("avatr-12").map((factory) => factory.id)).toEqual(["chongqing-plant"]);
    expect(manufacturerRepository.getProductionLines("chongqing-changan-automobile").map((line) => line.id)).toEqual([
      "chongqing-avatr-12-line",
    ]);
    expect(manufacturerRepository.getFactories("byd-company")).toEqual([]);
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

  it("keeps the Xiaomi SU7 seed slice connected across entity, event, news, source and market data", () => {
    expect(brandRepository.getVehicles("xiaomi-auto").map((vehicle) => vehicle.id)).toContain("xiaomi-su7");
    expect(vehicleRepository.getBrand("xiaomi-su7")?.id).toBe("xiaomi-auto");
    expect(vehicleRepository.getRelatedEvents("xiaomi-su7").map((event) => event.id)).toEqual(
      expect.arrayContaining(["event-xiaomi-su7-prelaunch-2023", "event-xiaomi-su7-launch-2024"]),
    );
    expect(vehicleRepository.getRelatedNews("xiaomi-su7").map((article) => article.slug)).toContain("xiaomi-su7-launch");
    expect(newsRepository.getRelatedSources("news-2024-04-17-xiaomi-su7-launch").map((source) => source.id)).toContain(
      "src-xiaomi-su7-launch-2024",
    );
    expect(vehicleRepository.getMarketSpecifications("xiaomi-su7")[0]?.variants?.every((variant) =>
      variant.powertrain_type === "bev",
    )).toBe(true);
  });

  it("keeps the cross-slice BYD reverse indexes and D9 timeline navigable", () => {
    expect(brandRepository.getVehicles("fangchengbao").map((vehicle) => vehicle.id)).toContain("fangchengbao-bao-5");
    expect(technologyRepository.getVehicles("byd-blade-battery").map((vehicle) => vehicle.id)).toContain("denza-d9");
    expect(vehicleRepository.getRelatedEvents("denza-d9").map((event) => event.id)).toEqual(
      expect.arrayContaining(["event-denza-d9-production-2022", "event-denza-d9-delivery-2022"]),
    );
    expect(sourceRepository.getById("src-denza-d9-production-2022")?.id).toBe("src-denza-d9-production-2022");
  });

  it("connects the expanded vehicle batch to events, news and market data", () => {
    expect(vehicleRepository.getPlatform("zeekr-001")?.id).toBe("geely-sea");
    expect(vehicleRepository.getPlatform("geely-galaxy-e8")?.id).toBe("geely-gea");
    expect(vehicleRepository.getPlatform("avatr-12")?.id).toBe("avatr-chn");
    expect(vehicleRepository.getRelatedNews("byd-qin-l").map((item) => item.slug)).toContain("byd-qin-l-launch");
    expect(vehicleRepository.getRelatedEvents("avatr-12").map((event) => event.id)).toEqual(
      expect.arrayContaining(["event-avatr-12-global-debut-2023", "event-avatr-12-production-2023"]),
    );
    expect(vehicleRepository.getMarketSpecifications("avatr-07")[0]?.variants).toEqual([{ name: "AVATR 07" }]);
    expect(vehicleRepository.getPlatform("deepal-l07")?.id).toBe("changan-epa1");
    expect(technologyRepository.getById("byd-dm-p")?.type).toBe("technology");
  });

  it("preserves evidence boundaries during stabilization", () => {
    const dataIndex = loadDataIndex();
    expect(dataIndex.entities).toHaveLength(74);
    expect(dataIndex.events).toHaveLength(71);
    expect(dataIndex.sources).toHaveLength(111);
    expect(dataIndex.market_specifications).toHaveLength(20);

    expect(platformById("changan-epa1")?.vehicle_ids).toContain("deepal-l07");
    expect(technologyRepository.getById("byd-dm-p")?.first_announced_at).toMatchObject({ value: null });
    expect(vehicleRepository.getById("deepal-s05")?.platform_id).toBeNull();
    expect(vehicleRepository.getById("deepal-s05")?.event_ids).toEqual([]);
    expect(vehicleRepository.getMarketSpecifications("avatr-07")[0]?.status).toBe("reference_only");
    expect(vehicleRepository.getMarketSpecifications("avatr-12")[0]?.status).toBe("reference_only");
    for (const [vehicleId, expectedPowertrain] of [
      ["byd-seal", "bev"],
      ["fangchengbao-bao-5", "phev"],
      ["geely-ex5", "bev"],
      ["mg4", "bev"],
      ["zeekr-7x", "bev"],
    ]) {
      const specifications = vehicleRepository.getMarketSpecifications(vehicleId);
      const variants = specifications.flatMap((specification) => specification.variants ?? []);
      expect(specifications).not.toHaveLength(0);
      expect(variants).not.toHaveLength(0);
      expect(variants.every((variant) => variant.powertrain_type === expectedPowertrain)).toBe(true);
    }

    const gea = platformById("geely-gea");
    expect(gea?.pending_reference_ids).toContain("geely-auto-group");
    const avatrChn = platformById("avatr-chn");
    expect(avatrChn?.pending_reference_ids).toEqual(
      expect.arrayContaining(["chongqing-changan-automobile", "huawei", "catl"]),
    );
    for (const [technologyId, referenceId] of [
      ["geely-short-blade-battery", "geely-auto-group"],
      ["geely-11-in-1-electric-drive", "geely-auto-group"],
      ["zeekr-800v-system", "zeekr-group"],
      ["zeekr-golden-battery", "zeekr-group"],
      ["avatr-800v-sic", "huawei"],
    ]) {
      expect(technologyRepository.getById(technologyId)?.pending_reference_ids).toContain(referenceId);
    }
  });

  it("lists vehicles with stable detail identifiers", () => {
    const vehicles = vehicleRepository.list();
    expect(vehicles).toHaveLength(25);
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

  it("provides manufacturer relationship summaries without changing relations", () => {
    expect(manufacturerRepository.getSummary("byd-company")).toEqual({
      brandCount: 4,
      vehicleCount: 11,
      newsCount: 8,
      sourceCount: 2,
    });
    expect(manufacturerRepository.getSummary("does-not-exist")).toEqual({
      brandCount: 0,
      vehicleCount: 0,
      newsCount: 0,
      sourceCount: 0,
    });
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
    expect(eventRepository.list().length).toBe(71);
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
    const searchIndex = loadSearchIndex();
    expect(searchIndex).toHaveLength(81);
    expect(new Set(searchIndex.map((entry) => entry.id)).size).toBe(searchIndex.length);
    expect(searchIndex.some((entry) => (entry.type as string) === "platform")).toBe(false);
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
    expect(searchRepository.search("小米 SU7")[0]).toMatchObject({
      id: "xiaomi-su7",
      type: "vehicle",
      kind: "entity",
      href: "/vehicles/xiaomi-su7",
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
