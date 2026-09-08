# China Auto Atlas --- Manufacturer Seed Records v0.1

**Verified:** 2026-09-08\
**Scope:** Manufacturer / corporate-group Level 0 seed data\
**Entities:** BYD, Zhejiang Geely Holding Group, SAIC Motor, China
Changan Automobile Group, Xiaomi Corporation

Canonical records: `data/entities/manufacturers/`.

## Purpose

This seed pack is deliberately small. It is intended to pressure-test
the Atlas entity model with real corporate structures before
vehicle-level collection expands.

The records follow four rules:

1.  Separate holding groups, listed manufacturers, operating companies
    and brands where the evidence requires it.
2.  Do not invent a value merely to fill a schema field.
3.  Keep unresolved semantics explicit (`unknown`) and explain the reason in a note.
4.  Attach primary-source records at collection time.

## Seed format boundary

These files are research seed records, not the final canonical application dataset.
They use YAML for manual collection; the MVP application may normalize them into JSON through a build or import step.

`seed_brand_portfolio` is intentionally provisional. It records brands mentioned by a source but does not assert ownership, control, operation, or manufacturing relationships.
Formal brand relationships should be added only after the corresponding Brand records exist and each relationship has its own evidence.

The normalized manufacturer records use:

```text
schema_version: 1
type: manufacturer
industry_role: ...
official_sites: ...
source_ids: ...
evidence_status: ...
```

## Important schema findings

### 1. `Manufacturer` is too broad as a single semantic type

The five seeds already contain several distinct entity roles:

-   corporate / holding group;
-   listed automotive manufacturer;
-   state-owned automotive group;
-   diversified technology company with an automotive business.

A future schema should probably separate `entity_type` from
`industry_role`, and model relationships explicitly rather than forcing
every corporate entity into `manufacturer`.

### 2. Group → operating company → brand needs first-class relationships

Examples:

-   Zhejiang Geely Holding Group → Geely Auto Group → Geely Auto / Lynk
    & Co / ZEEKR.
-   China Changan Automobile Group → operating/listed companies → AVATR
    / DEEPAL / CHANGAN NEVO.
-   Xiaomi Corporation → automotive operating/manufacturing entity →
    Xiaomi Auto.

Recommended future relationship fields include `parent_of`,
`subsidiary_of`, `operates_brand`, `manufactures_for`,
`equity_interest_in`, plus validity dates and evidence.

### 3. `founded` needs semantics

SAIC demonstrates why a naked year is unsafe. Industrial origin,
predecessor formation, legal incorporation, restructuring and
stock-market listing can all have different dates. Prefer typed
milestones such as `legal_entity_founded`,
`automotive_business_started`, `restructured_at`, and `listed_at`.

### 4. Brand portfolios should not imply identical ownership

The first-pass `automotive_brand_portfolio` field is useful for
discovery, but it must not replace relationship records. A controlled
brand, joint venture, equity investment and directly operated marque are
different facts.

## Seed record index

-   `manufacturers/byd-company.yaml`
-   `manufacturers/zhejiang-geely-holding.yaml`
-   `manufacturers/saic-motor.yaml`
-   `manufacturers/china-changan-automobile-group.yaml`
-   `manufacturers/xiaomi-corporation.yaml`
-   `sources/manufacturer-sources.yaml`

## Collection status

  --------------------------------------------------------------------------------------------------------
  Entity        Identity    Founded         HQ          Brand        Primary    Main unresolved issue
                            semantics                   portfolio    sources    
  ------------- ----------- --------------- ----------- ------------ ---------- --------------------------
  BYD Company   Confirmed   Confirmed       Confirmed   Seed-level   Yes        Dynasty/Ocean
  Limited                                               confirmed               Brand-vs-Series modeling

  Zhejiang      Confirmed   Confirmed       Confirmed   Seed-level   Yes        Group vs Geely Auto Group
  Geely Holding                                         confirmed               relationships
  Group                                                                         

  SAIC Motor    Confirmed   Intentionally   Confirmed   Seed-level   Yes        Legal founding-date
  Corporation               unresolved                  confirmed               semantics; JV
  Limited                                                                       relationships

  China Changan Confirmed   Confirmed       Confirmed   Seed-level   Yes        Group vs
  Automobile                                            confirmed               listed/operating-company
  Group                                                                         hierarchy

  Xiaomi        Confirmed   Confirmed       Needs       Seed-level   Yes        Automotive
  Corporation                               stronger HQ                         operating/manufacturing
                                            citation                            legal entity
  --------------------------------------------------------------------------------------------------------

## Next recommended pass

Do **not** expand to dozens of manufacturers yet. Add explicit corporate
relationship records for these five seeds, then maintain the current
Brand records. This tests whether the schema can represent
ownership, operation and manufacturing without flattening them into a
single `brands:` array.
