# Technology Model Baseline

**Date:** 2026-09-11  
**Branch:** `main`  
**Baseline commit:** `02e95c2` (`docs: add technology model implementation plan`)  
**Purpose:** Record the Technology Model baseline and subsequent compatibility verification.

The generated-index counts below include the post-PR audit correction that makes
validated supplier entities available to runtime repositories.

## Validation environment

- Node.js: `v26.2.0`
- pnpm: `11.5.2`
- Python: repository pipeline executed successfully
- Next.js: `15.5.9`

The repository declares Node `24.x`; the current environment is Node `26.2.0`. pnpm emitted an unsupported-engine warning, but all checks completed successfully. This PR does not change the declared engine or dependency configuration.

## Data counts

Generated from `build/data-index.json` and `build/search-index.json` after `pnpm data:build`:

- Technology files: 15
- Technology entities: 15
- Technology slug fields: 0
- Vehicle entities: 25
- All entities: 76
- Relationships: 37
- Events: 71
- Sources: 111
- Market specifications: 20
- Media records: 28
- News documents: 23
- Search entries: 81
- Search Technology entries: 15
- Unique search IDs: 81

Current Technology IDs:

```text
avatr-800v-sic
byd-blade-battery
byd-ctb
byd-ctc
byd-disus-p
byd-disus-x
byd-dm-i
byd-dm-p
byd-dmo
byd-e4-platform
byd-super-e-platform
geely-11-in-1-electric-drive
geely-short-blade-battery
zeekr-800v-system
zeekr-golden-battery
```

## Existing data contracts

- Technology object type: `technology`
- Legacy classification fields: `category`, `secondary_categories`
- Vehicle → Technology field: `technology_ids`
- Technology → Vehicle reverse field: `vehicle_ids`
- Technology relations: existing generic records under `data/relationships/`; five sourced Technology → Family relations are currently indexed
- Technology route: `/technologies/:slug`
- Technology list route: `/technologies`
- Current Technology URL resolution: `slug ?? id`; all current Technology URLs therefore use the Technology ID
- Technology-to-Technology relations: none currently collected; the five Technology → Family relations are not Technology-to-Technology relations
- Taxonomy routes: none
- Taxonomy search type: none
- Taxonomy sitemap entries: none
- Search types: `vehicle`, `brand`, `manufacturer`, `technology`, `news`

## Search and public index checks

- [x] Search index contains Technology entries.
- [x] Search index IDs are unique.
- [x] Search index contains no platform entries.
- [x] Search index contains no taxonomy entries.
- [x] Existing Technology search results resolve to `/technologies/:slug`.
- [x] Taxonomy is not present in the current public entity index.

Verification sources:

- Repository and generated-index assertions: `src/lib/data/repositories.test.ts`
- Public route, search and Technology navigation assertions: `tests/e2e/p0.spec.ts`
- Sitemap, accessibility and reduced-motion assertions: `tests/e2e/quality.spec.ts`

## Relationship checks

- [x] Technology IDs are unique across Technology files.
- [x] Technology slugs are unique where present.
- [x] Vehicle `technology_ids` references resolve.
- [x] Technology `vehicle_ids` references resolve.
- [x] Vehicle and Technology reverse indexes pass the existing validator.
- [x] Existing source, event, news, developer and supplier references pass validation.

## Commands and results

| Command | Result |
| --- | --- |
| `pnpm data:validate` | PASS — 413 IDs, 953 references |
| `pnpm data:build` | PASS — 76 entities, 71 events, 23 documents, 28 media records |
| `pnpm typecheck` | PASS |
| `pnpm lint` | PASS |
| `pnpm format:check` | PASS |
| `pnpm test` | PASS — 7 files, 58 tests |
| `pnpm build` | PASS — 166 static pages generated |
| `pnpm test:e2e` | NOT VERIFIED — Playwright server/browser run hangs before reporting results in the current environment |
| `pnpm quality:check` | NOT RUN — it includes the same E2E gate, which is blocked by the environment hang |

The first sandboxed E2E attempt could not bind `127.0.0.1:3001` because local server listening was restricted. The same suite was rerun with the required local-server permission and passed. This is an execution-environment constraint, not an application failure.

The E2E server logged Next.js `NoFallbackError` messages while exercising expected unknown-route cases; the corresponding not-found tests passed.

## Compatibility assertions for later PRs

- Existing Technology IDs, slugs and URLs must remain unchanged.
- Vehicle `technology_ids` and Technology `vehicle_ids` must retain their current meaning.
- Existing Technology, Vehicle, Brand and Manufacturer repository queries must not regress.
- Technology remains a public search type.
- Future taxonomy records must use separate data-index arrays and must not enter `entities`.
- Future taxonomy records must not enter search, sitemap or standalone routes.
- Legacy `category` and `secondary_categories` remain until migration is complete.
- Missing facts remain unknown; they must not be rendered as negative facts.
- New canonical facts require sources or an explicit unknown state.

## PR 0 scope confirmation

- No taxonomy files were added.
- No Technology or Vehicle TypeScript types were changed.
- `scripts/data_pipeline.py` was not changed in PR 0; the current build includes the later audit fix for supplier entities.
- No Technology or Vehicle YAML records were migrated.
- No Technology relations were added.
- No page, repository, search or sitemap logic was changed.
- No generated `build/*.json` files were manually edited.
