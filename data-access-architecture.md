# China Auto Atlas — Data Access Architecture

> Version: 0.2  
> Status: MVP implementation contract

## Boundary

Pages and UI components consume domain data through repositories or application services. They must not import JSON files directly or depend on storage paths.

```text
Pages / Components
        ↓
Application services
        ↓
Repository interfaces
        ↓
YAML source files (authoring)
        ↓
Validation and build pipeline
        ↓
JSON runtime indexes (MVP)
        ↓
JSON repository adapter
        ↓
Database repository adapter (future)
```

## Initial Repositories

```text
VehicleRepository
BrandRepository
ManufacturerRepository
TechnologyRepository
NewsRepository
EventRepository
SourceRepository
SearchRepository
```

Common operations should remain small:

```text
getById
getBySlug
list
getRelatedEntities
getRelatedNews
search
```

Do not introduce a generic query language or GraphQL layer for the MVP.

## File-based MVP Adapter

YAML is the canonical authoring format for the MVP. Generated JSON is a build artifact and must not be edited manually.
Relationships should use stable IDs; repeating complete related objects creates synchronization problems.

```text
data/entities/vehicles/zeekr-7x.yaml
data/entities/brands/zeekr.yaml
data/sources/vehicle-sources.yaml

build/data-index.json
build/content-index.json
```

The pipeline reads YAML, validates syntax and references, and writes global JSON indexes. Repositories read those indexes;
pages and components never import files from `data/` or depend on source paths. Physical directories are authoring details.
The indexes resolve references across entities, relationships, events, market specifications, sources, media, and content.

The build pipeline should read files, validate schemas, validate references, generate a search index, and generate pages.

## Stability Rules

The following are storage-independent contracts:

* stable IDs;
* independent slugs;
* schema versions;
* domain object shapes;
* relationship types;
* market codes;
* date and evidence semantics;
* source and correction references.

## Repository contract

The application layer should expose storage-independent operations:

```text
getById(id)
getBySlug(slug)
list(filters)
getRelatedEntities(id)
getRelatedNews(id)
search(query)
```

Missing records return `null` for single-record operations and an empty list for collection operations. Missing optional
facts remain `null` and must be rendered as unknown, not as a negative assertion. Localized names fall back from the
requested locale to `en`, then to the first available name.

## Database Migration

The database should initially replace only the adapter. It should not force a redesign of the content model or UI. Before switching production reads, compare IDs, references, record counts, and representative rendered pages between the JSON and database implementations.
