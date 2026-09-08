# China Auto Atlas — Technology Seed v0.1

Verified: **2026-09-08**

This pack formalizes **12 Technology entities** already needed by the first Vehicle prototypes.

Canonical records: `data/entities/technologies/`.

## Included

| ID | Category | Primary prototype use |
|---|---|---|
| `byd-blade-battery` | battery | BYD / DENZA / YANGWANG / FANGCHENGBAO |
| `byd-ctb` | manufacturing / battery | BYD SEAL |
| `byd-dm-i` | powertrain | BYD / DENZA |
| `byd-dmo` | powertrain / platform | BAO 5 |
| `byd-disus-p` | chassis | U8 / BAO 5 |
| `byd-ctc` | manufacturing / battery | DMO-related structural integration |
| `byd-e4-platform` | platform / powertrain | YANGWANG U8 |
| `avatr-800v-sic` | electrical architecture | AVATR 11 |
| `zeekr-800v-system` | electrical architecture | ZEEKR 7X |
| `zeekr-golden-battery` | battery | ZEEKR 7X |
| `geely-short-blade-battery` | battery | GEELY EX5 |
| `geely-11-in-1-electric-drive` | powertrain | GEELY EX5 |

## Editorial rule: technology pages are not marketing pages

Each Technology record separates:

```text
What is it?
What problem does it address?
What technically changes?
What are plausible advantages?
What does it NOT guarantee?
What are the trade-offs?
Which statements are manufacturer claims?
Has independent verification been attached?
```

The seed therefore deliberately uses fields such as:

```yaml
claim_assessment:
  manufacturer_claims: [...]
  independent_verification:
    status: not_established
```

`evidence_status: confirmed` means the **technology and described architecture are supported by the cited primary source**. It does **not** automatically upgrade a manufacturer's performance or superiority claim to independently confirmed fact.

For the MVP, `type: technology` remains the canonical object type. Technologies that also function as vehicle platforms may use `entity_role: platform-technology` until a dedicated Platform dataset is introduced.

Unknown dates use `evidence_status: unknown`. Pending developer or supplier entities are listed in `pending_reference_ids` and must not be treated as validated references.

## Important model findings

### 1. Category should allow a primary category plus secondary categories

DMO is both a powertrain architecture and a vehicle-platform concept. CTB/CTC combine battery packaging, structural engineering and manufacturing. A single flat category loses useful meaning.

Recommended:

```yaml
category: powertrain
secondary_categories:
  - vehicle-platform
```

### 2. Technology family vs implementation needs a rule

`DiSus` is a family:

```text
DiSus
├── DiSus-C
├── DiSus-A
└── DiSus-P
```

The current Vehicle seed actually needs `DiSus-P`, so this pack creates the specific implementation. Later, a parent `byd-disus` Technology can be added if the UI needs a family overview.

Likewise, `Golden Battery` and Geely's `Short Blade Battery` can evolve by generation. Do not overwrite generation-specific specifications with the newest headline number.

### 3. CTB and CTC should not be silently merged

Both structurally integrate a traction battery with the vehicle, but BYD uses the terms in different product/architecture contexts. Keep separate Technology IDs until a source-supported equivalence rule exists.

### 4. 800V does not mean “charges at X kW”

An 800V-class architecture raises voltage and can reduce current for a given power, but real charging power is constrained by:

- battery chemistry and cell design;
- SOC and charging curve;
- battery temperature;
- thermal management;
- charger voltage/current capability;
- vehicle limits.

Therefore `avatr-800v-sic` and `zeekr-800v-system` must not contain a universal `max_charging_kw` inferred from one model.

### 5. Marketing superlatives are evidence, not facts

Primary manufacturer sources are excellent evidence for:

- the technology's official name;
- developer attribution;
- architecture;
- announced features;
- launch date;
- model application.

They are weaker evidence for claims such as:

- “world's first”;
- “industry leading”;
- “best in class”;
- universal safety superiority;
- universal efficiency superiority.

Those claims remain under `claim_assessment.manufacturer_claims` until an appropriate independent source is attached.

### 6. Technology ↔ Vehicle is many-to-many

A Vehicle can use several technologies, and a Technology can span several brands/models. The long-term graph should therefore use relationship records or typed application records rather than making either side the sole owner.

## Recommended next pass

Do **not** immediately add dozens of marketing technology names.

First render these 12 pages and test:

```text
Technology
  ↔ Developer / Supplier
  ↔ Brand
  ↔ Vehicle
  ↔ Event
  ↔ Source
```

Then add independent evidence for the highest-value measurable claims, especially battery safety, charging curves, efficiency and chassis behavior. That second layer is what can make Atlas materially more useful than a manufacturer's technology page.
