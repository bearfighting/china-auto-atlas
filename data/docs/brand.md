# China Auto Atlas — Brand Seed v0.1

Verified: **2026-09-08**

This pack formalizes the current ten Brand entities:

Canonical records: `data/entities/brands/`.

**BYD, DENZA, YANGWANG, FANGCHENGBAO, Geely Auto, ZEEKR, DEEPAL, AVATR, Xiaomi Auto, MG.**

## Design rules used

- Brand is a first-class entity; manufacturer files should not remain the canonical brand-name list.
- Corporate ownership, control and operation are represented as relationship records rather than a single `manufacturer_id`.
- Relationship dates are only populated when the selected primary source supports them.
- `founded` is not guessed. A public brand launch/naming milestone may be used when explicitly documented; otherwise the field stays unresolved.
- Brand market presence does **not** imply every vehicle is sold in that market.
- `seed_vehicle_names` are discovery placeholders, not foreign keys. They must be replaced by `vehicle_ids` only after Vehicle entities exist.
- Marketing language has been normalized into short editorial descriptions.
- Dynasty and Ocean are deliberately **not** Brand entities in this pass.

## Files

```text
brands/
  byd.yaml
  denza.yaml
  yangwang.yaml
  fangchengbao.yaml
  geely-auto.yaml
  zeekr.yaml
  deepal.yaml
  avatr.yaml

relationships/
  manufacturer-brand-relationships.yaml

events/
  brand-events.yaml

sources/
  brand-sources.yaml
```

## Important model findings

### Corporate entities represented in the current seed

The relationship pass uses these corporate nodes:

- `geely-auto-group`
- `zeekr-group`
- `chongqing-changan-automobile`
- `catl` (if Atlas permits non-manufacturer corporate entities)

They are represented as Organization or Manufacturer entities rather than being flattened into a Brand record.

### Relationship vocabulary

The current seed uses `parent_of`, `owns`, `controls`, `operates`, and `invested_in`.
Before scaling, define exact semantics for each term. In particular, `controls` must not be treated as identical to 100% ownership.

### Historical relationships

DENZA and AVATR prove that relationship history needs validity intervals and events.
When an exact effective date is not supported by the selected source, the record preserves the fact but leaves the date unresolved.

### Brand vs product series

For MVP:

```text
BYD (Brand)
├── Dynasty (product_series candidate)
└── Ocean (product_series candidate)
```

Do not create Dynasty/Ocean as Brands merely because they are prominent product families.

## Recommended next step

1. Validate relationship semantics and IDs as new entities are added.
2. Render the current ten Brand pages from the generated JSON index.
3. Verify search and cross-linking.
4. Replace any remaining discovery-only names with real `vehicle_ids`.
