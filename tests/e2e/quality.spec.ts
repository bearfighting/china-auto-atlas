import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const qualityRoutes = [
  "/",
  "/news",
  "/news/zeekr-7x-launch",
  "/vehicles",
  "/vehicles/zeekr-7x",
  "/brands",
  "/brands/zeekr",
  "/manufacturers",
  "/manufacturers/zeekr-group",
  "/technologies",
  "/technologies/zeekr-800v-system",
  "/events",
  "/events/event-zeekr-7x-china-launch-2024",
  "/search",
];

test("main routes have one h1, structured data, and no horizontal overflow", async ({ page }) => {
  for (const route of qualityRoutes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("h1"), route).toHaveCount(1);
    if (route !== "/") {
      expect(await page.locator('script[type="application/ld+json"]').count()).toBeGreaterThan(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      await page.evaluate(() => document.documentElement.clientWidth),
    );
    const imageAlts = await page
      .locator("img")
      .evaluateAll((images) => images.map((image) => image.getAttribute("alt")?.trim() ?? ""));
    expect(imageAlts.every(Boolean), route).toBe(true);
  }
});

test("main routes pass serious and critical axe checks", async ({ page }) => {
  for (const route of qualityRoutes) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    const blockingViolations = results.violations.filter(
      (violation) => violation.impact === "critical" || violation.impact === "serious",
    );
    expect(blockingViolations, JSON.stringify({ route, violations: blockingViolations })).toEqual(
      [],
    );
  }
});

test("article JSON-LD and crawl configuration are correct", async ({ page }) => {
  await page.goto("/news/zeekr-7x-launch");
  const structuredData = await page
    .locator('script[type="application/ld+json"]')
    .evaluateAll((scripts) => scripts.map((script) => JSON.parse(script.textContent ?? "{}")));
  expect(structuredData).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        "@type": "Article",
        headline: "ZEEKR launches the 7X electric SUV",
      }),
      expect.objectContaining({ "@type": "BreadcrumbList" }),
    ]),
  );

  const robots = await page.request.get("/robots.txt");
  expect(await robots.text()).toContain("sitemap.xml");
  const sitemap = await page.request.get("/sitemap.xml");
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain("/brands/zeekr");
  expect(sitemapText).toContain("/brands");
  expect(sitemapText).toContain("/manufacturers/zeekr-group");
  expect(sitemapText).toContain("/manufacturers");
  expect(sitemapText).toContain("/technologies/zeekr-800v-system");
  expect(sitemapText).toContain("/technologies");
  expect(sitemapText).toContain("/events/event-zeekr-7x-china-launch-2024");
  expect(sitemapText).toContain("/events");
  expect(sitemapText).not.toContain("/search");
});

test("search API failures have an accessible error state", async ({ page }) => {
  await page.route("**/api/search**", (route) => route.abort());
  await page.goto("/");
  if (test.info().project.name !== "chromium") {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByTestId("mobile-search-trigger").click();
  } else {
    await page.getByTestId("search-trigger").click();
  }
  await page.locator('input[aria-label="Search atlas"]').fill("ZEEKR");
  await expect(page.getByText("Search is temporarily unavailable.")).toBeVisible();
});

test("reduced motion disables smooth transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  const motionStyles = await page
    .locator("a")
    .first()
    .evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        scrollBehavior: styles.scrollBehavior,
        transitionDuration: styles.transitionDuration,
      };
    });
  expect(motionStyles.scrollBehavior).toBe("auto");
  expect(Number.parseFloat(motionStyles.transitionDuration)).toBeLessThanOrEqual(0.01);
});
