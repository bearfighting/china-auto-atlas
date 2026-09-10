# China Auto Atlas — Current Data Audit

> Scope: existing Technology, Platform, Event and Relationship records plus the BYD seed slice.
> Date: 2026-09-10

## Audit result

```text
Validation: passed before and after audit documentation
Current build (2026-09-10): 64 entities, 71 events, 111 sources, 32 relationships, 20 market specifications, 23 News documents
Current entity coverage: 25 vehicles, 15 technologies, 5 platforms
Technology records reviewed: 15
Platform records reviewed: 5
```

The earlier `53 entities / 61 events / 98 sources / 16 market specifications / 14 News documents` figures are retained only as
the historical pre-expansion snapshot recorded by the first audit. They must not be used as the current baseline.

## Technology checklist

| Record | Definition / limits | Vehicle application | Event | Sources | Action |
|---|---|---|---|---|---|
| `byd-blade-battery` | complete | present | present | present | retain |
| `byd-ctb` | complete | present | unknown | present | retain unknown date |
| `byd-ctc` | complete | present | unknown | present | retain unknown date |
| `byd-disus-p` | complete | present | present | present | retain |
| `byd-dm-i` | complete | present | present | present | retain |
| `byd-dmo` | complete | present | present | present | retain |
| `byd-super-e-platform` | complete | present | present | present | retain |
| `byd-disus-x` | complete | present | present | present | retain |
| `byd-e4-platform` | complete | present | present | present | retain as platform-technology |
| `avatr-800v-sic` | complete | present | unknown | present | do not infer launch date |
| `geely-11-in-1-electric-drive` | complete | present | present | present | retain pending reference |
| `geely-short-blade-battery` | complete | present | present | present | retain generation note |
| `zeekr-800v-system` | complete | present | unknown | present | source historical event later |
| `zeekr-golden-battery` | complete | present | unknown | present | source historical event later |
| `byd-dm-p` | complete | unknown | unknown | present | retain unknown application and date |

## Platform checklist

| Record | Developer relationship | Vehicle application | Source | Action |
|---|---|---|---|---|
| `byd-e-platform-3` | confirmed | `byd-seal`, `byd-sealion-7` | present | add further applications only with direct source support |
| `geely-sea` | confirmed | `zeekr-7x` | present | retain |
| `geely-gea` | confirmed | `geely-ex5` | present | retain |
| `avatr-chn` | joint development | `avatr-11` | present | retain role distinctions |
| `changan-epa1` | confirmed | `deepal-l07` | present | retain |

## Relationship findings

- The relationship layer is present and source-backed for the main BYD brand structure.
- Entity-level relationship ID arrays are indexes, not a substitute for typed relationship records.
- Pending Geely/Zeekr and Changan corporate references should not be silently upgraded to confirmed ownership.
- Huawei and CATL roles around AVATR/CHN are supported as strategic/joint relationships where stated; supplier/developer roles
  require separate evidence.

## Event findings

- The current dataset has 71 events and supports vehicle, technology, brand, market and ownership milestones.
- `reveal`, `debut`, `launch` and `market entry` should be preserved as distinct editorial states when the source supports it.
- New events should use the existing vocabulary and explicit date precision.
- A missing historical date is an intentional unknown, not evidence that the event did not occur.

## BYD slice backlog

### Implemented in this pass

```text
YANGWANG U9
BYD SEALION 7
BYD HAN
BYD TANG
BYD SONG L (initially as the officially unveiled model/concept)
DENZA N9
BYD Super e-Platform
BYD DiSus-X
```

### Evidence status retained after the closeout

```text
BYD QIN L: implemented with sourced launch/price coverage
BYD DM-p: implemented as a standalone Technology with unknown application/date
DiSus-C and DiSus-A: not modeled as separate records; deferred pending direct scope evidence
```

The deferred DiSus-C and DiSus-A records should not be added merely from secondary descriptions or because a target count requires them.

## Geely / Zeekr slice audit

| Area | Result | Decision |
|---|---|---|
| Brand reverse indexes | `geely-auto` → `geely-ex5`, `geely-galaxy-e8`; `zeekr` → `zeekr-7x`, `zeekr-001`, `zeekr-007`, `zeekr-009` | corrected and kept aligned with vehicle `brand_id` |
| Manufacturer relationships | EX5 uses `geely-auto-group`; 7X uses `zeekr-group` | retain existing operating-company distinctions |
| Platform relationships | EX5 → `geely-gea`; 7X → `geely-sea` | typed `based_on` records and platform reverse indexes agree |
| Technology applications | Existing sourced applications are maintained per vehicle; expanded 001/007/009 and Galaxy E8 currently have no additional technology relation | do not add technology links without vehicle-specific source support |
| Pending corporate references | Geely Auto Group / Zeekr Group references remain pending where role scope is not exhaustive | do not upgrade from entity existence alone |
| EX5 / E5 naming | E5 and Galaxy E5 remain aliases/market-name context on the EX5 record | no duplicate Vehicle created |
| Technology history | ZEEKR 800V and Golden Battery retain unknown first dates and no guessed events | historical event pass remains deferred |
| News links | Existing EX5 global-unveil and 7X launch News are now indexed from their Vehicles | reuse existing IDs; no duplicate News created |

The three existing Geely / Zeekr market specifications remain separate records. `GLOBAL_REFERENCE` for EX5 is not treated as a
sale-market record; the two 7X records remain separated by China and EU markets. Existing unknown, claimed and confirmed evidence
states are preserved.

## Changan / Avatr / Deepal slice audit

| Area | Result | Decision |
|---|---|---|
| Brand reverse indexes | `avatr` → `avatr-11`, `avatr-07`, `avatr-12`; `deepal` → `deepal-s07`, `deepal-l07`, `deepal-s05` | corrected and aligned with vehicle `brand_id` |
| AVATR 11 corporate roles | AVATR Technology operates the brand; Changan and CATL roles remain separately modeled | retain operating, investment and strategic-partner distinctions |
| CHN platform | AVATR 11, AVATR 07 and AVATR 12 are linked to CHN; Changan, Huawei and CATL remain jointly-developed roles | do not convert platform cooperation into ownership or supplier claims |
| DEEPAL S07 events | reveal, Thailand preorder, Thailand launch and Indonesia market event are now all indexed on the vehicle | retain event types and dates as sourced |
| DEEPAL S07 market variants | Mauritius, Indonesia and Chile records remain separate; Indonesia is explicitly BEV | do not merge market-specific specifications |
| Technology history | AVATR 800V SiC retains unknown first date | do not infer a historical technology-launch event |
| News links | AVATR 11 reuses its existing launch News; S07 has a new debut News | complete Vehicle → News → Event → Source paths |

## BYD vertical-slice closeout

The closeout pass completed the relationship and evidence review for the ten priority vehicles. Five News documents now connect
SEALION 7, Han, Tang, Song L and DENZA N9 to their existing events and primary sources. SEALION 7 also has a separate EU market
specification with variant-level WLTP range, battery, drive and charging values; prices remain unknown because the cited source does
not establish one EU-wide price.

The remaining priority vehicles have News or explicit existing coverage as follows: SEAL, DENZA D9, YANGWANG U8 and FANGCHENGBAO
BAO 5 retain their existing event/source paths, while YANGWANG U9 retains its launch News. No new platform or technology relation
was added for Song L or DENZA N9 without direct source support.

## Cross-slice convergence audit

The original convergence pass reviewed the pre-expansion snapshot: 53 entities, 61 events, 98 sources, 32 relationships, 16 market
specifications and 14 News documents. The current combined dataset is 64 entities, 71 events, 111 sources, 32 relationships, 20
market specifications and 23 News documents. Both audits use stable-ID references and reverse-index checks; they do not treat every
entity-level event association as a requirement to copy brand or organization milestones onto child vehicles.

Three maintenance-blocking inconsistencies were corrected:

- `byd-blade-battery` now includes `denza-d9` in `vehicle_ids`, matching the D9 vehicle's technology index.
- `fangchengbao` now includes `fangchengbao-bao-5` in `vehicle_ids`, matching the vehicle's `brand_id`.
- DENZA D9 now indexes its existing production-start and delivery-start events, and the vehicle indexes the existing production
  source used by both events.

The audit retained unknown technology history where no source establishes a first event date. The DMO and e⁴ records remain
platform-technologies under the existing model; they were not duplicated as separate Platform records. Market specifications
remain market- and variant-specific, including the normalized DEEPAL S07 records. No schema change was needed.

## Market specification audit

The original audit reviewed 16 Market Specification records. The current dataset has 20 records and uses market-specific records with `vehicle_id`, `market`, source
IDs and variant arrays; no top-level legacy `spec` structure was found. The Xiaomi SU7 China record has three variants, each with
BEV powertrain type and CNY MSRP values, and is supported by the official Xiaomi launch source.

The source-specific review added `powertrain_type` to the BYD SEAL EU/JP, BAO 5, Geely EX5 reference, MG4 and ZEEKR 7X variants;
these are respectively BEV, PHEV, BEV, BEV and BEV according to their cited manufacturer material. AVATR 07 and AVATR 12 remain
the only records without a variant powertrain value because they are reference-only family records, not stable launch trim tables.
No market records were merged or overwritten, and no historical `valid_from` value was inferred from an access date.

## Xiaomi SU7 seed slice

The existing Xiaomi Corporation, Xiaomi Auto and SU7 records were completed as a browsable seed slice by adding one News document
for the China launch. The News links `xiaomi-su7` and `xiaomi-auto` to the existing launch event and official launch source. The
existing 2023 reveal event remains separate from the 2024 China launch; no global-market claim or unsupported platform/technology
relation was added.

## Content Foundation expansion pass — 2026-09-10

This pass added nine vehicles across the three existing slices: BYD Qin L; ZEEKR 001, 007 and 009; Geely Galaxy E8; DEEPAL L07
and S05; and AVATR 07 and 12. Vehicles with confirmed milestone sources have matching events and News entries; product-reference
News entries for AVATR 07 and DEEPAL S05 intentionally have no historical event until a dated primary source is captured. The new platform
indexes connect the ZEEKR vehicles to SEA, Galaxy E8 to GEA, and AVATR 07/12 to CHN. AVATR 07/12 also reuse the existing 800V
SiC technology index; no new developer or supplier claim was inferred.

Four market-specific records were added for Qin L, Galaxy E8, AVATR 07 and AVATR 12. They intentionally keep the records small:
only source-supported market, availability, powertrain and dimensions are promoted to canonical facts. No unsupported range,
trim-level price, or test-cycle value was added.

The following remain explicitly deferred: platform identification for DEEPAL S05, historical first-announcement dates for
the existing Geely/Zeekr/AVATR technologies with unknown dates, and exhaustive corporate-role resolution for pending references.
The current dataset is now at 64 entities, 71 events, 23 News documents, 20 market specifications and 111 sources. Schema
stabilization has now been reviewed across all three slices; the conclusion and remaining data work are recorded below.

## Market specification review — 2026-09-10

The focused review covered Qin L, Galaxy E8, AVATR 07, AVATR 12 and the existing DEEPAL S07 market records. Qin L pricing is
now backed by BYD's official launch page. Galaxy E8's effective date is normalized to January 2024, matching the official sale
and delivery announcement. AVATR 07 and AVATR 12 remain `reference_only` because the captured product pages do not establish
the historical China-market effective date or a stable launch trim table. DEEPAL S07 retains separate market records and explicit
BEV/EREV variants; no markets were merged.

The review also confirms that range values retain their test standard where captured, while missing prices, dates and detailed
variants remain unknown rather than being copied from current undated pages.

## Pending and historical-date decisions — 2026-09-10

All pending items have an explicit disposition. Pending means the referenced organization or role is plausible in the captured
material but its exact relationship semantics are not yet safe to promote; unknown means the fact itself was not established.

| Record | Disposition | Reason |
|---|---|---|
| `geely-gea` → `geely-auto-group` | pending retained | The platform and vehicle application are sourced; the captured material does not establish an exhaustive developer relationship. |
| `avatr-chn` → Changan / Huawei / CATL | pending retained | Joint-development and strategic roles remain distinct; no supplier, owner or sole-developer claim is inferred. |
| `geely-short-blade-battery` → Geely Auto Group | pending retained | The technology record and dated event are sourced, but the organization-role boundary is not exhaustive. |
| `geely-11-in-1-electric-drive` → Geely Auto Group | pending retained | The technology and year-level history are sourced; the exact developer relationship remains pending. |
| `zeekr-800v-system` / `zeekr-golden-battery` → Zeekr Group | pending retained | Organization references remain pending; first announcement dates and event IDs remain unknown/empty. |
| `avatr-800v-sic` → Huawei | pending retained | The technical pairing is recorded, but the captured evidence does not settle Huawei's canonical role. |
| `byd-ctb` / `byd-ctc` | unknown retained | Applications and definitions are sourced; no stable first-announcement date is promoted and no guessed event is created. |
| `deepal-s05` platform, powertrain and history | unknown retained | The current product-reference record does not provide a sufficiently stable platform, powertrain or historical launch fact. |

No pending item was upgraded solely because the referenced entity exists. No confirmed canonical fact was added without source support.

## Current acceptance status

- Current build counts above match the generated indexes.
- The three vertical slices retain navigable Entity → Event → News → Source paths where historical evidence exists.
- Reference-only market records and product-reference News remain explicitly non-historical.
- Schema stabilization review is recorded in `data-model-issues.md`; no canonical schema change is required in this phase.
