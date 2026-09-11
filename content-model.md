# Content Model

> **Project:** China Auto Atlas
> **Status:** Initial Draft
> **Version:** 0.1
> **Last Updated:** 2026-09

---

# 1. Purpose

China Auto Atlas is not designed as a collection of independent news articles.

Its long-term goal is to build a structured, traceable, historical knowledge base of China's automotive industry.

The central content principle is:

> **News is input. Knowledge is output.**

News tells us what happened today.

The content model should preserve:

* what happened;
* when it happened;
* which entities were involved;
* what changed;
* how we know;
* what remains uncertain;
* what the state of the industry was at a particular point in time.

The system should gradually transform reporting into structured historical knowledge.

---

# 2. Design Principles

The content model follows several principles.

## 2.1 Entity-Centered, Not Article-Centered

Articles are important editorial products, but they are not the center of the knowledge model.

The long-term center of the system is:

```text
Entities
+
Relationships
+
Events
+
Evidence
+
Time
```

Articles describe these things.

They do not define them.

---

## 2.2 Preserve History

Current information must not destroy previous information.

Examples:

* a new price should not erase the launch price;
* a facelift should not erase the previous vehicle specification;
* a new owner should not erase previous ownership;
* a discontinued model should not disappear;
* a factory closure should not erase the factory's history.

The system should be able to answer:

> What is true now?

and eventually:

> What was true on a particular date?

---

## 2.3 Preserve Evidence

Important structured facts should remain traceable to evidence.

A database value such as:

```yaml
battery_supplier: CATL
```

is still a factual claim.

It should therefore be possible to determine:

```text
Where did this information come from?

When was it verified?

What evidence supports it?

How confident are we?
```

---

## 2.4 Uncertainty Is Data

The model must support uncertainty explicitly.

The absence of confirmed information should not force the system to invent a value.

Valid states may include:

```text
confirmed
announced
claimed
reported
estimated
rumored
unknown
```

---

## 2.5 Market and Time Are First-Class Dimensions

Automotive information frequently varies by:

```text
Market
+
Time
```

The same vehicle may have different:

* prices;
* batteries;
* motors;
* charging systems;
* trims;
* software;
* ADAS features;
* names;
* availability;

in China, Europe, Australia, or other markets.

Therefore:

> **A vehicle specification is not always a timeless global property of a vehicle.**

---

# 3. High-Level Model

The content system consists of five primary conceptual layers:

```text
┌─────────────────────────────────┐
│         DOCUMENT LAYER          │
│                                 │
│ News / Feature / Interview      │
│ Analysis / Field Report         │
└────────────────┬────────────────┘
                 │ describes
                 ↓
┌─────────────────────────────────┐
│           EVENT LAYER           │
│                                 │
│ Launch / Update / Expansion     │
│ Entry / Exit / Acquisition      │
└────────────────┬────────────────┘
                 │ affects
                 ↓
┌─────────────────────────────────┐
│          ENTITY LAYER           │
│                                 │
│ Manufacturer / Brand / Product  │
│ Line / Vehicle Series / Vehicle │
│ Platform / Technology / Factory │
│ Supplier                        │
└─────────────────────────────────┘

                 ↑
                 │ supported by

┌─────────────────────────────────┐
│        KNOWLEDGE LAYER          │
│                                 │
│ Claim / Evidence / Relationship │
└────────────────┬────────────────┘
                 │ derived from
                 ↓
┌─────────────────────────────────┐
│          SOURCE LAYER           │
│                                 │
│ Official / Regulatory / Media   │
│ Interview / Observation / etc.  │
└─────────────────────────────────┘
```

These layers are related but should remain conceptually separate.

---

# 4. Entity

An Entity represents something that exists independently of any particular article.

Initial entity types include:

```text
Manufacturer
Brand
Vehicle
Platform
Technology
Factory
Supplier
```

Future entity types may include:

```text
Battery
Powertrain
Motor
Market
Person
Organization
Charging Network
Software Platform
```

New entity types should only be introduced when they provide meaningful structured value.

---

# 5. Stable Identity

Every entity should have a stable internal identifier.

Example:

```yaml
id: zeekr-7x
type: vehicle
```

URLs, display names, and marketing names may change.

The internal identity should not.

For example:

```text
Internal ID
    ↓
zeekr-7x

Display Name
    ↓
ZEEKR 7X

Localized Name
    ↓
极氪 7X
```

Identity and presentation should remain separate.

---

# 6. Manufacturer

A Manufacturer represents a corporate or industrial entity involved in producing automobiles.

Examples may include:

```text
BYD Auto
Geely Auto Group
SAIC Motor
Changan Automobile
Great Wall Motor
```

Manufacturer data may include:

```text
Legal / common name
Chinese name
English name
Founded
Headquarters
Ownership
Parent company
Brands
Joint ventures
Factories
Major technologies
Markets
Official websites
Timeline
Sources
```

Manufacturer should not be treated as interchangeable with Brand.

---

# 7. Brand

A Brand represents the consumer-facing identity under which vehicles are marketed.

Example relationship:

```text
Manufacturer
     │
     ├── Brand A
     ├── Brand B
     └── Brand C
```

Brand information may include:

```text
Name
Chinese name
English name
Owner
Operator
Positioning
Founded / launched
Status
Markets
Vehicles
Timeline
Sources
```

A brand may:

* change ownership;
* be jointly operated;
* move between corporate groups;
* be discontinued;
* be revived.

These changes should be historical relationships rather than overwritten fields.

Brands may optionally organize vehicles through Product Lines and Vehicle Series:

```text
Brand
  └── Product Line
        └── Vehicle Series
              └── Vehicle
```

`Product Line` is a brand-level commercial or product organization such as BYD Dynasty or Ocean. `Vehicle Series` is a durable
vehicle family such as Qin, Han, Seal, or Sea Lion. Neither represents a factory production line, generation, trim, variant, or
market specification.

Product Line and Vehicle Series are optional. A Vehicle may reference a Product Line and/or Vehicle Series when supported by
sources; missing relationships remain unknown. Child records are canonical, and reverse lists are derived by repositories rather
than duplicated on parent records.

---

# 8. Manufacturer–Brand Relationships

Corporate structures in China's automotive industry can be complex.

The model should support relationships such as:

```text
owns
controls
operates
jointly_owns
manufactures_for
invested_in
formerly_owned
```

Relationships may contain time boundaries:

```yaml
relationship:
  from: manufacturer-a
  to: brand-b
  type: owns
  valid_from: 2024-01-01
  valid_to: null
```

This allows historical ownership structures to remain queryable.

---

# 9. Vehicle

Vehicle is one of the central entities of China Auto Atlas.

However, "vehicle" should not mean a single flat specification object.

Conceptually:

```text
Vehicle Model
     │
     └── Generation
             │
             └── Revision / Model Year
                     │
                     └── Market Specification
                             │
                             └── Trim
```

Not every vehicle will require every level.

The model should support complexity without forcing unnecessary complexity.

A Vehicle may optionally reference a Product Line and Vehicle Series:

```text
Vehicle → Vehicle Series? → Product Line? → Brand
```

When both `series_id` and `product_line_id` are present, the Product Line must be the parent of the referenced Series and all
three records must belong to the same Brand. These references describe product context only; they do not imply a manufacturing
facility or production line.

---

# 10. Vehicle Model

Vehicle Model represents the durable product identity.

Example:

```text
ZEEKR 7X
```

Basic information may include:

```text
Brand
Manufacturer
Segment
Body style
Production status
First launch
Markets
Generations
Related platform
Related news
Timeline
```

Properties that change frequently should generally not live directly on this level.

---

# 11. Generation

Generation represents a major product generation.

Example:

```text
Vehicle
   ↓
Generation 1
   ↓
Generation 2
```

A generation may involve:

* new platform;
* major body redesign;
* major architecture change;
* substantial powertrain change.

Minor annual updates should generally not create a new generation.

---

# 12. Revision / Model Year

Vehicles frequently receive updates without becoming a new generation.

These may include:

```text
Facelift
Model Year
Annual Update
Battery Update
Powertrain Update
Software / Hardware Revision
```

The model should preserve these revisions where they materially change the product.

---

# 13. Market Specification

Vehicle specifications should usually be interpreted within a market and time context.

Example:

```yaml
market_spec:
  vehicle: zeekr-7x
  market: CN
  effective_from: 2026-08-12
```

This record may contain:

```text
Price
Battery
Motor
Range
Charging
ADAS
Trim structure
Availability
```

A European specification should not silently overwrite the Chinese specification.

---

# 14. Trim

Trim represents a commercially available configuration.

Example:

```text
Vehicle
   ↓
China Specification
   ↓
Long Range AWD
```

Trim-specific data may include:

```text
Price
Battery
Motor configuration
Power
Torque
Range
Wheels
Equipment
ADAS package
Interior options
```

Trim modeling should remain selective.

China Auto Atlas does not need to reproduce every minor dealer configuration unless it provides meaningful value.

---

# 15. Vehicle Specifications

Vehicle specifications should preserve measurement context.

Example:

```yaml
range:
  value: 720
  unit: km
  standard: CLTC
```

rather than:

```yaml
range: 720
```

Similarly:

```yaml
price:
  amount: 249900
  currency: CNY
  type: msrp
  market: CN
```

instead of:

```yaml
price: 249900
```

Context should remain part of the value.

---

# 16. Vehicle Availability

Availability is market-specific and time-dependent.

Recommended states include:

```text
announced
pre_sale
available
delivery_started
discontinued
planned
reported
not_announced
not_available
unknown
```

Example:

```text
ZEEKR 7X

China
→ available

Europe
→ announced

Canada
→ not_available

United States
→ not_available

Australia
→ planned
```

Absence of an announcement should not automatically mean permanent non-availability.

---

# 17. Platform

Platform represents a reusable vehicle architecture.

Examples may include:

```text
Dedicated EV platform
Multi-energy platform
Electrical architecture
Vehicle architecture
```

Platform data may include:

```text
Developer
Manufacturer
Launch date
Supported powertrains
Voltage architecture
Vehicles
Technologies
Factories
Successor / predecessor
Sources
```

Platforms should be entities when they meaningfully connect multiple products.

---

# 18. Technology

Technology represents a reusable technical concept or implementation that deserves independent explanation.

Examples:

```text
800V electrical architecture
Cell-to-Body
Steer-by-Wire
Gigacasting
Sodium-ion battery
Integrated thermal management
```

Technology should not simply become a large uncontrolled tag collection.

A technology entity should normally justify its existence by supporting:

* explanation;
* relationships;
* historical tracking;
* comparison;
* multiple related products.

---

# 19. Generic Technology vs Proprietary Technology

The model should distinguish between generic concepts and manufacturer-specific implementations.

Example:

```text
800V Electrical Architecture
        │
        ├── Manufacturer Implementation A
        ├── Manufacturer Implementation B
        └── Manufacturer Implementation C
```

Similarly:

```text
Cell-to-Body
        │
        └── proprietary implementations
```

This prevents marketing names from becoming confused with general technical concepts.

---

# 20. Factory

Factory represents a physical production facility.

Possible data:

```text
Name
Location
Operator
Owner
Opened
Status
Products
Production lines
Reported capacity
Technologies
Expansion history
Sources
```

Capacity should preserve attribution when it comes from manufacturer claims.

Factory may contain multiple Production Lines. Production Line is a physical manufacturing or assembly facility inside a Factory,
not a Product Line. Its canonical parent reference is `factory_id`; vehicle and technology references are optional and must be
source-supported. Reverse Factory → Production Line lists are derived from child records.

For example:

```text
reported_capacity:
  value: 300000
  unit: vehicles_per_year
  status: claimed
```

---

# 21. Supplier

Supplier represents an organization providing meaningful components or technology.

Examples may include suppliers of:

```text
Battery cells
Battery packs
Motors
Semiconductors
ADAS hardware
LiDAR
Displays
Chassis systems
```

The goal is not to model every screw supplier.

Supplier relationships should be included when they materially help readers understand the product or industry.

---

# 22. Relationships

Entities become valuable through relationships.

Examples:

```text
Manufacturer → owns → Brand

Brand → markets → Vehicle

Manufacturer → manufactures → Vehicle

Vehicle → based_on → Platform

Vehicle → uses → Technology

Vehicle → uses_component_from → Supplier

Factory → produces → Vehicle

Supplier → supplies → Manufacturer

Platform → supports → Powertrain
```

Relationships may have:

```text
valid_from
valid_to
market
status
sources
```

where necessary.

---

# 23. Relationship History

Relationships should not always be represented as permanent truth.

For example:

```yaml
relationship:
  from: company-a
  type: owns
  to: brand-b

  valid_from: 2022-01-01
  valid_to: 2026-05-31
```

Later:

```yaml
relationship:
  from: company-c
  type: owns
  to: brand-b

  valid_from: 2026-06-01
  valid_to: null
```

This preserves corporate history.

---

# 24. Event

Event represents something that happened.

This is different from both an Entity and a News article.

Examples:

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

The event vocabulary should remain controlled and expandable.

---

# 25. Event Structure

Conceptually:

```yaml
event:
  id: ...
  type: event
  event_type: vehicle_launch

  date: 2026-08-12

  subjects:
    - zeekr-7x

  market: CN

  changes:
    - availability
    - price
    - trims

  sources:
    - ...

  evidence_status: confirmed
```

An event describes change.

---

# 26. Event vs Entity State

This distinction is fundamental.

Example:

```text
EVENT

August 12
ZEEKR launches 7X
        ↓
changes
        ↓
ENTITY STATE

ZEEKR 7X
China availability = available
launch date = August 12
```

The Event records:

> What happened?

The Entity records:

> What is true?

Together they preserve history.

---

# 27. Event vs News

Event and News must not be treated as the same thing.

One Event may be covered by:

```text
Manufacturer announcement
China Auto Atlas news article
Reuters report
Chinese automotive media
Interview
```

Likewise, one News article may describe several Events.

Example:

```text
News Article

"Company X restructures its EV business"
        │
        ├── Brand A transferred
        ├── Factory B closed
        └── Executive C appointed
```

Therefore:

> **News describes events. Events modify knowledge.**

---

# 28. Document

Document represents editorial content produced or preserved by China Auto Atlas.

Initial document types may include:

```text
news
feature
analysis
interview
field_report
explainer
```

A Document may relate to:

```text
Entities
Events
Claims
Sources
Other Documents
```

---

# 29. News

News is a Document subtype focused on recent events.

A News document may contain:

```text
Title
Summary
Published date
Updated date
Author
Topics
Related entities
Related events
Sources
Body
Corrections
```

News should not duplicate the entire structured record of an entity.

For example:

A launch article explains the launch.

The Vehicle page stores the vehicle's long-term structured information.

---

# 30. Feature / Explainer

Features and explainers provide deeper context.

Examples:

```text
How EREV Works

Understanding CLTC vs WLTP vs EPA

Who Owns China's Major Automotive Brands?

How China's 800V Charging Race Developed
```

These documents may connect many entities and events.

---

# 31. Interview

Interview represents original reporting based primarily on direct conversation.

It should preserve relevant metadata such as:

```text
Interview subject
Organization
Date
Location
Interviewer
Publication date
Disclosure
Related entities
Related events
```

Statements made during interviews remain attributed claims unless independently verified.

---

# 32. Field Report

Field Report represents direct observation.

Examples:

```text
Dealership visit
Factory visit
Auto show
Vehicle demonstration
Supplier visit
```

Field reports should distinguish:

```text
Observed directly
Told by representative
Provided by manufacturer
Inferred by reporter
```

---

# 33. Source

Source represents the origin of evidence.

Possible source types:

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

A Source should contain enough information to identify and revisit it where practical.

---

# 34. Source Record

Conceptually:

```yaml
source:
  id: ...
  type: manufacturer

  publisher: ...
  title: ...
  url: ...
  published_at: ...
  accessed_at: ...

  language: zh-CN
```

Additional metadata may eventually include:

```text
Archived URL
Author
Document ID
Market
Original file
Screenshot
Translation
```

---

# 35. Claim

Claim represents a specific assertion.

Example:

> The vehicle uses an 800V electrical architecture.

Conceptually:

```yaml
claim:
  subject: vehicle-x
  predicate: uses
  object: 800v-architecture

  status: confirmed

  sources:
    - source-x
```

Claims allow evidence to exist before information becomes canonical entity data.

---

# 36. Why Claim Exists

Without a Claim layer, the system tends to jump directly from:

```text
Article
   ↓
Database Value
```

This is dangerous.

A better model is:

```text
Source
   ↓
Claim
   ↓
Evidence Evaluation
   ↓
Canonical Knowledge
```

For example:

```text
Chinese automotive media reports:

"Vehicle X uses Supplier Y battery"
            ↓
          CLAIM
            ↓
status = reported
            ↓
NOT YET canonical specification
```

Later:

```text
Regulatory document confirms supplier
            ↓
        CLAIM upgraded
            ↓
status = confirmed
            ↓
canonical vehicle data updated
```

---

# 37. Evidence

Evidence represents the connection between a Source and a Claim.

Conceptually:

```text
SOURCE

Manufacturer specification
        │
        │ supports
        ↓
CLAIM

Battery capacity = 100 kWh
```

A different source might:

```text
support
contradict
partially_support
```

the same claim.

This allows conflicting information to be represented rather than silently discarded.

---

# 38. Conflicting Evidence

Automotive information frequently conflicts.

For example:

```text
Manufacturer Website
Battery: 100 kWh

Regulatory Filing
Battery: 97.7 kWh

Media Article
Battery: 100 kWh
```

The system should not automatically choose a number without explanation.

Possible reasons include:

```text
gross vs usable capacity
rounding
different trims
different markets
updated specification
reporting error
```

The editorial process should resolve the conflict where possible.

If it cannot:

> Preserve the uncertainty.

---

# 39. Canonical Knowledge

Canonical Knowledge represents the site's current best-supported understanding.

It should not mean:

> Absolute truth.

It means:

> **The best-supported current representation based on available evidence.**

Canonical values should normally derive from sufficiently strong claims.

---

# 40. Claim Status and Canonical Data

Recommended conceptual rule:

```text
confirmed
    ↓
usually eligible for canonical data

announced
    ↓
eligible where the field represents future/announced state

claimed
    ↓
only where attribution is preserved

reported
    ↓
normally not canonical without qualification

estimated
    ↓
stored separately as estimate

rumored
    ↓
not canonical

unknown
    ↓
explicitly empty / unknown
```

Exact rules can later be defined in the implementation schema.

---

# 41. Time

Time is a first-class dimension throughout the model.

Important records may use:

```text
occurred_at
announced_at
published_at
effective_from
effective_to
verified_at
updated_at
```

These fields mean different things.

For example:

```text
announced_at
≠
available_from
≠
delivery_started_at
```

Avoid collapsing them into one generic `date`.

---

# 42. Market

Market should also be modeled explicitly.

Initial market identifiers may use standardized country/region codes.

Examples:

```text
CN
EU
DE
FR
GB
CA
US
AU
TH
BR
```

Avoid embedding market meaning only in prose.

This eventually enables questions such as:

> Which Chinese vehicles are officially available in Europe?

or:

> Which vehicles entered Australia in 2027?

---

# 43. Localization

Content presentation and canonical identity should remain separate.

An entity may have:

```yaml
names:
  zh-CN: 极氪 7X
  en: ZEEKR 7X
```

Some terms may require:

```text
Original Chinese name
Official English name
Editorial English translation
Alternative translation
```

Do not create separate entities merely because a product has localized names.

---

# 44. Taxonomy

Taxonomy should be used for broad organization.

Examples:

```text
Vehicle Segment
Body Style
Powertrain Type
Technology Category
News Category
Market
```

Taxonomy should not replace meaningful entities.

For example:

```text
BEV
```

may reasonably be a classification.

But:

```text
SEA Architecture
```

should likely be an Entity.

---

# 45. Tags

Tags should be lightweight and editorial.

They should not become the primary knowledge model.

Good use:

```text
auto-show
earnings
price-war
export
```

Poor use:

```text
zeekr
geely
sea-platform
800v
catl
```

when those concepts already exist as entities.

Prefer relationships over duplicate tags.

---

# 46. Slugs and URLs

Public URLs should be readable but should not define entity identity.

Example:

```text
/vehicles/zeekr-7x
/brands/zeekr
/manufacturers/geely
/technology/800v-architecture
```

Internally:

```text
stable ID ≠ URL slug
```

This allows URLs or naming conventions to change without breaking knowledge relationships.

---

# 47. Source Traceability

Important canonical values should eventually support traceability.

For example, the UI might internally know:

```text
Battery
100 kWh
   ↓
Source A
Source B
Last verified: 2026-08-12
```

Not every source must always be displayed prominently.

But the system should preserve the ability to answer:

> Why does China Auto Atlas believe this value is correct?

---

# 48. Corrections

Corrections should propagate through the knowledge model.

Example:

```text
Incorrect News Specification
          ↓
Correction
          ↓
Claim Updated
          ↓
Vehicle Data Updated
          ↓
Correction History Preserved
```

Correcting an article while leaving incorrect structured data unchanged is not sufficient.

Likewise, correcting the database while leaving an incorrect article unchanged is not sufficient.

---

# 49. Content Lifecycle

The ideal content lifecycle is:

```text
Discovery
    ↓
Source
    ↓
Claim
    ↓
Verification
    ↓
Event
    ↓
News / Editorial Content
    ↓
Entity Update
    ↓
Structured Knowledge
    ↓
Historical Record
```

Not every piece of information requires every stage.

The model describes the conceptual flow rather than a mandatory bureaucracy.

---

# 50. Example: New Vehicle Launch

Suppose a manufacturer launches a new vehicle.

### Sources

```text
Manufacturer press release
Official specification page
Regulatory filing
Launch event
```

### Event

```text
vehicle_launch
```

### Entities

```text
Manufacturer
Brand
Vehicle
Platform
Technology
Supplier
```

### Document

```text
News:
"Brand X launches Vehicle Y in China"
```

### Knowledge Updates

```text
China availability
Launch date
Launch price
Trim structure
Battery specifications
Range
Charging
Platform relationships
```

All of these should remain connected to their evidence.

---

# 51. Example: Rumored Battery Supplier

A Chinese media outlet reports:

> Vehicle X will use CATL batteries.

Create:

```text
Claim

Vehicle X
uses battery from
CATL

status = reported
```

Do not immediately set:

```yaml
battery_supplier: CATL
```

as confirmed canonical data.

Later, a regulatory filing confirms CATL.

Then:

```text
Claim
reported → confirmed
```

and the canonical Vehicle record can be updated.

---

# 52. Example: International Market Entry

Manufacturer announces:

> Vehicle X will enter Germany in 2027.

Create:

```text
Event:
market_entry_announced
```

Entity state:

```text
Germany:
announced
```

Do not set:

```text
Germany:
available
```

until actual market launch occurs.

Later:

```text
Event:
market_entry
```

changes the state to:

```text
Germany:
available
```

This distinction is essential.

---

# 53. Example: Price Change

Launch:

```text
2026-08-12

MSRP:
249,900 CNY
```

Later:

```text
2027-02-01

MSRP:
239,900 CNY
```

Do not replace:

```text
249,900
```

with:

```text
239,900
```

and lose the historical value.

Instead preserve:

```text
249,900
2026-08-12 → 2027-01-31

239,900
2027-02-01 →
```

This enables future historical analysis.

---

# 54. Example: Corporate Restructuring

Suppose Manufacturer A owns Brand B.

Later Brand B is transferred to Manufacturer C.

The model should preserve:

```text
Manufacturer A
owns Brand B
2022 → 2026
```

and:

```text
Manufacturer C
owns Brand B
2026 →
```

The current Brand page can display Manufacturer C.

The historical timeline still preserves Manufacturer A.

---

# 55. Knowledge Graph Direction

China Auto Atlas does not need a graph database initially.

The term "knowledge graph" describes the conceptual structure:

```text
Entity
↕
Relationship
↕
Entity
```

A simple file-based or relational implementation may be sufficient for a long time.

For example:

```text
/content
/data
```

or later:

```text
PostgreSQL
```

can represent the same conceptual model.

Architecture should follow actual scale and requirements.

---

# 56. Initial Scope

The conceptual model is intentionally broader than the MVP implementation.

The first implementation should focus on:

```text
Manufacturer
Brand
Vehicle
Technology
News
Event
Source
```

with basic relationships between them.

Possible second-stage additions:

```text
Platform
Factory
Supplier
Claim / Evidence infrastructure
Detailed vehicle revisions
Detailed market specifications
```

The concepts should be anticipated now without requiring the full system to be built immediately.

---

# 57. Avoid Premature Complexity

The content model should not become a research project of its own.

Avoid initially building:

* a generic ontology engine;
* a graph database;
* a universal automotive schema;
* a complex provenance framework;
* dozens of entity types;
* hundreds of relationship types;
* exhaustive trim databases.

The purpose of the model is to support better journalism and durable knowledge.

Not to model every possible fact in the automotive world.

---

# 58. Progressive Structure

A useful principle is:

> **Start simple, preserve the ability to become precise.**

For example, MVP:

```yaml
vehicle:
  brand: zeekr
  model: 7x
```

may later expand into:

```text
Vehicle
 ↓
Generation
 ↓
Revision
 ↓
Market Specification
 ↓
Trim
```

The initial design should avoid decisions that make this evolution impossible.

---

# 59. When to Create a New Entity

Before creating a new entity type or individual entity, ask:

> Does this thing have an identity independent of one article?

> Will multiple pieces of content refer to it?

> Does it have meaningful relationships with other entities?

> Will tracking it over time create value?

> Will readers reasonably want a dedicated page for it?

If most answers are yes, it is probably an Entity.

---

# 60. When to Create an Event

Create an Event when something meaningful changed.

Ask:

> Did something happen at a specific time?

> Did it change the state of an Entity?

> Is the change historically useful?

> Could multiple sources or articles describe the same occurrence?

If yes, it is probably an Event.

---

# 61. When to Create a Claim

A Claim becomes useful when:

* evidence is incomplete;
* sources disagree;
* attribution matters;
* the information is important;
* verification may change later;
* the statement may eventually become canonical data.

Not every trivial specification requires a heavyweight Claim object in the MVP.

The Claim layer should be introduced where it improves traceability.

---

# 62. MVP Content Graph

The initial useful graph can remain very small:

```text
Manufacturer
     │
     └── Brand
           │
           └── Vehicle
                 │
                 ├── Technology
                 │
                 └── Market

Event ─────────────→ Entity

News ──────────────→ Event
News ──────────────→ Entity

Source ────────────→ News
Source ────────────→ Event
```

This alone is sufficient to begin producing structured content.

---

# 63. Long-Term Content Graph

Over time it may evolve toward:

```text
                    Manufacturer
                   /      |      \
                  /       |       \
               Brand   Factory   Supplier
                 |        |          |
                 |        |          |
              Vehicle ← produces   supplies
               /   \
              /     \
        Platform   Technology
              \     /
               \   /
              Powertrain

                    ↑
                    |
                  Event
                    ↑
                    |
                 Document

Source → Evidence → Claim
                     |
                     ↓
             Entity / Relationship
```

The graph should grow from actual editorial needs.

---

# 64. Relationship to Editorial Guidelines

`content-model.md` defines:

> **How knowledge is represented.**

`EDITORIAL-GUIDELINES.md` defines:

> **When information is reliable enough to be represented in a particular way.**

Together:

```text
EDITORIAL GUIDELINES
        ↓
What can we say?

CONTENT MODEL
        ↓
How do we preserve it?
```

Neither should replace the other.

---

# 65. Guiding Principle

The ultimate purpose of this model is not database elegance.

It is to make China Auto Atlas more valuable with time.

A conventional news website accumulates old pages.

China Auto Atlas should accumulate:

```text
Entities
+
Relationships
+
Events
+
Evidence
+
History
+
Context
```

After years of operation, a reader should be able not only to ask:

> What happened today?

but also:

> How did this company get here?

> When did this technology become common?

> Which vehicles used this platform?

> When did this brand enter Europe?

> What did this vehicle cost when it launched?

> Who supplied its battery at the time?

> What evidence supports this information?

That is the difference between a news archive and a living automotive knowledge base.

> **News is input. Knowledge is output. History is the accumulated value.**

# 66. Storage Independence

The content model is independent of the storage technology.

During the MVP, entities, events, documents and sources are maintained as separate YAML/Markdown source files and normalized
into generated JSON indexes for the application. This does not change their conceptual meaning or their relationships.

The application should access them through a data-access boundary rather than coupling page rendering to file names or directory structure.

The migration from JSON to a database should preserve:

* stable entity IDs;
* relationship types and validity periods;
* event history;
* source references;
* evidence status;
* market and date semantics.

The purpose of this boundary is to keep the MVP easy to edit while preserving a realistic path toward database-backed editorial workflows.

---

# Current Technology Model Semantics

The implemented model keeps these concepts separate:

```text
Classification    the vehicle's controlled powertrain type
Architecture      how the vehicle powertrain is organized
Technology        a concrete technical concept or manufacturer implementation
Family            a reusable general technical route
Category          a controlled technology organization area
Specification     a market, variant, date, and evidence-scoped value
```

`Vehicle.powertrain_types` stores values such as `bev`, `phev`, and `erev`. It does not determine
`Vehicle.powertrain_architecture_id`; architecture is recorded only when a source explicitly supports it. `Vehicle.technology_ids`
continues to point to concrete Technology records such as BYD DM-i and is separate from both classification and architecture.

Technology records may reference multiple Domains, Categories, and Families. These are controlled taxonomy records rather than
public entities. They provide context on Technology pages but do not create standalone routes, search records, or sitemap entries.

Relationships use stable `from_id` and `to_id` values, a controlled relationship type, `source_ids`, and `evidence_status`.
Reverse relationships are derived by resolvers/repositories instead of being duplicated in entity YAML. Category and Family are not
copied into a Vehicle's concrete Technology list.

Unknown optional facts remain unknown. In particular, the absence of an Architecture or motor position does not assert that the
vehicle does not have one.
