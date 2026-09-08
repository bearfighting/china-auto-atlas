# China Auto Atlas — Editorial Guidelines

> Version: 0.1  
> Status: MVP draft

## Editorial Standard

China Auto Atlas explains China's automotive industry for international readers. Important statements should be accurate, attributable, appropriately qualified, and placed in context.

```text
Discovery → Sources → Verification → Draft → Review → Publish → Structured update
```

## Evidence Status

```text
confirmed   reliable official, regulatory, or direct evidence
claimed     stated by a manufacturer or interested party
reported    published by a credible source without direct confirmation
estimated   calculated or inferred from available evidence
rumored     unconfirmed information worth tracking
unknown     insufficient reliable information
```

Do not present `claimed`, `reported`, `estimated`, or `rumored` information as confirmed fact.

## Sources

Important facts should have a source record. Prefer the source closest to the fact:

```text
Regulatory / government
Primary company material
Direct interview or observation
Established media
Industry media
Independent creator
Social media / community
```

Source authority depends on the claim. A manufacturer page may be authoritative for an official price, but not independent evidence for “industry-leading technology.”

Preserve source title, publisher, URL, language, publication date, access date, and related entities or events.

## Context and Attribution

Distinguish clearly between what the source says, what is independently verified, what remains uncertain, and why the information matters outside China. Translate technical standards and marketing language into their meaning; do not silently convert a manufacturer claim into an editorial conclusion.

## Structured Data

Do not add a canonical value without recording its evidence status and source. Unknown is preferable to an unsupported value. Preserve market and time context for prices, range, availability, specifications, ownership, and production status.

Before publishing a page or data record, confirm:

- the fact has at least one source or is explicitly marked unknown;
- official claims are not presented as independent confirmation;
- market, variant, unit, test cycle, and effective date are preserved where relevant;
- unresolved values use `null` or the project’s controlled unknown state;
- media is registered and marked `approved_for_publish` before public reuse;
- relationships and lifecycle events include dates when the source supports them.

## Independence and Corrections

Editorial access is not an endorsement. Disclose press trips, loan vehicles, sponsored activity, paid partnerships, data arrangements, or other relevant relationships.

Material factual errors should receive a visible correction note. Corrections must update both the article and related structured data while preserving correction history.

## Language and Style

Use plain international English, preserve official model and trademark names, and include Chinese names where useful for identification. Always provide units and relevant test standards, such as CLTC, WLTP, or EPA, when known.
