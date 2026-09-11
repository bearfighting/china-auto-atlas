# Data Schema

> **Project:** China Auto Atlas
> **Status:** Initial Draft
> **Version:** 0.1
> **Last Updated:** 2026-09

---

# 1. Purpose

This document translates the conceptual model defined in `content-model.md` into an implementable data schema.

It does not define a final database architecture.

The same schema concepts should be usable with:

* JSON;
* YAML;
* TypeScript;
* Markdown frontmatter;
* relational databases;
* future APIs.

The primary goal is:

> **Create a simple initial schema that preserves identity, evidence, time, market context, and future extensibility.**

The first implementation should remain small enough to maintain manually.

---

# 2. Design Goals

The schema should support:

1. stable entity identity;
2. localized names;
3. relationships between entities;
4. market-specific data;
5. historical changes;
6. evidence status;
7. source traceability;
8. uncertainty;
9. editorial content relationships;
10. gradual migration from files to a database.

The schema should avoid premature complexity.

---

# 3. Initial Storage Model

For the MVP, a file-based structure is recommended.

```text
/data
  /entities
    /manufacturers
    /organizations
    /brands
    /product-lines
    /vehicle-series
    /vehicles
    /platforms
    /technologies
  /market-specifications
  /relationships
  /events
  /sources
  /manifests
  /media

/content
  /news
  /features
  /interviews
```

The repository uses YAML as the canonical authoring format. The build pipeline normalizes these records into
`build/data-index.json` and `build/content-index.json`; application code must consume the generated indexes through
repositories rather than reading source files directly.

Example:

```text
/data/entities/manufacturers/zhejiang-geely-holding.yaml
/data/entities/brands/zeekr.yaml
/data/entities/vehicles/zeekr-7x.yaml
/data/entities/technologies/800v-architecture.yaml

/data/events/2026-08-12-zeekr-7x-launch.yaml

/content/news/2026-08-12-zeekr-7x-launch.md
```

JSON may be used instead of YAML.

YAML is recommended initially because it is easier to edit manually.

---

# 4. Stable IDs

Every structured object must have a stable ID.

Example:

```yaml
id: zeekr-7x
```

IDs should:

* use lowercase;
* use ASCII characters;
* use hyphens;
* remain human-readable;
* remain stable after creation.

Recommended format:

```text
geely-holding
zeekr
zeekr-7x
sea-platform
800v-architecture
catl
```

IDs should not depend on:

* URL location;
* translated display names;
* current ownership;
* model year;
* temporary marketing terms.

---

# 5. Slugs

A public URL slug may initially match the ID:

```yaml
id: zeekr-7x
slug: zeekr-7x
```

However:

> `id` and `slug` are conceptually different.

A slug may change for SEO or presentation reasons.

An ID should not.

---

# 6. Common Entity Fields

Most entities should share a common base structure.

```yaml
id: zeekr
type: brand

slug: zeekr

status: active

names:
  en: ZEEKR
  zh-CN: 极氪

description:
  en: Premium electric vehicle brand.
  zh-CN: ...

created_at: 2026-09-07
updated_at: 2026-09-07
```

Recommended common fields:

```text
id
type
slug
status
names
aliases
description
created_at
updated_at
sources
```

---

# 7. Localized Names

Localized naming should use language tags.

Example:

```yaml
names:
  en: ZEEKR 7X
  zh-CN: 极氪 7X
```

Optional:

```yaml
aliases:
  - Zeekr 7X
  - 极氪7X
```

The schema should distinguish:

```text
official English name
official Chinese name
editorial translation
alias
```

if necessary in the future.

For the MVP, a simple localized `names` object is sufficient.

---

# 8. Entity Status

Entity-level status should use controlled values.

Recommended initial values:

```text
active
inactive
discontinued
announced
unknown
```

Example:

```yaml
status: active
```

Entity status should describe the entity itself.

It should not replace market-specific availability.

---

# 9. Manufacturer Schema

Example:

```yaml
id: geely-holding
type: manufacturer
slug: geely-holding

names:
  en: Geely Holding
  zh-CN: 吉利控股集团

status: active

founded:
  date: 1986
  precision: year

headquarters:
  country: CN
  region: Zhejiang
  city: Hangzhou

official_sites:
  - language: en
    url: https://example.com

brands:
  - brand_id: zeekr
    relationship: owns

sources:
  - source_id: source-geely-about
```

Recommended fields:

```text
id
names
status
founded
headquarters
official_sites
brands
parent
relationships
sources
```

Do not duplicate large quantities of related entity data inside the Manufacturer record.

Prefer IDs and relationships.

---

# 10. Brand Schema

Example:

```yaml
id: zeekr
type: brand

names:
  en: ZEEKR
  zh-CN: 极氪

status: active

launched:
  date: 2021
  precision: year

owners:
  - manufacturer_id: geely-holding
    relationship: owns
    valid_from: 2021-01-01
    valid_to: null

markets:
  - CN
  - SE
  - NL

sources:
  - source_id: source-zeekr-about
```

Recommended fields:

```text
id
names
status
launched
owners
operators
markets
vehicles
sources
```

Ownership relationships should generally include historical validity periods.

## Product Line and Vehicle Series Schema

Product Line and Vehicle Series are optional context entities between a Brand and Vehicle. They are not independent public page
types in the MVP.

```yaml
id: byd-dynasty
type: product_line
brand_id: byd
names:
  en: Dynasty
  zh-CN: 王朝
aliases:
  - Dynasty Network
status: active
source_ids:
  - src-example
evidence_status: confirmed
```

```yaml
id: byd-qin-series
type: vehicle_series
brand_id: byd
product_line_id: byd-dynasty
names:
  en: Qin
  zh-CN: 秦
aliases:
  - Qin series
status: active
source_ids:
  - src-example
evidence_status: confirmed
```

Vehicle records may contain:

```yaml
brand_id: byd
product_line_id: byd-dynasty
series_id: byd-qin-series
```

`product_line_id` and `series_id` are optional. Each referenced ID must exist, and Brand consistency is validated by the data
pipeline. When a Series has a Product Line, a Vehicle referencing both must use the same Product Line. Parent records do not
maintain reverse `series_ids` or `vehicle_ids` arrays.

Dates use the existing value/precision/evidence/source structure when collected. Product Line and Series descriptions and
relationships require their own sources; Vehicle sources are not automatically inherited.

# Factory and Production Line Schema

Factory and Production Line belong to the manufacturing context and must not be confused with Product Line. Production Line uses
`factory_id` as its canonical parent reference.

Factory records may contain:

```text
id
names
aliases
location
operator_ids
owner_ids
status
opened_at
source_ids
evidence_status
```

Production Line records may contain:

```text
id
names
factory_id
status
opened_at
closed_at
vehicle_ids
technology_ids
reported_capacity
source_ids
evidence_status
```

```yaml
id: chongqing-avatr-12-line
type: production_line
factory_id: chongqing-plant
vehicle_ids:
  - avatr-12
technology_ids: []
reported_capacity:
  value: 100000
  unit: vehicles_per_year
  valid_from: 2025
  date_precision: year
  evidence_status: reported
  source_ids:
    - src-example
```

Capacity preserves value, unit, validity, date precision, evidence status, and sources. Factory does not maintain reverse production
line IDs; reverse lists are derived by repositories. These entities do not create independent public pages in the MVP.

---

# 11. Relationship Schema

Relationships should use a reusable structure.

Example:

```yaml
id: rel-geely-owns-zeekr
type: relationship
from_id: geely-holding
to_id: zeekr
relationship: owns

valid_from: 2021-01-01
valid_to: null

evidence_status: confirmed

source_ids:
  - source-geely-annual-report
```

Recommended relationship types initially include:

```text
owns
controls
operates
parent_of
jointly_owns
manufactures
manufactures_for
supplies
uses
based_on
developed_by
developed_for
jointly_developed_by
strategic_partner_of
produces
successor_of
predecessor_of
```

Do not create dozens of highly specific relationship types too early.

---

# 12. Vehicle Schema

Vehicle records should initially represent the durable vehicle model.

Example:

```yaml
id: zeekr-7x
type: vehicle

names:
  en: ZEEKR 7X
  zh-CN: 极氪 7X

brand_id: zeekr

manufacturer_ids:
  - geely-auto

segment: mid-size-suv
body_style: suv

powertrain_types:
  - bev

status: active

first_announced_at: 2024-07-01
first_launched_at: 2024-09-20

platform_id: sea-platform

technologies:
  - 800v-architecture

market_specs:
  - market: CN
    spec_id: zeekr-7x-cn-2026

sources:
  - source-zeekr-7x
```

Vehicle records should avoid storing rapidly changing market values directly at the root level.

---

# 13. Vehicle Classification

Recommended controlled fields:

```yaml
segment: mid-size-suv
body_style: suv

powertrain_types:
  - bev
```

Initial `body_style` values may include:

```text
sedan
hatchback
suv
coupe
wagon
mpv
pickup
van
sports-car
other
```

Initial powertrain values:

```text
ice
hev
phev
erev
bev
fcev
```

These lists may evolve.

---

# 14. Generation

Generation support should exist conceptually but may remain optional in the MVP.

Example:

```yaml
generations:
  - id: zeekr-7x-gen1
    number: 1
    valid_from: 2024-09-20
    valid_to: null
```

If a vehicle has only one generation, the implementation should not require unnecessary duplication.

---

# 15. Revision

A revision represents a meaningful product update.

Example:

```yaml
revisions:
  - id: zeekr-7x-2026
    name: 2026 Update

    announced_at: 2026-08-01
    effective_from: 2026-08-12

    generation_id: zeekr-7x-gen1
```

Revision may later contain links to changed market specifications.

---

# 16. Market Specification

Market-specific information should live in a separate structured object.

Example:

```yaml
id: zeekr-7x-cn-2026

vehicle_id: zeekr-7x
revision_id: zeekr-7x-2026

market: CN

effective_from: 2026-08-12
effective_to: null

availability: available

currency: CNY
```

This model allows different market versions to coexist.

---

# 17. Market Codes

Markets should use standardized identifiers where possible.

Prefer ISO 3166-1 alpha-2 country codes:

```text
CN
CA
US
DE
FR
GB
AU
TH
BR
```

Regional groupings may use controlled internal identifiers:

```text
EU
GCC
SEA
GLOBAL
```

Regional identifiers should not be confused with official country codes.

---

# 18. Availability Schema

Availability should be structured.

Example:

```yaml
availability:
  status: available
  announced_at: 2026-05-01
  pre_sale_at: 2026-07-01
  launched_at: 2026-08-12
  deliveries_started_at: 2026-08-25
```

Recommended status values:

```text
rumored
reported
announced
planned
pre_sale
available
delivery_started
discontinued
not_announced
not_available
unknown
```

Avoid using only one generic launch date.

---

# 19. Price Schema

Prices should preserve context.

Example:

```yaml
price:
  amount: 249900
  currency: CNY
  type: msrp
  tax_included: true
```

Recommended price types:

```text
msrp
launch_price
pre_sale_price
dealer_price
promotional_price
subsidized_price
estimated
```

Price may also include:

```yaml
valid_from: 2026-08-12
valid_to: null
```

The file-based MVP uses a `prices` list inside each market-specification variant. When an official source gives only a
lineup-level range and does not map each price to a named variant, use `price_range` instead of inventing a trim mapping:

```yaml
price_range:
  min:
    amount: 65800
    currency: CNY
    price_type: limited_offer
  max:
    amount: 99800
    currency: CNY
    price_type: limited_offer
```

for historical tracking.

---

# 20. Price History

Multiple prices should be preserved.

Example:

```yaml
price_history:
  - amount: 249900
    currency: CNY
    type: msrp
    valid_from: 2026-08-12
    valid_to: 2027-01-31

  - amount: 239900
    currency: CNY
    type: msrp
    valid_from: 2027-02-01
    valid_to: null
```

Do not overwrite old canonical prices.

---

# 21. Range Schema

Driving range must include the test standard.

Example:

```yaml
range:
  value: 720
  unit: km
  standard: CLTC
```

Valid standards may include:

```text
CLTC
WLTC
WLTP
EPA
NEDC
unknown
```

If the value is estimated:

```yaml
range:
  value: 560
  unit: km
  standard: EPA-equivalent
  evidence_status: estimated
```

Estimated values should not replace official ones.

---

# 22. Battery Schema

Initial battery data may remain embedded in market specifications or trims.

Example:

```yaml
battery:
  capacity:
    value: 100
    unit: kWh
    basis: nominal

  chemistry: nmc

  supplier_ids:
    - catl
```

Possible capacity basis values:

```text
gross
usable
nominal
unknown
```

Battery supplier should support uncertainty.

Example:

```yaml
supplier:
  value: catl
  evidence_status: reported
```

---

# 23. Motor and Power Schema

Example:

```yaml
powertrain:
  layout: dual-motor-awd

  motors:
    - axle: front
      power:
        value: 165
        unit: kW

    - axle: rear
      power:
        value: 310
        unit: kW

  combined_power:
    value: 475
    unit: kW
```

Do not automatically add motor values to infer combined power unless methodology allows it.

Manufacturer-provided combined values should be preferred.

---

# 24. Charging Schema

Example:

```yaml
charging:
  architecture:
    voltage_class: 800V

  dc:
    max_power:
      value: 420
      unit: kW

  ac:
    max_power:
      value: 11
      unit: kW
```

Charging claims such as:

> 10–80% in 10.5 minutes

should preserve the exact conditions.

Example:

```yaml
charging_test:
  from_soc: 10
  to_soc: 80

  duration:
    value: 10.5
    unit: minute

  evidence_status: claimed
```

---

# 25. Dimensions Schema

Example:

```yaml
dimensions:
  length:
    value: 4825
    unit: mm

  width:
    value: 1930
    unit: mm

  height:
    value: 1666
    unit: mm

  wheelbase:
    value: 2925
    unit: mm
```

Units must always be explicit.

---

# 26. Trim Schema

Example:

```yaml
id: zeekr-7x-cn-2026-long-range-awd

market_spec_id: zeekr-7x-cn-2026

name:
  en: Long Range AWD
  zh-CN: 长续航四驱版

status: available

price:
  amount: 269900
  currency: CNY
  type: msrp

battery:
  capacity:
    value: 100
    unit: kWh

range:
  value: 705
  unit: km
  standard: CLTC
```

The MVP should only model trims when they materially affect major specifications.

---

# 27. Technology Schema

Example:

```yaml
id: zeekr-800v-system
type: technology
kind: branded

names:
  en: ZEEKR 800V / 3×800V Ecosystem
  zh-CN: 极氪800V / 3×800V生态

domain_ids:
  - electrical-architecture
category_ids:
  - high-voltage-architecture
family_ids: []

# Legacy classification fields remain during migration.
category: electrical-architecture
secondary_categories: []

description:
  en: ...

status: active

vehicle_ids:
  - zeekr-7x

source_ids:
  - src-zeekr-group-tech
  - src-zeekr-7x
evidence_status: confirmed
```

The current Technology records use `domain_ids`, `category_ids`, and `family_ids` for controlled taxonomy references. The legacy
`category` and `secondary_categories` fields remain during migration and must not be silently reinterpreted. Technology-to-Vehicle
references use `vehicle_ids`; related entities are resolved through repositories rather than copied into fields such as
`related_vehicles` or `related_platforms`.

Legacy category values may include:

```text
battery
charging
electrical-architecture
powertrain
chassis
manufacturing
adas
software
thermal-management
materials
```

---

# 28. Proprietary Technology

Manufacturer-specific technology should be modeled separately when meaningful.

Example:

```yaml
id: byd-cell-to-body
type: technology

parent_technology_id: cell-to-body

developer_ids:
  - byd

proprietary: true
```

This separates:

```text
generic technology concept
```

from:

```text
manufacturer-specific implementation
```

---

# 29. Platform Schema

Example:

```yaml
id: sea-platform
type: platform

names:
  en: Sustainable Experience Architecture
  zh-CN: SEA 浩瀚架构

developer_ids:
  - geely-holding

status: active

powertrain_support:
  - bev

voltage_architectures:
  - 400v
  - 800v

vehicles:
  - zeekr-001
  - zeekr-7x

sources:
  - source-sea-platform
```

Platform modeling should remain practical rather than exhaustive.

---

# 30. Event Schema

Event is one of the most important objects.

Vehicle entities may expose a compact lifecycle index while the full event records remain in `data/events/`:

```yaml
timeline:
  announcement_event_id: event-example-announced
  preorder_event_id: null
  launch_event_id: event-example-launched
  production_start_event_id: event-example-production
  delivery_start_event_id: event-example-delivery
  market_entry_event_ids: []
```

`null` means that the project has not yet collected a sufficiently supported event. It must not be interpreted as proof
that the stage did not occur.

Example:

```yaml
id: 2026-08-12-zeekr-7x-launch

type: event
event_type: vehicle_launch

occurred_at: 2026-08-12

subjects:
  - type: vehicle
    id: zeekr-7x

market: CN

changes:
  - availability
  - price
  - trims

evidence_status: confirmed

sources:
  - source-zeekr-launch

  related_document_ids:
  - news-2026-zeekr-7x-launch
```

Event IDs should normally include enough context to remain readable.

---

# 31. Event Types

Initial controlled event types:

```text
vehicle_announced
vehicle_pre_sale_started
vehicle_launched
vehicle_delivery_started
vehicle_updated
vehicle_discontinued

brand_launched
brand_restructured
brand_discontinued

factory_announced
factory_opened
factory_expanded
factory_closed

technology_announced
technology_deployed

market_entry_announced
market_entry
market_exit

export_started

company_acquisition
company_merger
company_restructuring
```

This vocabulary should grow only when repeated editorial needs justify it.

---

# 32. Event Changes

The `changes` field should summarize which aspects of entity state were affected.

Example:

```yaml
changes:
  - price
  - battery
  - range
```

This is useful for:

* timelines;
* change tracking;
* downstream update automation.

The MVP does not need to represent every field-level diff.

---

# 33. Document Metadata

Editorial documents remain Markdown or MDX.

Example frontmatter:

```yaml
---
id: news-2026-08-12-zeekr-7x-launch

type: news

title: ZEEKR launches updated 7X in China

published_at: 2026-08-12
updated_at: 2026-08-12

authors:
  - wenfeng-xing

related_entities:
  - zeekr
  - zeekr-7x

related_events:
  - 2026-08-12-zeekr-7x-launch

sources:
  - source-zeekr-launch
---
```

Document body remains editorial prose.

---

# 34. Source Schema

Example:

```yaml
id: source-zeekr-7x-launch

type: source

publisher:
  name: ZEEKR
  entity_id: zeekr

title: ZEEKR 7X launch announcement

url: https://example.com

language: zh-CN

published_at: 2026-08-12
accessed_at: 2026-08-12
```

Recommended source types:

```text
manufacturer
supplier
government
regulator
financial_filing
technical_document
academic_paper
patent
direct_interview
field_observation
news_media
industry_media
independent_creator
social_media
community
anonymous
```

---

# 35. Source Identity

Do not create duplicate Source objects for the same document whenever practical.

If multiple claims reference the same official announcement:

```text
Claim A ─┐
Claim B ─┼──→ Source X
Claim C ─┘
```

rather than three duplicate sources.

---

# 36. Archived Sources

Long-term preservation is important.

The schema should anticipate:

```yaml
archive:
  url: ...
  archived_at: ...
```

or:

```yaml
local_copy:
  path: ...
```

The MVP does not need to automatically archive every external source.

But important primary sources should eventually be preserved where legally and technically appropriate.

---

# 37. Claim Schema

Claims are optional in the MVP but should have a defined format.

Example:

```yaml
id: claim-zeekr-7x-catl-battery

subject:
  type: vehicle
  id: zeekr-7x

predicate: battery_supplier

object:
  type: supplier
  id: catl

status: reported

created_at: 2026-08-10
verified_at: null

evidence:
  - source_id: source-media-x
    relation: supports
```

This claim should not automatically modify canonical Vehicle data.

---

# 38. Claim Status

Use the editorial vocabulary defined in `EDITORIAL-GUIDELINES.md`.

```text
confirmed
announced
claimed
reported
estimated
rumored
unknown
```

Do not create a separate incompatible confidence vocabulary in the data model.

---

# 39. Evidence Schema

Example:

```yaml
source_id: source-zeekr-regulatory-filing

relation: supports

notes: Filing identifies CATL subsidiary as battery supplier.
```

Initial evidence relationship values:

```text
supports
partially_supports
contradicts
```

This should remain simple initially.

---

# 40. Canonical Values

Most reader-facing entity values represent canonical knowledge.

A canonical value means:

> **China Auto Atlas's current best-supported representation.**

Where useful, canonical values may carry metadata.

Example:

```yaml
battery_supplier:
  value: catl
  evidence_status: confirmed
  source_ids:
    - source-regulatory-filing
  verified_at: 2026-08-12
```

However, using this wrapper for every basic field may become verbose.

Therefore the schema should support two levels.

---

# 41. Simple and Rich Values

### Simple Value

Use for stable, low-risk facts:

```yaml
body_style: suv
```

### Rich Value

Use when provenance, uncertainty, market, or time matters:

```yaml
battery_supplier:
  value: catl
  evidence_status: confirmed
  source_ids:
    - source-x
  verified_at: 2026-08-12
```

This prevents the schema from becoming unnecessarily heavy.

---

# 42. Null vs Unknown

The system should distinguish between:

```text
field does not apply
```

and:

```text
field applies but is unknown
```

Avoid ambiguous use of `null` when possible.

Example:

```yaml
battery_supplier:
  status: unknown
```

may be preferable to:

```yaml
battery_supplier: null
```

for important fields.

The exact implementation can remain lightweight in the MVP.

---

# 43. Dates

Avoid a generic `date` property where more precise semantics exist.

Prefer:

```text
announced_at
occurred_at
launched_at
published_at
effective_from
effective_to
verified_at
updated_at
```

Dates may use ISO 8601.

Example:

```yaml
launched_at: 2026-08-12
```

---

# 44. Date Precision

Automotive history frequently contains dates known only to the year or month.

Use:

```yaml
date: 2021
precision: year
```

or:

```yaml
date: 2026-08
precision: month
```

when exact dates are unavailable.

Do not invent `2021-01-01` simply because the storage system requires a full date.

---

# 45. Units

All measured values must include units unless the field definition makes the unit absolutely fixed.

Preferred:

```yaml
power:
  value: 310
  unit: kW
```

rather than:

```yaml
power_kw: 310
```

For frequently used simple fields, implementation may eventually choose suffix-based fields for convenience.

But the conceptual schema should preserve unit awareness.

---

# 46. Currency

Prices must include currency explicitly.

Use ISO 4217 codes:

```text
CNY
CAD
USD
EUR
GBP
AUD
```

Example:

```yaml
amount: 249900
currency: CNY
```

Currency-converted values should not replace original market prices.

---

# 47. Numbers

Numeric data should remain numeric.

Avoid:

```yaml
battery_capacity: "100 kWh"
```

Prefer:

```yaml
battery_capacity:
  value: 100
  unit: kWh
```

Similarly:

```yaml
price:
  amount: 249900
  currency: CNY
```

This makes future querying and comparisons possible.

---

# 48. Boolean Fields

Use boolean values only for truly binary states.

Good:

```yaml
proprietary: true
```

Poor:

```yaml
available_in_europe: false
```

because false may mean:

* not announced;
* announced but unavailable;
* discontinued;
* unknown.

Use an availability state instead.

---

# 49. Controlled Vocabularies

Controlled values should live in a shared schema directory.

Possible structure:

```text
/schema
  body-styles.yaml
  powertrain-types.yaml
  evidence-status.yaml
  event-types.yaml
  source-types.yaml
  availability-status.yaml
  technology-categories.yaml
```

This prevents spelling drift such as:

```text
plug-in-hybrid
plugin-hybrid
phev
PHEV
```

all representing the same concept.

---

# 50. Validation

All structured content should eventually be schema-validated.

Recommended options include:

```text
JSON Schema
Zod
TypeScript
```

A reasonable implementation is:

```text
YAML
   ↓
parse
   ↓
Zod validation
   ↓
TypeScript data
```

The source files remain human-editable.

Application code receives validated objects.

---

# 51. Schema Version

Structured records should support schema versioning.

Example:

```yaml
schema_version: 1
```

This makes future migrations safer.

A schema change should not require manually guessing which historical files use which structure.

---

# 52. File Naming

Suggested conventions:

```text
manufacturer:
  geely-holding.yaml

brand:
  zeekr.yaml

vehicle:
  zeekr-7x.yaml

technology:
  800v-architecture.yaml

event:
  2026-08-12-zeekr-7x-launch.yaml
```

Use stable IDs as filenames where practical.

---

# 53. Reference Integrity

References should use IDs.

Example:

```yaml
brand_id: zeekr
```

not:

```yaml
brand: ZEEKR
```

Application validation should eventually detect references to missing entities.

Example error:

```text
Vehicle zeekr-7x references unknown brand_id: zeeker
```

---

# 54. Avoid Circular Duplication

Do not aggressively duplicate relationships in both directions.

For example:

```yaml
vehicle:
  brand_id: zeekr
```

may be canonical.

The Brand page can derive its vehicle list by querying vehicles.

It is not necessarily necessary to maintain:

```yaml
brand:
  vehicles:
    - zeekr-7x
```

as separate manually synchronized data.

Prefer one authoritative direction where possible.

---

# 55. Derived Data

Values that can be reliably derived should generally not be manually duplicated.

Example:

```text
Brand → Vehicle list
```

can be derived from:

```text
Vehicle.brand_id
```

Similarly:

```text
Technology.related_vehicles
```

may be derived from Vehicle technology relationships.

The exact choice should be based on editing convenience and query performance.

For the MVP:

> Prefer avoiding manually maintained duplicate relationships.

---

# 56. Source of Truth

Every field should ideally have one authoritative storage location.

Example:

```text
Vehicle market price
→ Market Specification

not:
Vehicle root
+
Market Specification
+
News metadata
```

News can quote the price.

But structured canonical storage should have one authoritative representation.

---

# 57. Full Vehicle Example

A simplified first-version vehicle record might look like:

```yaml
schema_version: 1

id: zeekr-7x
type: vehicle
slug: zeekr-7x

names:
  en: ZEEKR 7X
  zh-CN: 极氪 7X

brand_id: zeekr

manufacturer_ids:
  - geely-auto

status: active

classification:
  segment: mid-size-suv
  body_style: suv
  powertrain_types:
    - bev

timeline:
  first_announced_at: 2024-07-01
  first_launched_at: 2024-09-20

platform_id: sea-platform

technology_ids:
  - 800v-architecture

market_specs:
  - id: zeekr-7x-cn-2026

    market: CN
    effective_from: 2026-08-12

    availability:
      status: available
      launched_at: 2026-08-12

    prices:
      - amount: 249900
        currency: CNY
        type: msrp

    trims:
      - id: long-range-rwd

        names:
          en: Long Range RWD

        battery:
          capacity:
            value: 100
            unit: kWh

          chemistry: nmc

        range:
          value: 720
          unit: km
          standard: CLTC

        powertrain:
          layout: single-motor-rwd

          combined_power:
            value: 310
            unit: kW

sources:
  - source-zeekr-7x-launch

created_at: 2026-09-07
updated_at: 2026-09-07
```

This is intentionally much simpler than the full conceptual model.

---

# 58. Full Event Example

```yaml
schema_version: 1

id: 2026-08-12-zeekr-7x-update-launch

type: event
event_type: vehicle_launched

occurred_at: 2026-08-12

subjects:
  - type: vehicle
    id: zeekr-7x

market: CN

changes:
  - price
  - battery
  - range
  - trims

evidence_status: confirmed

source_ids:
  - source-zeekr-7x-launch

document_ids:
  - news-2026-08-12-zeekr-7x-launch
```

---

# 59. Full Source Example

```yaml
schema_version: 1

id: source-zeekr-7x-launch

type: source

publisher:
  name: ZEEKR
  entity_id: zeekr

title: ZEEKR 7X launch announcement

language: zh-CN

url: https://example.com

published_at: 2026-08-12
accessed_at: 2026-08-12
```

---

# 60. MVP Schema

The first implementation should support only the data needed for early content.

Recommended MVP entities:

```text
Manufacturer
Brand
Vehicle
Technology
Event
Source
News
```

Recommended MVP relationships:

```text
Manufacturer → Brand
Brand → Vehicle
Vehicle → Technology
Event → Entity
News → Event
News → Entity
Source → News / Event / Entity
```

Recommended MVP vehicle data:

```text
Name
Brand
Manufacturer
Segment
Body style
Powertrain
Launch date
Market availability
Price
Battery
Range
Charging
Dimensions
Technology
Sources
```

This is sufficient for meaningful early pages.

---

# 61. Deferred Schema

The following should be designed conceptually but not necessarily implemented initially:

```text
Detailed Generation hierarchy
Detailed Revision hierarchy
Every Trim
Factory capacity history
Full Supplier graph
Full Claim/Evidence database
Battery as independent Entity
Motor as independent Entity
ADAS hardware component graph
Ownership percentages
Financial data
Sales time series
Production time series
VIN-level information
```

These should be introduced only when repeated content requirements justify them.

---

# 62. Migration Path

The file schema should be designed so that migration to a relational database remains straightforward.

Possible future mapping:

```text
Manufacturer YAML
      ↓
manufacturers table

Brand YAML
      ↓
brands table

Vehicle YAML
      ↓
vehicles table

Market Specs
      ↓
vehicle_market_specs table

Events
      ↓
events table

Sources
      ↓
sources table

Relationships
      ↓
entity_relationships table
```

The file format should therefore avoid structures that cannot reasonably be normalized later.

---

# 63. Suggested Future Relational Model

A future database may roughly contain:

```text
entities
manufacturers
brands
vehicles
technologies
platforms

entity_names
entity_relationships

vehicle_generations
vehicle_revisions
vehicle_market_specs
vehicle_trims
vehicle_prices

events
event_entities

documents
document_entities
document_events

sources

claims
claim_evidence
```

This is a migration direction, not an MVP implementation requirement.

---

# 64. Repository Structure

A possible initial repository structure:

```text
src/
content/
  news/
  features/
  interviews/

data/
  manufacturers/
  brands/
  vehicles/
  technologies/
  events/
  sources/

schema/
  manufacturer.ts
  brand.ts
  vehicle.ts
  technology.ts
  event.ts
  source.ts

  vocabularies/
    body-style.ts
    powertrain.ts
    evidence-status.ts
    event-type.ts
    availability.ts

lib/
  content/
  data/
  validation/
```

This structure keeps:

```text
editorial content
structured data
schema definitions
application code
```

separate.

---

# 65. Implementation Recommendation

For the initial Next.js / TypeScript implementation:

```text
Markdown / MDX
      +
YAML structured data
      ↓
Zod validation
      ↓
TypeScript
      ↓
Static page generation
```

This provides:

* easy manual editing;
* Git history;
* schema validation;
* deterministic builds;
* no initial database requirement;
* easy migration later.

## MVP Storage Decision

The MVP uses YAML as the canonical authoring format and generates JSON indexes during the build step.

Each major object should normally have its own file:

```text
data/
  manufacturers/*.json
  brands/*.json
  vehicles/*.json
  technologies/*.json
  events/*.json
  sources/*.json
```

Pages must not import source files directly. Generated JSON is an implementation detail of the MVP storage adapter.
The application should access generated structured-data indexes through repository interfaces so that a future database
adapter can replace the file-based adapter without changing page components.

The following should remain stable across storage implementations:

```text
stable IDs
slugs
schema versions
domain object shapes
relationship semantics
market codes
date and evidence semantics
```

The first repository methods should remain intentionally small:

```text
getById
getBySlug
list
getRelatedEntities
getRelatedNews
search
```

Do not introduce a generic query language or GraphQL layer until actual editorial and product requirements justify it.

---

# 66. Build-Time Validation

The build should fail when critical structured data is invalid.

Examples:

```text
Unknown brand reference
Invalid market code
Invalid availability status
Missing required ID
Duplicate entity ID
Invalid currency
Invalid range unit
Unknown technology reference
```

Editorial typos should not silently corrupt the knowledge graph.

---

# 67. Data Quality Checks

Beyond schema validation, future build checks may include:

```text
duplicate slugs
broken references
orphan entities
missing sources
conflicting current price periods
overlapping ownership periods
invalid effective date ranges
duplicate market specs
```

These are semantic validation rules rather than basic type validation.

---

# 68. Editorial Integration

The data schema must remain consistent with `EDITORIAL-GUIDELINES.md`.

For example:

A source reports:

```text
Vehicle X uses CATL battery.
```

If evidence state is:

```text
reported
```

the data model should not silently store:

```yaml
battery_supplier: catl
```

as confirmed canonical knowledge.

The schema should make editorial discipline technically possible.

---

# 69. Historical Integration

The schema must also remain consistent with `content-model.md` and the validation rules in
`scripts/data_pipeline.py`.

A price change should create:

```text
Event
+
new effective price period
```

rather than overwriting history.

A market launch should create:

```text
Event
+
availability state change
```

A corporate transfer should create:

```text
Event
+
new relationship validity period
```

The data model therefore preserves both:

> **state**

and:

> **change**

---

# 70. Guiding Principle

The schema should optimize for durable information rather than maximum normalization.

It should remain:

```text
simple enough to edit
structured enough to query
strict enough to trust
flexible enough to evolve
historical enough to preserve change
```

The initial schema does not need to describe the entire automotive industry.

It needs to make the first few hundred pieces of content accumulate into something more valuable than isolated pages.

The test for every schema decision should be:

> **Will this make the information easier to verify, preserve, connect, or understand five years from now?**

If not, the complexity may not be justified.

---

# Current Technology Model Implementation Contract

The implemented Technology model extends the original seed schema while preserving existing IDs, slugs, URLs, and legacy
classification fields.

## Technology

Current Technology records contain:

```yaml
kind: branded
domain_ids:
  - energy-storage
category_ids:
  - battery-pack
family_ids:
  - lfp
```

`kind` is one of `generic`, `branded`, `system`, `component`, or `process`. `domain_ids` and `category_ids` are required and
reference the corresponding taxonomy record types. `family_ids` is optional when evidence is insufficient. Existing `category`
and `secondary_categories` remain available during the migration window and are not reinterpreted as the new taxonomy.

## Taxonomy and index boundary

The four controlled registries are:

```text
technology_domains
technology_categories
technology_families
powertrain_architectures
```

Their records use the corresponding `technology_domain`, `technology_category`, `technology_family`, and
`powertrain_architecture` types. Categories require `domain_id` and may use `parent_id: null` or a Category ID.

Taxonomy records are emitted into their own arrays in `data-index.json`. They are not members of `entities`, `search-index.json`,
or sitemap output, and they do not have standalone public routes.

## Relationships

The current relationship record shape is:

```yaml
id: rel-example
type: relationship
from_id: technology-a
to_id: technology-family-a
relationship: based_on
source_ids:
  - source-example
evidence_status: confirmed
```

Technology relationship types and endpoint combinations are validated by the data pipeline. Relationship endpoints use stable IDs;
reverse lookups are derived by repositories and are not copied into Technology records.

## Vehicle architecture

Vehicle classification remains in `powertrain_types`. Architecture is optional and explicit:

```yaml
powertrain_types:
  - bev
powertrain_architecture_id: battery-electric
motor_positions:
  - e-axle
```

`motor_positions` accepts `p0`, `p1`, `p2`, `p3`, `p4`, `e-axle`, and `unknown`. Missing optional facts are unknown and must not be
inferred from another field.

The current controlled `powertrain_types` values are `bev`, `phev`, and `erev`. They are storage values, not Architecture
identifiers; the page layer may map them to display labels such as `BEV`, `PHEV`, and `EREV`.
