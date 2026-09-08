# China Auto Atlas — Product Roadmap

> Version: 0.2  
> Status: MVP preflight in progress

## Phase 0 — Foundation

Finalize document responsibilities, visual tokens, core components, file-based schemas, validation, repository interfaces,
the YAML-to-JSON build adapter, and the first seed dataset.

Current status: data validation and build are passing; the seed dataset contains the MVP minimum content. Remaining work is
to close the repository contract, media registry consistency, dependency setup, and the first application shell.

Exit criteria: `python3 scripts/data_pipeline.py validate` and `python3 scripts/data_pipeline.py build` pass, and one
vehicle/news vertical slice renders through the repository adapter without direct access to `data/`.

## Phase 1 — MVP Vertical Slice

Prove the core loop:

```text
News → Entity → Structured facts → Sources → History
```

Include the homepage, news index and article page, vehicle page, brand and manufacturer pages, technology page, basic search, related links, source display, and loading/empty/error/unknown states.

Suggested minimum content: 10 vehicles, 3 manufacturers, 5 brands, 5 news articles, and at least one source for every published article.

## Phase 2 — Content Expansion

Add more vehicles, market availability, price history, launch events, timelines, and selected technology coverage.

## Phase 3 — Search and Discovery

Add aliases, Chinese/English search, filters, exact entity matching, related-content improvements, and generated search indexes.

## Phase 4 — Editorial Operations

Add drafts, review status, structured-data review, source comparison, correction history, and lightweight editorial tooling.

## Phase 5 — Database Migration

Consider a database only when concurrent editing, real-time filtering, access control, import pipelines, or build scale creates a real need. Replace the storage adapter while preserving IDs, domain objects, relationships, source links, and historical semantics.

## Explicitly Deferred

User accounts, comments, community features, marketplace functionality, real-time pricing, complex recommendations, exhaustive trim databases, graph databases, mobile apps, and B2B APIs are outside the MVP.
