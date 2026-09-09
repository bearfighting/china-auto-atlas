# China Auto Atlas — MVP Execution Plan

> Version: 0.1
> Status: P0 local vertical slice implemented; MVP expansion and deployment pending
> Scope: First public MVP vertical slice

## Current implementation status

| Area | Status | Notes |
| --- | --- | --- |
| Project foundation | Complete | Next.js, pnpm, Tailwind, shadcn configuration, lint, format, and build pipeline are in place. |
| JSON runtime and repositories | Complete | Typed entity, relationship, source, media, news, event, and basic search access paths are covered. |
| Shared application shell | Complete | Header, desktop/mobile navigation, collection entry points, breadcrumbs, footer, states, focus styles, and responsive checks are in place. |
| News → vehicle → source slice | Complete | Five news documents build; the ZEEKR 7X path is covered by unit and E2E tests. |
| Full entity expansion | Complete | Vehicle, brand, manufacturer, technology, and event detail pages are statically generated with repository-backed relationships. |
| Search | Complete | Generated search index, deterministic ranking, local search API, `/search` results page, and Command interface are in place. |
| Local release quality gate | Complete | SEO, structured metadata, accessibility scans, responsive checks, media safety checks, and reproducible local quality checks are complete. |
| Information architecture and discoverability | Complete | Entity collection pages, Atlas navigation, homepage discovery, sitemap, responsive checks, and E2E coverage are complete. |
| Vercel deployment | Not started | Deliberately reserved for the final MVP phase. |

This document translates `roadmap.md` into an implementation sequence. It is an execution checklist, not a replacement
for the product vision, content model, schema, or UI specification.

## 1. MVP outcome

The MVP must prove this complete loop:

```text
News → Entity → Structured facts → Sources → History
```

A visitor should be able to:

- open the homepage;
- browse recent news;
- read a news article;
- follow an article to a vehicle, brand, manufacturer, technology, or event;
- inspect structured facts with market and time context;
- see the supporting sources;
- navigate related entities and historical events;
- search the initial dataset;
- understand loading, empty, error, unknown, and unavailable-media states.

## 2. MVP boundaries

### Included

- responsive web application;
- homepage;
- news index and news detail;
- vehicle detail;
- brand detail;
- manufacturer detail;
- technology detail;
- event and timeline presentation;
- source and evidence presentation;
- basic entity search;
- local generated JSON data indexes;
- local approved or explicitly pending media handling;
- static generation where practical;
- production build and deployment.

### Deferred

- database;
- CMS or editorial admin panel;
- user accounts and comments;
- real-time prices or sales;
- exhaustive trims and option packages;
- graph database;
- GraphQL;
- advanced recommendations;
- mobile application;
- public API;
- full collaborative editorial workflow.

## 3. Working rules

- Follow `AGENTS.md` for all implementation decisions.
- Use Next.js App Router and TypeScript.
- Use Tailwind CSS and shadcn/ui.
- Prefer existing shadcn/ui components; add custom components only for domain-specific patterns.
- Keep YAML and Markdown as source files and generated JSON as build output.
- Pages and components consume Repository/Application Service results, never source paths.
- Do not invent missing facts or dates.
- Run data validation and build checks before each milestone handoff.
- Keep commits focused and use conventional prefixes.
- Vercel project setup, Preview deployment, domain configuration, and Production release belong to the final MVP stage;
  they must not block P0 local development or CI validation.

## 4. Phase plan

### Phase 0 — Project initialization

Goal: create a runnable Next.js application with the agreed frontend stack.

Deliverables:

- Next.js App Router project;
- TypeScript configuration;
- Tailwind CSS configuration;
- shadcn/ui setup;
- shared CSS variables and design tokens;
- linting and formatting;
- local development command;
- production build command;
- environment variable template if needed;
- README development instructions.

Acceptance criteria:

- `pnpm dev` starts the application;
- `pnpm build` succeeds from a clean checkout;
- the root page renders through the application shell;
- shadcn/ui components can be imported and styled with project tokens;
- no data source is read directly by a page component.

Checklist:

- [x] Initialize Next.js App Router and TypeScript.
- [x] Add Tailwind CSS.
- [x] Initialize shadcn/ui configuration.
- [x] Define color, type, spacing, radius, and shadow tokens.
- [x] Add base layout and font strategy.
- [x] Add lint and format commands.
- [x] Add `pnpm data:validate`.
- [x] Add `pnpm data:build`.
- [x] Add `prebuild` integration for data validation/build.
- [x] Add a minimal README for local development.

### Phase 1 — Data runtime and repositories

Goal: expose the existing generated indexes through typed application interfaces.

Deliverables:

- TypeScript domain types;
- JSON index loader;
- repository interfaces;
- JSON repository implementations;
- reference resolution helpers;
- locale fallback helper;
- unknown and missing-value helpers;
- search index preparation.

Acceptance criteria:

- a page can load a vehicle by ID and slug;
- related brand, manufacturer, technology, event, media, and source records resolve correctly;
- missing records return `null` or an empty collection according to the repository contract;
- the implementation does not import YAML or read arbitrary files at request time.

Checklist:

- [x] Define dedicated `Brand`, `Manufacturer`, `Organization`, `Technology`, and `Platform` types.
- [x] Define `Vehicle`, `Event`, `Source`, `Media`, and `News` types.
- [x] Define `MarketSpecification` and timeline types.
- [x] Define `VehicleRepository`.
- [x] Define `BrandRepository`.
- [x] Define `ManufacturerRepository`.
- [x] Define `TechnologyRepository`.
- [x] Define `EventRepository`.
- [x] Define `SourceRepository`.
- [x] Define `NewsRepository`.
- [x] Define `SearchRepository` with the Phase 1 basic deterministic contract.
- [x] Implement generated-index loading.
- [x] Implement localized-name fallback.
- [x] Implement relationship resolution for entities, vehicles, events, news, sources, media, and the P0 vehicle/news slice.
- [x] Implement source and media resolution helpers.
- [x] Add repository unit tests.

### Phase 2 — Application shell and design primitives

Goal: establish consistent navigation and responsive layout.

Deliverables:

- site header;
- desktop and mobile navigation;
- primary collection entry points, including the vehicles index;
- search entry point;
- page container;
- typography hierarchy;
- breadcrumbs;
- footer;
- loading, empty, error, and unknown state components.

Acceptance criteria:

- all primary pages share the same shell;
- primary navigation links resolve to collection or index pages, not a specific entity detail page;
- keyboard focus is visible;
- layout works at mobile, tablet, and desktop widths;
- the UI does not depend on color alone to communicate state.

Checklist:

- [x] Add `Header` using shadcn/ui primitives where applicable.
- [x] Add a dedicated mobile navigation menu.
- [x] Add the `/vehicles` index page using `vehicleRepository`.
- [x] Point the Header `Vehicles` link to `/vehicles` instead of a specific vehicle.
- [x] Remove misleading Vehicle relationship links until Brand and Manufacturer routes exist.
- [x] Add the visual Search entry point with behavior deferred to Phase 5.
- [x] Add `PageContainer` and layout primitives.
- [x] Add breadcrumbs.
- [x] Add the global Footer.
- [x] Add route-level loading behavior.
- [x] Add `EmptyState`.
- [x] Add `ErrorState`.
- [x] Add `UnknownState`.
- [x] Add accessible focus styles.
- [x] Add reduced-motion behavior.
- [x] Add responsive layout checks through mobile E2E coverage.

### Phase 3 — News vertical slice

Goal: prove the editorial-to-entity flow.

Deliverables:

- homepage news section;
- news index;
- news detail page;
- article metadata;
- related entities;
- related events;
- source list;
- evidence status display.

Acceptance criteria:

- all five current news documents render;
- each published article exposes author, topic, date, related entities, and sources;
- entity links resolve to valid pages;
- source records are visible without exposing internal file paths;
- article pages have title, description, canonical URL, and social metadata.

Checklist:

- [x] Add news route and static parameters.
- [x] Add news pagination strategy through a repository-level `listPage` contract; UI pagination remains deferred until the dataset requires it.
- [x] Add article header.
- [x] Add article body rendering for the current plain-text Markdown paragraphs.
- [x] Add author and topic labels.
- [x] Add related entities.
- [x] Add related event summary.
- [x] Add source list.
- [x] Add evidence status.
- [x] Add metadata and Open Graph fields.
- [x] Add not-found handling.

### Phase 4 — Entity pages

Goal: provide the first useful atlas experience beyond articles.

Implementation order:

```text
Vehicle → Brand → Manufacturer → Technology → Event
```

Deliverables:

- entity headers;
- vehicle specifications and market context;
- lifecycle timeline;
- brand portfolio;
- manufacturer relationships;
- technology usage and related vehicles;
- source and evidence sections;
- related news.

Acceptance criteria:

- all current seed entities can render without broken references;
- market-specific values show market, variant, unit, test cycle, and date where available;
- empty and unknown fields are intentional and readable;
- timelines do not interpret `null` as “did not happen”;
- every published factual section can lead to its source records.

Checklist:

- [x] Add shared `EntityHeader`.
- [x] Add `VehicleCard` using shadcn/ui Card primitives.
- [x] Add specification table using shadcn/ui Table primitives.
- [x] Add grouped market specification sections.
- [x] Add timeline component using existing primitives.
- [x] Add `EvidenceBadge`.
- [x] Add source list and source details.
- [x] Add vehicle page.
- [x] Add brand page.
- [x] Add manufacturer page.
- [x] Add technology page.
- [x] Add event detail page.
- [x] Add event presentation.
- [x] Add related-news sections.
- [x] Add media placeholders for non-approved assets.

### Phase 5 — Search and discovery

Goal: make the seed dataset discoverable without external search infrastructure.

MVP search should support:

- Chinese and English names;
- aliases where available;
- vehicles, brands, manufacturers, technologies, and news;
- exact entity matching;
- basic text matching;
- empty results and keyboard navigation.

Acceptance criteria:

- search results are deterministic;
- entity results are distinguishable from news results;
- exact entity matches rank above general text matches;
- search works without a database or external service.

Checklist:

- [x] Generate a search index during build.
- [x] Normalize Chinese/English names and aliases.
- [x] Extend the basic SearchRepository with a generated index and full Phase 5 ranking behavior.
- [x] Add shadcn/ui Command-based search interface.
- [x] Add keyboard navigation.
- [x] Add result type labels.
- [x] Add empty results state.
- [x] Add direct navigation to result pages.
- [x] Add search smoke tests.

### Phase 6 — Quality, accessibility, SEO, and local release candidate

Goal: make the vertical slice trustworthy and produce a reproducible local release candidate. Public deployment remains in
Phase 7.

Checklist:

- [x] TypeScript check passes.
- [x] Data validation passes.
- [x] Data build passes.
- [x] Production build passes.
- [x] Critical pages have metadata.
- [x] Add sitemap.
- [x] Add robots configuration.
- [x] Add canonical URLs.
- [x] Add structured metadata where useful.
- [x] Verify heading hierarchy.
- [x] Verify keyboard navigation.
- [x] Verify focus states.
- [x] Verify color contrast.
- [x] Verify image alt text.
- [x] Verify reduced motion implementation.
- [x] Verify mobile layout.
- [x] Verify not-found page through E2E.
- [x] Verify error page behavior.
- [x] Verify no unapproved media is presented as approved.

### Phase 6.5 — Information architecture, discoverability, and homepage polish

Goal: close the navigation and discovery gap before deployment. The application must expose its entity model through
consistent collection entry points instead of requiring users to reach entity detail pages through news relationships or
search results.

This phase does not introduce new entity types, a database, external search, or deployment configuration. It keeps the
existing detail routes and repositories, and adds collection-level discovery around them.

Checklist:

- [x] Add `/brands` collection page backed by `brandRepository.list()`.
- [x] Add `/manufacturers` collection page backed by `manufacturerRepository.list()`.
- [x] Add `/technologies` collection page backed by `technologyRepository.list()`.
- [x] Add `/events` collection page backed by `eventRepository.list()`.
- [x] Display meaningful cards or lists with stable links to every current detail route.
- [x] Add empty, unknown, and loading states to collection pages where applicable.
- [x] Add collection-page metadata, canonical URLs, breadcrumbs, and Open Graph metadata.
- [x] Add all public collection and detail routes to the sitemap; keep `/search` excluded.
- [x] Add a flat desktop primary navigation for News, Vehicles, Brands, Manufacturers, Technologies, Events, and Search.
- [x] Add the same flat navigation list to the mobile Sheet menu below the desktop breakpoint.
- [x] Preserve active navigation states, keyboard access, Escape behavior, and visible focus states.
- [x] Add a homepage Atlas/discovery entry that explains Vehicles, Brands, Manufacturers, Technologies, Events, and Sources.
- [x] Ensure the homepage has a bottom-aligned Footer with no avoidable trailing whitespace.
- [x] Improve homepage information hierarchy for the Hero and latest-news cards without adding unsupported content.
- [x] Verify desktop, tablet, and 390px mobile layouts have no horizontal overflow.
- [x] Add unit and E2E coverage for collection navigation, collection-to-detail links, metadata, and empty states.
- [x] Run the complete local quality gate after the information architecture changes.

Phase 6.5 acceptance commands:

```bash
python3 scripts/data_pipeline.py validate
python3 scripts/data_pipeline.py build
pnpm typecheck
pnpm lint
pnpm format:check
pnpm test
pnpm build
pnpm test:e2e
```

Phase 6.5 is complete when:

- all four entity collection pages are accessible from the global primary navigation;
- every current Brand, Manufacturer, Technology, and Event detail record has a discoverable route;
- desktop and mobile navigation expose the same flat entity links without dead links;
- the homepage communicates both the news entry point and the broader atlas structure;
- collection pages, detail pages, sitemap, metadata, and tests remain repository-backed;
- the local release quality gate passes with no regression.

### Phase 7 — Final MVP deployment and release

Goal: deploy and verify the reproducible public MVP after all local quality gates have passed.

Vercel is the selected deployment provider. The deployment must run data validation and the production build from a clean
checkout. This phase starts only after Phase 0–6.5 are complete.

Checklist:

- [ ] Choose hosting provider.
- [ ] Confirm Vercel project and repository connection.
- [ ] Configure production build command.
- [ ] Configure pnpm and install Python/PyYAML into a build-local virtualenv.
- [ ] Configure preview deployments.
- [ ] Configure `NEXT_PUBLIC_SITE_URL` for the production domain; Vercel URL variables and localhost are safe fallbacks.
- [ ] Configure domain and HTTPS.
- [ ] Configure sitemap and robots URLs.
- [ ] Add build failure visibility.
- [ ] Test a clean production deployment.
- [ ] Verify all routes and static assets.
- [ ] Verify source links.
- [ ] Verify media fallback behavior.
- [ ] Record the release commit and data version.

## 5. Definition of Done

The MVP is ready for public review when:

- the application builds from a clean checkout;
- the data validator and build pipeline pass;
- the homepage, news, vehicle, brand, manufacturer, technology, and event flows work;
- the core seed content renders without broken references;
- sources and evidence states are visible;
- unknown, empty, loading, error, and missing-media states are handled;
- the site is usable on mobile and desktop;
- keyboard navigation and basic accessibility checks pass;
- SEO metadata and crawl configuration exist;
- the deployment is reproducible;
- no unapproved media is represented as approved content;
- all changes are committed with focused messages.

## 6. Suggested first implementation batch

Start with one complete path before expanding breadth:

```text
ZEEKR 7X news article
        ↓
ZEEKR 7X vehicle page
        ↓
ZEEKR brand page
        ↓
Geely organization page
        ↓
timeline and sources
```

Once this path works, reuse the same repository and UI patterns for the remaining seed data.
