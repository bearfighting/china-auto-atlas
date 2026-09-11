import { expect, test } from "@playwright/test";

test("opens the news to vehicle to source vertical slice", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /News is input/i })).toBeVisible();
  await page.getByRole("link", { name: "View all" }).click();
  await expect(page).toHaveURL(/\/news$/);
  await page.getByRole("link", { name: /ZEEKR launches the 7X/i }).click();
  await expect(page).toHaveURL(/\/news\/zeekr-7x-launch$/);
  await expect(page.getByRole("heading", { name: /ZEEKR launches the 7X/i })).toBeVisible();
  await expect(page.getByText("CAA Editorial")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Related events" })).toBeVisible();
  await page
    .getByRole("link", { name: /ZEEKR 7X/i })
    .first()
    .click();
  await expect(page).toHaveURL(/\/vehicles\/zeekr-7x$/);
  await expect(page.getByRole("heading", { name: "ZEEKR 7X", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Market specifications" })).toBeVisible();
  await expect(page.getByText(/605 km CLTC/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sources" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: "ZEEKR", exact: true }),
  ).toHaveAttribute("href", "/brands/zeekr");
});

test("homepage exposes the Atlas and keeps the footer in the page shell", async ({ page }) => {
  await page.goto("/");
  const atlas = page.getByTestId("homepage-atlas");
  await expect(atlas).toBeVisible();
  for (const item of ["Vehicles", "Brands", "Manufacturers", "Technologies", "Events"]) {
    await expect(atlas.getByRole("link", { name: new RegExp(`^${item}`) })).toBeVisible();
  }
  await expect(page.getByTestId("homepage-featured-news")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});

test("browses the vehicle collection from the primary navigation", async ({ page }) => {
  test.skip(test.info().project.name !== "chromium", "desktop-only primary navigation coverage");

  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Vehicles" })
    .click();
  await expect(page).toHaveURL(/\/vehicles$/);
  await expect(page.getByRole("heading", { name: "Vehicles", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "AVATR 07", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Breadcrumb" }).getByText("Vehicles"),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.getByTestId("search-trigger")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
});

test("renders paginated vehicles and applies URL filters", async ({ page }) => {
  await page.goto("/vehicles");
  await expect(page.getByText("Showing 1–12 of 25 vehicles")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Vehicle pagination" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Next" })).toBeVisible();
  await expect(page.getByText("Previous", { exact: true })).toHaveAttribute(
    "aria-disabled",
    "true",
  );

  await page.goto("/vehicles?page=2");
  await expect(page).toHaveURL(/\/vehicles\?page=2$/);
  await expect(page.getByText("Showing 13–24 of 25 vehicles")).toBeVisible();
  await expect(page.getByRole("link", { name: "DENZA N9", exact: true })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Vehicle pagination" }).getByText("2", { exact: true }),
  ).toHaveAttribute("aria-current", "page");

  await page.getByRole("combobox", { name: "Brand" }).selectOption("byd");
  await page.getByRole("combobox", { name: "Powertrain" }).selectOption("bev");
  await page.getByRole("combobox", { name: "Status" }).selectOption("active");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/\/vehicles\?brand=byd&powertrain=bev&status=active$/);
  await expect(page.getByText("Showing 1–5 of 5 vehicles")).toBeVisible();
  await expect(page.getByRole("link", { name: "BYD SEAL", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Clear filters" })).toHaveAttribute(
    "href",
    "/vehicles",
  );

  await page.getByRole("link", { name: "Clear filters" }).click();
  await expect(page).toHaveURL(/\/vehicles$/);

  await page.goto("/vehicles?powertrain=bev");
  await expect(page.getByText("Showing 1–12 of 19 vehicles")).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Vehicle pagination" })
      .getByRole("link", { name: "Next" }),
  ).toHaveAttribute("href", "/vehicles?page=2&powertrain=bev");
});

test("shows an empty state for an out-of-range vehicle page", async ({ page }) => {
  await page.goto("/vehicles?page=99");
  await expect(page.getByText("No vehicles on this page")).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to all Vehicles" })).toHaveAttribute(
    "href",
    "/vehicles",
  );
  await expect(page.getByRole("navigation", { name: "Vehicle pagination" })).toHaveCount(0);
});

test("discovers entity collections from the desktop primary navigation", async ({ page }) => {
  test.skip(test.info().project.name !== "chromium", "desktop-only primary navigation coverage");

  await page.goto("/");
  const primaryNavigation = page.getByRole("navigation", { name: "Primary navigation" });
  for (const item of ["News", "Vehicles", "Brands", "Manufacturers", "Technologies", "Events"]) {
    await expect(primaryNavigation.getByRole("link", { name: item, exact: true })).toBeVisible();
  }
  await primaryNavigation.getByRole("link", { name: "Brands", exact: true }).click();
  await expect(page).toHaveURL(/\/brands$/);
  await expect(page.getByRole("heading", { name: "Brands", exact: true })).toBeVisible();
  await expect(page.getByTestId("atlas-entity-card").first()).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/brands$/);
});

test("renders manufacturer relationship summaries", async ({ page }) => {
  await page.goto("/manufacturers");
  await expect(page.getByRole("heading", { name: "Manufacturers", exact: true })).toBeVisible();
  await expect(page.getByTestId("atlas-entity-card")).toHaveCount(8);
  await expect(page.getByTestId("atlas-entity-card").first()).toContainText(
    /\d+ brands · \d+ vehicles · \d+ news · \d+ sources/,
  );
});

test("searches brands and handles an out-of-range page", async ({ page }) => {
  await page.goto("/brands");
  await expect(page.getByText("Showing 1–10 of 10 brands")).toBeVisible();
  await expect(page.getByRole("searchbox", { name: "Search brands" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Brand pagination" })).toHaveCount(0);

  const brandFilters = page.locator('form[action="/brands"]');
  await brandFilters.getByRole("searchbox", { name: "Search brands" }).fill("byd");
  await brandFilters.getByRole("button", { name: "Search" }).click();
  await expect(page).toHaveURL(/\/brands\?q=byd$/);
  await expect(page.getByText("Showing 1–1 of 1 brands")).toBeVisible();
  await expect(page.getByRole("link", { name: "BYD", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Clear search" })).toHaveAttribute("href", "/brands");

  await page.goto("/brands?q=byd&page=2");
  await expect(page.getByText("No brands on this page")).toBeVisible();

  await page.goto("/brands?page=99");
  await expect(page.getByText("No brands on this page")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Brand pagination" })).toHaveCount(0);
});

test("opens and closes the mobile navigation", async ({ page }) => {
  test.skip(test.info().project.name === "chromium", "mobile navigation coverage");

  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(
    page.getByRole("dialog").getByRole("link", { name: "Vehicles", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();

  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("dialog").getByRole("link", { name: "Vehicles" }).click();
  await expect(page).toHaveURL(/\/vehicles$/);
  await expect(page.getByRole("dialog")).toBeHidden();

  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("dialog").getByRole("link", { name: "Vehicles" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await page.getByTestId("sheet-overlay").click({ position: { x: 5, y: 400 } });
  await expect(page.getByRole("dialog")).toBeHidden();
});

test("discovers entity collections from the flat mobile navigation", async ({ page }) => {
  test.skip(test.info().project.name === "chromium", "mobile navigation coverage");

  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const mobileNavigation = page.getByRole("navigation", { name: "Mobile navigation" });
  await mobileNavigation.getByRole("link", { name: "Technologies" }).click();
  await expect(page).toHaveURL(/\/technologies$/);
  await expect(page.getByRole("heading", { name: "Technologies", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
});

test("renders the complete news collection and shared shell", async ({ page }) => {
  await page.goto("/news");
  await expect(page.getByRole("heading", { name: "News", exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /DEEPAL L07 presented/i })).toBeVisible();
  await expect(page.getByText("Showing 1–10 of 23 news articles")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "News pagination" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Next" })).toBeVisible();
  await expect(page.getByText("Previous", { exact: true })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await expect(page.getByRole("combobox", { name: "Year" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Related entity" })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Breadcrumb" }).getByText("News"),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("contentinfo")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});

test("supports news pagination and URL filters", async ({ page }) => {
  await page.goto("/news?page=2");
  await expect(page).toHaveURL(/\/news\?page=2$/);
  await expect(page.getByText("Showing 11–20 of 23 news articles")).toBeVisible();
  await expect(page.getByRole("link", { name: /YANGWANG launches the U9/i })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "News pagination" }).getByText("2", { exact: true }),
  ).toHaveAttribute("aria-current", "page");

  await page.getByRole("combobox", { name: "Year" }).selectOption("2025");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/\/news\?year=2025&entity=$/);
  await expect(page.getByText("Showing 1–2 of 2 news articles")).toBeVisible();
  await expect(page.getByRole("link", { name: /DENZA N9 presented/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Clear filters" })).toHaveAttribute("href", "/news");

  await page.getByRole("link", { name: "Clear filters" }).click();
  await expect(page).toHaveURL(/\/news$/);
  await page.getByRole("combobox", { name: "Related entity" }).selectOption("zeekr-7x");
  await page.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/\/news\?year=&entity=zeekr-7x$/);
  await expect(page.getByText("Showing 1–1 of 1 news articles")).toBeVisible();
  await expect(page.getByRole("link", { name: /ZEEKR launches the 7X/i })).toBeVisible();
});

test("shows an empty state for an out-of-range news page", async ({ page }) => {
  await page.goto("/news?page=99");
  await expect(page.getByText("No news on this page")).toBeVisible();
  await expect(page.getByText("Try another page or return to the first page.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to all News" })).toHaveAttribute(
    "href",
    "/news",
  );
  await expect(page.getByRole("navigation", { name: "News pagination" })).toHaveCount(0);
});

test("renders paginated events and supports URL filters", async ({ page }) => {
  await page.goto("/events");
  await expect(page.getByRole("heading", { name: "Events", exact: true })).toBeVisible();
  await expect(page.getByText("Showing 1–12 of 71 events")).toBeVisible();
  await expect(page.getByTestId("event-card")).toHaveCount(12);
  await expect(page.getByRole("navigation", { name: "Event pagination" })).toBeVisible();
  await expect(page.getByText("Previous", { exact: true })).toHaveAttribute(
    "aria-disabled",
    "true",
  );
  await expect(page.getByRole("combobox", { name: "Year" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Event type" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Related entity" })).toBeVisible();

  await page.goto("/events?page=2");
  await expect(page).toHaveURL(/\/events\?page=2$/);
  await expect(page.getByText("Showing 13–24 of 71 events")).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Event pagination" }).getByText("2", { exact: true }),
  ).toHaveAttribute("aria-current", "page");

  await page.goto("/events?year=2023&type=vehicle_reveal&entity=avatr-12");
  await expect(page.getByText("Showing 1–1 of 1 events")).toBeVisible();
  await expect(page.getByRole("link", { name: /AVATR 12 made its global debut/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Clear filters" })).toHaveAttribute(
    "href",
    "/events",
  );

  await page.goto("/events?type=not-an-event-type");
  await expect(page.getByText("No events match these filters")).toBeVisible();
  await expect(page.getByRole("link", { name: "Clear filters" })).toHaveAttribute(
    "href",
    "/events",
  );
  await expect(page.getByRole("navigation", { name: "Event pagination" })).toHaveCount(0);

  await page.goto("/events?year=2023&page=99");
  await expect(page.getByText("No events on this page")).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to all Events" })).toHaveAttribute(
    "href",
    "/events",
  );

  await page.goto("/events?page=99");
  await expect(page.getByText("No events on this page")).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to all Events" })).toHaveAttribute(
    "href",
    "/events",
  );
  await expect(page.getByRole("navigation", { name: "Event pagination" })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});

test("renders event detail context and related entity links", async ({ page }) => {
  await page.goto("/events/event-avatr-chn-platform-launch-2022");
  await expect(page.getByRole("heading", { name: /CHN architecture/i })).toBeVisible();
  await expect(page.getByText("Technology launch", { exact: true })).toBeVisible();
  await expect(page.getByText("2022-06-25", { exact: true })).toBeVisible();
  await expect(page.getByText("Date precision", { exact: true })).toBeVisible();
  await expect(page.getByText("Evidence status", { exact: true })).toBeVisible();
  await expect(page.getByText("Record ID", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Related entities" })).toBeVisible();
  await expect(page.getByTestId("event-entity")).toHaveCount(5);
  await expect(page.locator('a[href="/vehicles/avatr-11"]')).toBeVisible();
  await expect(page.getByRole("heading", { name: "Related news" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sources" })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "/events/event-avatr-chn-platform-launch-2022",
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});

test("renders metadata and relations for every news article", async ({ page }) => {
  const articles = [
    "zeekr-7x-launch",
    "geely-ex5-global-unveil",
    "avatr-11-global-launch",
    "byd-blade-battery-launch",
    "chn-platform-launch",
  ];

  for (const slug of articles) {
    await page.goto(`/news/${slug}`);
    await expect(page.locator("main article")).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Breadcrumb" }).getByText("News"),
    ).toHaveAttribute("href", "/news");
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('meta[property="article:published_time"]')).toHaveAttribute(
      "content",
      /.+/,
    );
    await expect(page.locator('meta[property="article:modified_time"]')).toHaveAttribute(
      "content",
      /.+/,
    );
    await expect(page.locator('meta[name="author"]')).toHaveAttribute("content", /.+/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(`/news/${slug}$`),
    );
    await expect(page.getByText("Article context")).toBeVisible();
    expect(await page.getByTestId("article-author").count()).toBeGreaterThan(0);
    expect(await page.getByTestId("article-topic").count()).toBeGreaterThan(0);
    expect(await page.getByTestId("related-entity").count()).toBeGreaterThan(0);
    expect(await page.getByTestId("related-event").count()).toBeGreaterThan(0);
    expect(await page.getByTestId("source-item").count()).toBeGreaterThan(0);
    await expect(page.getByRole("heading", { name: "Related entities" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Related events" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Sources" })).toBeVisible();
    await expect(page.getByText("CAA Editorial")).toBeVisible();
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toMatch(/\b(?:data|content|build|assets)\/[^\s`]+/);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      await page.evaluate(() => document.documentElement.clientWidth),
    );
  }
});

test("returns a not-found page for an unknown vehicle", async ({ page }) => {
  const response = await page.goto("/vehicles/not-a-real-vehicle");
  expect(response?.status()).toBe(404);
  await expect(page.getByText(/not found/i).first()).toBeVisible();
});

test("returns a not-found page for an unknown news article", async ({ page }) => {
  const response = await page.goto("/news/not-a-real-article");
  expect(response?.status()).toBe(404);
  await expect(page.getByText(/not found/i).first()).toBeVisible();
});

test("renders Phase 4 entity detail pages and stable relationships", async ({ page }) => {
  await page.goto("/vehicles/zeekr-7x");
  await expect(
    page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: "ZEEKR", exact: true }),
  ).toHaveAttribute("href", "/brands/zeekr");
  await expect(page.getByRole("link", { name: "Zeekr Group", exact: true })).toHaveAttribute(
    "href",
    "/manufacturers/zeekr-group",
  );
  await expect(
    page.getByRole("link", { name: /ZEEKR 800V \/ 3×800V Ecosystem/ }).first(),
  ).toHaveAttribute("href", "/technologies/zeekr-800v-system");
  await expect(page.getByTestId("media-placeholder")).toContainText("Media not available");

  for (const route of [
    { path: "/brands/zeekr", heading: "ZEEKR" },
    { path: "/manufacturers/zeekr-group", heading: "Zeekr Group" },
    { path: "/technologies/zeekr-800v-system", heading: /ZEEKR 800V/ },
    { path: "/events/event-zeekr-7x-china-launch-2024", heading: /ZEEKR 7X officially/ },
  ]) {
    await page.goto(route.path);
    await expect(page.getByRole("heading", { name: route.heading }).first()).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      new RegExp(route.path),
    );
    await expect(page.getByRole("contentinfo")).toBeVisible();
    if (route.path === "/manufacturers/zeekr-group") {
      const sectionNav = page.getByRole("navigation", { name: "Manufacturer sections" });
      await expect(sectionNav).toBeVisible();
      const productionLink = sectionNav.getByRole("link", { name: "Production" });
      await expect(productionLink).toHaveAttribute("href", "#production-context");
      await productionLink.click();
      await expect(page).toHaveURL(/#production-context$/);
      await expect(page.getByRole("heading", { name: "Production context" })).toBeVisible();
      await expect(
        page.getByText(
          /\d+ associated brands · \d+ vehicles · \d+ factories · \d+ production lines/,
        ),
      ).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      await page.evaluate(() => document.documentElement.clientWidth),
    );
  }
});

test("renders Technology taxonomy context and relationship empty state", async ({ page }) => {
  await page.goto("/technologies/byd-ctb");
  await expect(page.getByRole("heading", { name: /CTB/ })).toBeVisible();
  await expect(page.getByText("Kind")).toBeVisible();
  await expect(page.getByText("Energy Storage")).toBeVisible();
  await expect(page.getByText("Vehicle Structure")).toBeVisible();
  await expect(page.getByText("Battery Pack")).toBeVisible();
  await expect(page.getByText("Family", { exact: true })).toBeVisible();
  await expect(page.getByText("Structural Battery", { exact: true })).toHaveCount(2);
  await expect(page.getByText("2 vehicles · 0 events · 1 news · 1 sources")).toBeVisible();
  await expect(page.getByText("Legacy category")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Related technologies" })).toBeVisible();
  await expect(page.getByText("No related technologies collected")).toBeVisible();
  await expect(page.locator('a[href^="/technologies/"]')).toHaveCount(0);
});

test("renders paginated technologies and applies taxonomy filters", async ({ page }) => {
  await page.goto("/technologies");
  await expect(page.getByText("Showing 1–12 of 15 technologies")).toBeVisible();
  await expect(page.getByTestId("atlas-entity-card")).toHaveCount(12);
  const ctbCard = page.getByTestId("atlas-entity-card").filter({ hasText: "CTB (Cell-to-Body)" });
  await expect(ctbCard).toContainText("Energy Storage");
  await expect(ctbCard).toContainText("Vehicle Structure");
  await expect(ctbCard).toContainText("Battery Pack");
  await expect(ctbCard).toContainText("Structural Battery");
  await expect(page.getByRole("navigation", { name: "Technology pagination" })).toBeVisible();
  await expect(page.getByText("Previous", { exact: true })).toHaveAttribute(
    "aria-disabled",
    "true",
  );

  await page.goto("/technologies?page=2");
  await expect(page).toHaveURL(/\/technologies\?page=2$/);
  await expect(page.getByText("Showing 13–15 of 15 technologies")).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Technology pagination" }).getByText("2", { exact: true }),
  ).toHaveAttribute("aria-current", "page");

  await page.goto("/technologies?domain=vehicle-structure");
  await expect(page.getByText("Showing 1–2 of 2 technologies")).toBeVisible();
  await expect(page.getByRole("link", { name: /CTB/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /CTC/ })).toBeVisible();
  await expect(page.getByTestId("atlas-entity-card")).toHaveCount(2);

  const filters = page.locator('form[action="/technologies"]');
  await filters.getByRole("searchbox", { name: "Search technologies" }).fill("battery");
  await filters.getByRole("combobox", { name: "Family" }).selectOption("lfp");
  await filters.getByRole("button", { name: "Apply filters" }).click();
  await expect(page).toHaveURL(/\/technologies\?q=battery&family=lfp$/);
  await expect(page.getByText("Showing 1–2 of 2 technologies")).toBeVisible();
  await expect(page.getByRole("link", { name: /Blade Battery/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Short Blade Battery/ })).toBeVisible();
  await expect(page.getByRole("link", { name: "Clear filters" })).toHaveAttribute(
    "href",
    "/technologies",
  );

  await page.goto("/technologies?q=not-a-technology");
  await expect(page.getByText("No technologies match these filters")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Technology pagination" })).toHaveCount(0);
});

test("renders vehicle classification and sourced architecture context", async ({ page }) => {
  await page.goto("/vehicles/byd-sealion-7");
  await expect(page.getByText("Classification")).toBeVisible();
  await expect(page.getByText("BEV", { exact: true })).toBeVisible();
  await expect(page.getByText("Architecture")).toBeVisible();
  await expect(page.getByText("Battery Electric")).toBeVisible();
  await expect(page.getByText("Motor positions: Unknown")).toBeVisible();

  await page.goto("/vehicles/denza-d9");
  await expect(page.getByText("PHEV", { exact: true })).toBeVisible();
  await expect(page.getByText("BEV", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /DM-i Super Hybrid/ })).toBeVisible();

  await page.goto("/vehicles/deepal-s05");
  await expect(page.getByText("Architecture")).toBeVisible();
  await expect(page.getByText("Unknown", { exact: true }).first()).toBeVisible();
});

test("browses the brand product hierarchy with filters and without duplicate vehicles", async ({
  page,
}) => {
  await page.goto("/brands/byd");
  await expect(
    page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Brand" }),
  ).toHaveAttribute("href", "/brands");
  const dynasty = page.getByRole("button", { name: /Dynasty.*series.*vehicles/i });
  const ocean = page.getByRole("button", { name: /Ocean.*series.*vehicles/i });
  await expect(dynasty).toHaveAttribute("aria-expanded", "true");
  await expect(ocean).toHaveAttribute("aria-expanded", "false");
  await ocean.click();
  await expect(dynasty).toHaveAttribute("aria-expanded", "false");
  await expect(ocean).toHaveAttribute("aria-expanded", "true");

  await page.getByPlaceholder("Search vehicles...").fill("Seal");
  await expect(page.getByText(/Showing 2 of 6 vehicles/)).toBeVisible();
  await expect(page.locator('a[href="/vehicles/byd-seal"]')).toHaveCount(1);
  await expect(page.locator('a[href="/vehicles/byd-sealion-7"]')).toHaveCount(1);

  await page.getByLabel("Powertrain").selectOption("phev");
  await expect(page.getByText(/Showing 0 of 6 vehicles/)).toBeVisible();
  await expect(page.getByText("No vehicles match these filters.")).toBeVisible();
  await page.getByRole("button", { name: /Clear filters/ }).click();
  await expect(page.getByText(/Showing 6 of 6 vehicles/)).toBeVisible();
});

test("parent breadcrumbs return to their collection pages", async ({ page }) => {
  const cases = [
    { detail: "/brands/byd", parent: "Brand", collection: "/brands" },
    {
      detail: "/manufacturers/zeekr-group",
      parent: "Manufacturer",
      collection: "/manufacturers",
    },
    {
      detail: "/technologies/zeekr-800v-system",
      parent: "Technology",
      collection: "/technologies",
    },
    {
      detail: "/events/event-zeekr-7x-china-launch-2024",
      parent: "Event",
      collection: "/events",
    },
  ];

  for (const item of cases) {
    await page.goto(item.detail);
    await page
      .getByRole("navigation", { name: "Breadcrumb" })
      .getByRole("link", { name: item.parent, exact: true })
      .click();
    await expect(page).toHaveURL(new RegExp(`${item.collection}$`));
  }
});

test("manufacturer hierarchy does not duplicate vehicle links", async ({ page }) => {
  await page.goto("/manufacturers/byd-company");
  const vehicleLinks = page.locator('a[href^="/vehicles/"]');
  const hrefs = await vehicleLinks.evaluateAll((links) =>
    links.map((link) => link.getAttribute("href")),
  );
  expect(hrefs.length).toBeGreaterThan(0);
  expect(new Set(hrefs).size).toBe(hrefs.length);
});

test("returns a not-found page for unknown Phase 4 entities", async ({ page }) => {
  for (const path of [
    "/brands/not-a-brand",
    "/manufacturers/not-a-manufacturer",
    "/technologies/not-a-technology",
    "/events/not-an-event",
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(page.getByText(/not found/i).first()).toBeVisible();
  }
});

test("searches from the global Command and navigates to an exact result", async ({ page }) => {
  if (test.info().project.name !== "chromium") {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByTestId("mobile-search-trigger").click();
  } else {
    await page.goto("/");
    await page.getByTestId("search-trigger").click();
  }

  await expect(page.getByRole("dialog")).toBeVisible();
  const input = page.locator('input[aria-label="Search atlas"]');
  await expect(input).toBeFocused();
  await input.fill("ZEEKR");
  await expect(page.getByRole("option").first()).toContainText("ZEEKR");
  await expect(page.getByRole("option").first()).toContainText("Brand");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/brands\/zeekr$/);
  await expect(page.getByRole("heading", { name: "ZEEKR", exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});

test("opens Search with the keyboard and restores focus on close", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");

  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(
    page.getByRole("button", {
      name: test.info().project.name === "chromium" ? "Search" : "Open menu",
    }),
  ).toBeFocused();
});

test("opens mobile Search from the menu with the keyboard", async ({ page }) => {
  test.skip(test.info().project.name === "chromium", "Mobile navigation interaction");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  const mobileSearch = page.getByTestId("mobile-search-trigger");
  await mobileSearch.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
});

test("supports search page filters, empty results, and API responses", async ({ page }) => {
  const apiResponse = await page.request.get("/api/search?q=极氪&type=vehicle");
  expect(apiResponse.ok()).toBeTruthy();
  const apiPayload = await apiResponse.json();
  expect(apiPayload.type).toBe("vehicle");
  expect(apiPayload.results).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: "zeekr-7x", href: "/vehicles/zeekr-7x" }),
    ]),
  );

  const invalidTypeResponse = await page.request.get("/api/search?q=ZEEKR&type=unknown");
  expect(invalidTypeResponse.ok()).toBeTruthy();
  expect((await invalidTypeResponse.json()).type).toBe("all");

  const longQuery = "x".repeat(250);
  const longQueryResponse = await page.request.get(`/api/search?q=${longQuery}`);
  expect((await longQueryResponse.json()).query).toHaveLength(200);

  await page.goto("/search?q=ZEEKR");
  await expect(page).toHaveTitle(/Search/);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/search$/);
  await expect(page.getByTestId("search-result").first()).toBeVisible();
  await page.getByTestId("search-filter-vehicle").click();
  await expect(page).toHaveURL(/\/search\?q=ZEEKR&type=vehicle$/);
  await expect(page.getByText("ZEEKR 7X", { exact: true })).toBeVisible();
  await expect(page.getByText("ZEEKR", { exact: true })).not.toBeVisible();

  await page.goto("/search?q=not-a-real-record");
  await expect(page.getByText("No results found")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => document.documentElement.clientWidth),
  );
});
