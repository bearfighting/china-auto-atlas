# China Auto Atlas — Data Model Issues

> Purpose: record recurring modeling problems found during content expansion.
> This document is editorial working documentation, not runtime data.

## Status legend

```text
P0  The current schema cannot represent the fact safely.
P1  The fact can be represented, but maintenance or interpretation is difficult.
P2  The representation is duplicated or inelegant without currently blocking publication.
P3  Future improvement; defer until the pattern recurs.
```

## Current findings

### P1 — Technology entity fields and relationship records overlap

Technology records currently carry `developer_ids`, `supplier_ids`, `brand_ids` and `vehicle_ids`, while the relationship
layer separately carries typed relationships such as `developed_by`, `based_on` and `strategic_partner_of`.

Current examples:

- `byd-e-platform-3` uses both `developer_ids` and a `developed_by` relationship.
- `avatr-800v-sic` uses `developer_ids` and `supplier_ids` while Huawei's role is still being qualified.
- `zeekr-golden-battery` has `pending_reference_ids` for `zeekr-group`.

Decision for this phase: keep entity ID arrays as page-oriented indexes and treat the relationship files as authoritative for
typed semantics. Do not remove either representation until the pattern is reviewed after the three vertical slices.

### P1 — Organization roles are not interchangeable

`developer`, `supplier`, `jointly_developed_by`, `operator`, `owner` and `strategic_partner_of` describe different claims.
The data must not infer one from another. If the source only establishes a partnership, preserve that relationship and leave
developer/supplier fields unresolved.

### P1 — Technology first-announcement dates are often unknown

Five existing technologies have empty `event_ids`:

```text
byd-ctb
byd-ctc
avatr-800v-sic
zeekr-800v-system
zeekr-golden-battery
```

Decision for this phase: an established technology may remain published with `first_announced_at` unknown and no event when
no stable historical source is available. Do not create a guessed launch event.

### P1 — Event vocabulary has meaningful but currently inconsistent distinctions

The dataset uses `reveal`, `debut`, `launch`, `market_debut`, `market_entry_announced`, `production_start` and related values.
These should remain distinct where the source supports the distinction, but the canonical vocabulary needs a later review.

Decision for this phase: preserve existing values, use the most specific existing value supported by the source, and record any
ambiguous case here rather than renaming historical IDs.

### P2 — Platform and technology boundaries need explicit editorial guidance

Some BYD records are platform-technologies (`DMO`, `e⁴`) while others are narrower technologies (`Blade Battery`, `CTB`).
This is acceptable when the record explains its scope, but a platform must not be duplicated as a technology merely to simplify
navigation.

Decision for this phase: use `platform` for a named vehicle architecture and `technology` for a component, subsystem, control
system or powertrain family. Revisit only after more examples are collected.

### P2 — Historical ownership and current operation can coexist

Current manufacturer/brand records sometimes need both ownership history and current operating relationships. A single current
relationship must not be read as a complete legal cap table.

Decision for this phase: preserve `valid_from`, `valid_to`, `evidence_status` and explanatory notes whenever a source is not
exhaustive.

## Open review questions

1. Should typed entity relationships become the only canonical relation source, with entity arrays generated at build time?
2. Do claim-level evidence records become necessary for recurring specifications and manufacturer superlatives?
3. Does the event model need a first-class change/validity structure for ownership and product revisions?
4. Should technology generations such as Golden Short Blade Battery be separate entities or dated technology versions?

These questions remain deferred until the BYD, Geely/Zeekr and Changan/Avatr/Deepal slices expose repeated cases.

## 2026-09-10 expansion decisions

- New vehicles with no safely sourced platform attribution retain `platform_id: null`; DEEPAL S05 remains a deliberate example.
  DEEPAL L07 now links to EPA1 because the captured Changan product material names that platform. The absence is not rendered as
  evidence that a vehicle uses no platform.
- AVATR 07 and 12 reuse the existing CHN platform and AVATR 800V SiC indexes because the current primary product material
  supports those relationships; no Huawei developer/supplier relationship was added to the vehicles.
- Market specifications for the new vehicles use family-level variants where the captured source does not provide a stable
  trim table. Detailed prices and range remain deferred rather than copied from an undated current product page.
- Product-reference News for AVATR 07 and DEEPAL S05 are dated with the editorial capture date and carry empty `event_ids`;
  they must not be interpreted as historical launch coverage.
- The first additional platform in this pass is `changan-epa1`, supported by the DEEPAL L07 product material. BYD DM-p is
  modeled as a technology with unknown first-announcement date and no application vehicle until a vehicle-specific source is captured.

## 2026-09-10 evidence closeout and schema stabilization

The evidence closeout found no P0 modeling problem. The default decision is to retain the canonical schema unchanged.

- Technology and Platform remain separate editorial types. A named vehicle architecture such as EPA1 is a platform; a component,
  subsystem, control system or powertrain family such as DM-p is a technology. Platform-technologies such as DMO and e⁴ remain
  documented exceptions rather than a reason to duplicate records.
- `developer`, `supplier`, `jointly_developed_by`, `strategic_partner_of`, `operator` and `owner` remain non-interchangeable.
  Entity arrays continue to support page-oriented indexes, while typed relationship records carry authoritative role semantics.
- Claim-level evidence is not promoted to a new schema requirement yet. Existing source IDs, evidence states and claim assessments
  safely express the current records; revisit only if the lack of claim-level granularity blocks publication repeatedly.
- Event `date_precision`, existing event types and market-specification validity dates are sufficient for the current evidence set.
  Do not add change/validity fields until product revisions or ownership changes repeatedly cannot be represented without ambiguity.
- Market specifications can currently express market, variant, local/global naming, powertrain, test standard, price and validity
  differences. Keep unsupported historical dates and trim details unknown or reference-only; no version/name-evolution field is needed yet.
- Entity arrays and typed relationships continue to coexist. A schema change becomes justified only when the same issue recurs across
  multiple slices and materially blocks maintenance or publication.
