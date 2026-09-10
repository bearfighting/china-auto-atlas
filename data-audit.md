# China Auto Atlas — Current Data Audit

> Scope: existing Technology, Platform, Event and Relationship records plus the BYD seed slice.
> Date: 2026-09-10

## Audit result

```text
Validation: passed before and after audit documentation
Current build: 53 entities, 61 events, 98 sources, 32 relationships
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
