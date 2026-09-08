# China Auto Atlas — Structured Data

```text
data/
├── entities/{manufacturers,organizations,brands,vehicles,platforms,technologies}
├── market-specifications/
├── relationships/
├── events/
├── sources/
├── media/
├── manifests/
└── docs/
```

- `entities/` contains one stable entity per file.
- `market-specifications/` contains market-specific snapshots.
- `relationships/` is the authoritative graph layer; entity relationship IDs are indexes.
- `events/` stores dated milestones and changes.
- `sources/` is globally indexed and source IDs must be unique.
- `media/` stores image metadata and source-page links; binary assets are added only after rights review.
- `docs/` contains collection notes and is not loaded as data.
- `manifests/` defines loader entry points.

The loader must discover records by `type` and stable `id`, not by collection directory names.
