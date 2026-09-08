import { describe, expect, it } from "vitest";
import { loadContentIndex, loadDataIndex } from "./load-index";
import { displayName } from "./resolvers";
import { eventRepository, newsRepository, sourceRepository, vehicleRepository } from "./repositories";

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

  it("returns null for missing records and empty results for missing relations", () => {
    expect(vehicleRepository.getById("does-not-exist")).toBeNull();
    expect(sourceRepository.getById("does-not-exist")).toBeNull();
    expect(eventRepository.getById("does-not-exist")).toBeNull();
    expect(vehicleRepository.getRelatedEvents("does-not-exist")).toEqual([]);
  });

  it("resolves news and its generated body", () => {
    const article = newsRepository.getBySlug("zeekr-7x-launch");
    expect(article?.body).toContain("official brand timeline");
    expect(article?.entity_ids).toContain("zeekr-7x");
    expect(article?.author_ids).toContain("caa-editorial");
    expect(article?.topic_ids).toContain("vehicle-launch");
  });

  it("falls back from Chinese names to English names", () => {
    expect(displayName({ en: "ZEEKR 7X" }, "zh-CN")).toBe("ZEEKR 7X");
    expect(displayName({ "zh-CN": "极氪 7X" }, "en")).toBe("极氪 7X");
    expect(displayName(undefined)).toBe("Unknown");
  });
});
