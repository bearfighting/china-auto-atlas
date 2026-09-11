# China Auto Atlas — Vehicle Seed v0.1

Seed verification date: **2026-09-08**

Historical seed scope: this prototype originally created **one Vehicle entity for each of the first ten Brand entities**. The
current generated index contains 25 Vehicle entities; the original count is retained here as seed history, not as a current
dataset count:

Canonical records: `data/entities/vehicles/`; market snapshots are stored in `data/market-specifications/`.

## Current classification and architecture fields

Vehicle records use lower-case controlled `powertrain_types` values such as `bev`, `phev`, and `erev`. The page layer may render
these as `BEV`, `PHEV`, and `EREV`, but the stored values remain unchanged.

When a source explicitly supports a powertrain architecture, the Vehicle may include:

```yaml
powertrain_architecture_id: battery-electric
motor_positions:
  - e-axle
```

`powertrain_architecture_id` references a Powertrain Architecture taxonomy record. `motor_positions` is optional and uses the
controlled values `p0`, `p1`, `p2`, `p3`, `p4`, `e-axle`, and `unknown`. Missing architecture or motor-position facts are `null`
or absent and are rendered as Unknown.

`powertrain_types` describes vehicle classification; it does not imply a specific architecture. The pipeline and page layer must
not infer `series-parallel-hybrid` or another architecture from `bev`, `phev`, or `erev` alone. `technology_ids` continues to
reference concrete Technology records such as BYD DM-i and remains separate from both classification and architecture.

| Brand | Vehicle | Main model test |
|---|---|---|
| BYD | BYD SEAL | BEV sedan; China/global naming; multiple overseas market specs |
| DENZA | DENZA D9 | MPV; PHEV/BEV family; China history + 2026 European rollout |
| YANGWANG | YANGWANG U8 | high-end PHEV/EREV-like series-hybrid semantics; launch vs delivery |
| FANGCHENGBAO | BAO 5 | PHEV off-road SUV; major battery/trim update within same Vehicle |
| Geely Auto | GEELY EX5 | global model vs China E5 naming/alias problem |
| ZEEKR | ZEEKR 7X | 800V BEV; LFP/NMC battery variants; CN CLTC vs EU WLTP |
| DEEPAL | DEEPAL S07 | BEV + EREV under one model; different local-market specifications |
| AVATR | AVATR 11 | historical BEV launch evolving into current BEV + REEV lineup |
| Xiaomi Auto | Xiaomi SU7 | BEV sedan; launch facts and China market specification |
| MG | MG4 | BEV hatchback; China launch and market-specific specification |

## Directory

```text
data/entities/vehicles/
├── <vehicle>.yaml  # canonical Vehicle entities
└── ...

data/market-specifications/  # market/version-specific facts
data/events/                 # announcement, launch, delivery, market-entry history
data/sources/                # primary-source metadata
```

## Core modeling result

A single Vehicle file should **not** contain one supposedly universal `price`, `range`, `battery_capacity`, or `curb_weight`.

Those values vary by:

```text
Vehicle
  ↓
Market Specification
  ↓
Variant / Trim
```

For example ZEEKR 7X is one Vehicle, while its China and Europe specifications use different battery/range homologation records. The China source publishes up to 780 km CLTC; the European product page publishes up to 615 km WLTP for Long Range RWD. Both can be correct simultaneously.

## Important findings

### 1. `powertrain_type` belongs partly at Vehicle and partly at Market/Variant

DEEPAL S07 and current AVATR 11 support more than one powertrain family. The canonical Vehicle therefore stores:

```yaml
powertrain_types:
  - BEV
  - EREV
```

while each Market Specification/Variant states the actual powertrain.

### 2. Price is never a Vehicle-global scalar

Price needs at least:

```yaml
market
currency
price_type
amount
variant
valid_from
valid_to
source_ids
```

The seed pack therefore keeps Japanese SEAL pricing, French D9 pricing and China AVATR/BAO 5 pricing in separate market records.

### 3. Range must carry the test standard

The seed deliberately contains CLTC, WLTP, NEDC and local published range values. Never render:

> Range: 780 km

without also rendering the test standard and market/variant context.

### 4. Vehicle lifecycle needs multiple dates

The AVATR 11 prototype demonstrates:

```text
MIIT listing → pre-order → launch → production → delivery
```

These are separate events. `first_launched_at` is only a convenience projection over the event history.

### 5. Current spec and launch spec must coexist

AVATR 11 launched in 2022 as a BEV. Its current China configuration includes both REEV and BEV versions. BAO 5 similarly has a newer 47.8 kWh long-range family in addition to 31.8 kWh configurations.

Do not overwrite old facts. Use dated Market Specifications and Events.

### 6. Model identity / market naming is a real problem

GEELY EX5 vs China-market E5/银河E5 is intentionally left as one canonical Vehicle with aliases in this prototype. This should be validated before scaling because market renaming can otherwise create duplicate Vehicle entities.

## Deliberately incomplete fields

This is a schema-validation dataset, not a full catalog. A field is left unresolved when a matching primary source was not established in this pass. In particular:

- current China SEAL market spec still needs a stable official China configuration source;
- BAO 5 exact original launch date needs a primary launch archive;
- DEEPAL S07 China launch chronology needs a primary Deepal/Changan archive pass;
- DENZA D9 detailed 2026 Europe battery/motor configuration needs a matching official technical table;
- exact legal `manufacturer_ids` should be revisited after missing corporate nodes are created.

## Next schema work

Before adding 50+ vehicles, stabilize these concepts:

1. `Vehicle` vs `VehicleGeneration` vs `ModelYear`;
2. `MarketSpecification` vs `Trim`;
3. typed price records;
4. typed range records;
5. powertrain vocabulary, especially PHEV vs EREV;
6. announcement / launch / production / delivery event semantics;
7. market availability state machine;
8. model aliases and market-specific names;
9. source-level evidence attached to individual facts;
10. technology IDs only after Technology entities exist.

The original eight prototypes were enough to begin rendering real Vehicle pages and expose where the schema/UI breaks. They are
historical seed scope; the current generated index contains 25 Vehicle entities.

## MVP normalization conventions

The seed records use YAML for collection and may contain `common_specs` or `spec` blocks while the format is being tested.
The loader should normalize these into a common internal representation before rendering pages.

Canonical conventions are:

```text
type: vehicle | market_specification | event | source
body_style: lower-case controlled value
powertrain_types: lower-case controlled values
powertrain_type: lower-case value inside a variant
prices: list of typed price records
range.evidence_status: confirmed | claimed | reported | estimated | rumored | unknown
dates: quoted strings with explicit precision
```

`seed_vehicle_names` are discovery-only values. `vehicle_ids`, `brand_id`, `manufacturer_ids`, `platform_id`, and `technology_ids` are formal references and must pass reference validation, or be explicitly marked as pending in seed data.

The current market-spec seed intentionally tests multiple source shapes. Before production rendering, the adapter should map `common_specs`, `spec`, and variant-level fields into one internal `specifications` object without losing market, variant, date, or source context.
