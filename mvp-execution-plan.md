# China Auto Atlas — MVP Execution Plan

> Version: 0.1
> Status: P0 local vertical slice implemented; MVP expansion and deployment pending
> Scope: First public MVP vertical slice

## Current implementation status

| Area | Status | Notes |
| --- | --- | --- |
| Project foundation | Complete | Next.js, pnpm, Tailwind, shadcn configuration, lint, format, and build pipeline are in place. |
| JSON runtime and repositories | Complete | Typed entity, relationship, source, media, news, event, and basic search access paths are covered. |
| Shared application shell | Partial | Header, container, states, focus styles, and responsive checks exist; breadcrumbs and a dedicated mobile menu remain. |
| News → vehicle → source slice | Complete | Five news documents build; the ZEEKR 7X path is covered by unit and E2E tests. |
| Full entity expansion | Not started | Brand, manufacturer, technology, and event detail pages remain MVP expansion work. |
| Search | Partial | Phase 1 basic SearchRepository is available; generated search index, ranking, and Command interface remain Phase 5 work. |
| Local release quality gate | Partial | Build and automated checks pass; manual accessibility/content/media review remains. |
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
- [ ] Add a dedicated mobile navigation menu.
- [ ] Add the `/vehicles` index page using `vehicleRepository`.
- [ ] Point the Header `Vehicles` link to `/vehicles` instead of a specific vehicle.
- [ ] Replace Vehicle page placeholder relationship links with real Brand and Manufacturer routes when those pages exist.
- [x] Add `PageContainer` and layout primitives.
- [ ] Add breadcrumbs.
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
- [ ] Add news pagination strategy.
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
- [ ] Add `VehicleCard` using shadcn/ui Card primitives.
- [x] Add specification table using shadcn/ui Table primitives.
- [x] Add grouped market specification sections.
- [x] Add timeline component using existing primitives.
- [x] Add `EvidenceBadge`.
- [x] Add source list and source details.
- [x] Add vehicle page.
- [ ] Add brand page.
- [ ] Add manufacturer page.
- [ ] Add technology page.
- [x] Add event presentation.
- [x] Add related-news sections.
- [ ] Add media placeholders for non-approved assets.

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

- [ ] Generate a search index during build.
- [ ] Normalize Chinese/English names and aliases.
- [ ] Extend the basic SearchRepository with a generated index and full Phase 5 ranking behavior.
- [ ] Add shadcn/ui Command-based search interface.
- [ ] Add keyboard navigation.
- [ ] Add result type labels.
- [ ] Add empty results state.
- [ ] Add direct navigation to result pages.
- [ ] Add search smoke tests.

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
- [ ] Add structured metadata where useful.
- [ ] Verify heading hierarchy.
- [ ] Verify keyboard navigation.
- [ ] Verify focus states.
- [ ] Verify color contrast.
- [ ] Verify image alt text.
- [x] Verify reduced motion implementation.
- [x] Verify mobile layout.
- [x] Verify not-found page through E2E.
- [ ] Verify error page behavior.
- [ ] Verify no unapproved media is presented as approved.

### Phase 7 — Final MVP deployment and release

Goal: deploy and verify the reproducible public MVP after all local quality gates have passed.

Vercel is the selected deployment provider. The deployment must run data validation and the production build from a clean
checkout. This phase starts only after Phase 0–6 are complete.

Checklist:

- [ ] Choose hosting provider.
- [ ] Confirm Vercel project and repository connection.
- [ ] Configure production build command.
- [ ] Configure pnpm and Python/PyYAML installation.
- [ ] Configure preview deployments.
- [ ] Configure environment variables if required.
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
