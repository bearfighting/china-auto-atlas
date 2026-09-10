# China Auto Atlas — Current Data Audit

> Scope: existing Technology, Platform, Event and Relationship records plus the BYD seed slice.
> Date: 2026-09-10

## Audit result

```text
Validation: passed before and after audit documentation
Current build: 53 entities, 61 events, 98 sources, 32 relationships, 16 market specifications, 12 News documents
Technology records reviewed: 12
Platform records reviewed: 4
```

## Technology checklist

| Record | Definition / limits | Vehicle application | Event | Sources | Action |
|---|---|---|---|---|---|
| `byd-blade-battery` | complete | present | present | present | retain |
| `byd-ctb` | complete | present | unknown | present | retain unknown date |
| `byd-ctc` | complete | present | unknown | present | retain unknown date |
| `byd-disus-p` | complete | present | present | present | retain |
| `byd-dm-i` | complete | present | present | present | retain |
| `byd-dmo` | complete | present | present | present | retain |
| `byd-e4-platform` | complete | present | present | present | retain as platform-technology |
| `avatr-800v-sic` | complete | present | unknown | present | do not infer launch date |
| `geely-11-in-1-electric-drive` | complete | present | present | present | retain pending reference |
| `geely-short-blade-battery` | complete | present | present | present | retain generation note |
| `zeekr-800v-system` | complete | present | unknown | present | source historical event later |
| `zeekr-golden-battery` | complete | present | unknown | present | source historical event later |

## Platform checklist

| Record | Developer relationship | Vehicle application | Source | Action |
|---|---|---|---|---|
| `byd-e-platform-3` | confirmed | `byd-seal`, `byd-sealion-7` | present | add further applications only with direct source support |
| `geely-sea` | confirmed | `zeekr-7x` | present | retain |
| `geely-gea` | confirmed | `geely-ex5` | present | retain |
| `avatr-chn` | joint development | `avatr-11` | present | retain role distinctions |

## Relationship findings

- The relationship layer is present and source-backed for the main BYD brand structure.
- Entity-level relationship ID arrays are indexes, not a substitute for typed relationship records.
- Pending Geely/Zeekr and Changan corporate references should not be silently upgraded to confirmed ownership.
- Huawei and CATL roles around AVATR/CHN are supported as strategic/joint relationships where stated; supplier/developer roles
  require separate evidence.

## Event findings

- The dataset has 61 events and supports vehicle, technology, brand, market and ownership milestones.
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

### Requires a dedicated primary-source pass

```text
BYD QIN L
BYD DM-p as a standalone Technology record
DiSus-C and DiSus-A as separate records
```

These should not be added merely from secondary descriptions or because a target count requires them.

## Geely / Zeekr slice audit

| Area | Result | Decision |
|---|---|---|
| Brand reverse indexes | `geely-auto` → `geely-ex5`; `zeekr` → `zeekr-7x` | corrected and kept aligned with vehicle `brand_id` |
| Manufacturer relationships | EX5 uses `geely-auto-group`; 7X uses `zeekr-group` | retain existing operating-company distinctions |
| Platform relationships | EX5 → `geely-gea`; 7X → `geely-sea` | typed `based_on` records and platform reverse indexes agree |
| Technology applications | two technologies on each vehicle | vehicle and technology application indexes agree |
| Pending corporate references | Geely Auto Group / Zeekr Group references remain pending where role scope is not exhaustive | do not upgrade from entity existence alone |
| EX5 / E5 naming | E5 and Galaxy E5 remain aliases/market-name context on the EX5 record | no duplicate Vehicle created |
| Technology history | ZEEKR 800V and Golden Battery retain unknown first dates and no guessed events | historical event pass remains deferred |
| News links | Existing EX5 global-unveil and 7X launch News are now indexed from their Vehicles | reuse existing IDs; no duplicate News created |

The three existing Geely / Zeekr market specifications remain separate records. `GLOBAL_REFERENCE` for EX5 is not treated as a
sale-market record; the two 7X records remain separated by China and EU markets. Existing unknown, claimed and confirmed evidence
states are preserved.

## BYD vertical-slice closeout

The closeout pass completed the relationship and evidence review for the ten priority vehicles. Five News documents now connect
SEALION 7, Han, Tang, Song L and DENZA N9 to their existing events and primary sources. SEALION 7 also has a separate EU market
specification with variant-level WLTP range, battery, drive and charging values; prices remain unknown because the cited source does
not establish one EU-wide price.

The remaining priority vehicles have News or explicit existing coverage as follows: SEAL, DENZA D9, YANGWANG U8 and FANGCHENGBAO
BAO 5 retain their existing event/source paths, while YANGWANG U9 retains its launch News. No new platform or technology relation
was added for Song L or DENZA N9 without direct source support.
