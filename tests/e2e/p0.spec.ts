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
  await expect(page.getByRole("link", { name: "ZEEKR 7X", exact: true }).first()).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Breadcrumb" }).getByText("Vehicles"),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.getByTestId("search-trigger")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
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
  await expect(page.getByRole("link", { name: /ZEEKR launches the 7X/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /Geely unveils the EX5/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /AVATR launches the AVATR 11/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /BYD introduces the Blade Battery/i })).toBeVisible();
  await expect(page.getByRole("link", { name: /jointly launch the CHN/i })).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Breadcrumb" }).getByText("News"),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("contentinfo")).toBeVisible();
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
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      await page.evaluate(() => document.documentElement.clientWidth),
    );
  }
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
