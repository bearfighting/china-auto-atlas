# China Auto Atlas — Agent and Development Guide

This file defines the working rules for contributors and coding agents in this repository.

## Project purpose

China Auto Atlas is an editorial and structured-data platform about China's automotive industry.
News is an input; traceable entities, relationships, events, market facts, sources, and history are the output.

## Source of truth

- Product direction: `vision.md`
- UI and visual system: `ui-design.md`
- Conceptual content model: `content-model.md`
- Implementable schema: `data-schema.md`
- Data access boundary: `data-access-architecture.md`
- Editorial rules: `editorial-guidelines.md`

When documents disagree, preserve the current canonical data layout and update the documentation rather than introducing a second convention.

## Current data architecture

```text
YAML authoring files
        ↓
Python validation/build pipeline
        ↓
build/data-index.json and build/content-index.json
        ↓
Repository/application services
        ↓
Next.js pages and components
```

- YAML under `data/` and `content/` is the editable source.
- Generated files under `build/` are runtime build artifacts and must not be edited manually.
- UI code must not import files from `data/` directly or depend on filesystem paths.
- Stable IDs, slugs, relationship semantics, market codes, dates, evidence states, and source references are storage-independent contracts.
- Missing optional facts are unknown; they must not be rendered as proof that something did not happen.
- Preserve market, variant, unit, test cycle, effective date, and evidence status for factual values.

## Canonical data layout

```text
data/entities/{manufacturers,organizations,brands,vehicles,platforms,technologies}
data/market-specifications
data/relationships
data/events
data/sources
data/media
data/manifests
data/docs
content/news
content/taxonomy
```

Use references by stable ID instead of copying complete related records. Add a source when introducing or changing a canonical fact. Use `null` when a lifecycle fact has not been sufficiently collected; do not guess.

## Validation commands

Run these before handing off data or application changes:

```bash
python3 scripts/data_pipeline.py validate
python3 scripts/data_pipeline.py build
```

The validator checks YAML/frontmatter, duplicate IDs, cross-file references, media references, downloaded media files, and unregistered files under `assets/`.

After the frontend exists, the expected project checks should remain available through package scripts, with the data validation/build step running before a production build.

## Frontend technology rules

The planned frontend stack is:

```text
Next.js App Router
TypeScript
Tailwind CSS
shadcn/ui
Radix UI primitives through shadcn/ui
Static generation where practical
```

### shadcn-first component policy

- Prefer existing shadcn/ui components and compose them before writing a new component.
- Do not recreate generic buttons, dialogs, sheets, dropdowns, tabs, tables, badges, inputs, commands, or tooltips.
- Use Tailwind utilities and CSS variables for layout and design tokens.
- Add a custom component only when it represents a real China Auto Atlas domain pattern, such as `VehicleCard`, `Timeline`, `SpecificationTable`, `SourceList`, or `EvidenceBadge`.
- Domain components should compose shadcn/ui primitives and should not contain storage-specific logic.
- Do not add a component library only to solve a problem already covered by shadcn/ui.
- Preserve keyboard navigation, visible focus states, semantic HTML, and meaningful labels.

Use the design tokens and information hierarchy in `ui-design.md`; do not accept shadcn defaults as the product visual language without adapting them.

## Data access and application boundaries

Repositories should expose small storage-independent operations such as:

```text
getById
getBySlug
list
getRelatedEntities
getRelatedNews
search
```

Single-record misses return `null`; collection misses return an empty list. Localized names fall back from the requested locale to English, then to the first available name.

Pages and components consume repository/application-service results. They do not parse YAML, read JSON files directly, or resolve source paths.

## Media and rights

- Register media in `data/media/media-items.yaml` before adding it to `assets/`.
- Every local asset must be registered; every `downloaded` record must point to an existing local file.
- `needs_review` means the asset must not be treated as approved for public reuse.
- Keep meaningful alt text and source-page metadata.
- Do not generate or substitute an unregistered image just to fill a visual slot; use a documented placeholder.

## Editorial and factual standards

- Do not invent missing values, dates, ownership, production, or market availability.
- Distinguish manufacturer claims from independently confirmed facts.
- Do not render range without its test standard when known.
- Preserve source and correction history.
- Unknown and uncertain states are valid product states and must have intentional UI treatment.

## Scope discipline

The MVP should prove this vertical slice first:

```text
News → Entity → Structured facts → Sources → History
```

Do not introduce a database, GraphQL layer, graph database, exhaustive trim system, user accounts, or complex editorial backend unless the current MVP requirements demonstrate the need.

## Change workflow

1. Inspect the relevant design and data documentation before changing a convention.
2. Make the smallest coherent change that preserves stable IDs and existing references.
3. Run validation and build checks.
4. For UI changes, verify loading, empty, error, unknown, mobile, keyboard, and reduced-motion states where applicable.
5. Keep commits focused and use conventional prefixes such as `docs:`, `data:`, `feat:`, `fix:`, `build:`, and `test:`.

Do not modify unrelated user work or rewrite history without explicit instruction.
