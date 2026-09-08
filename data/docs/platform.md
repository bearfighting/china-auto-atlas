# China Auto Atlas — Platform Seed v0.1

Verified: **2026-09-08**

This pack contains the platform entities required by the current Vehicle and Technology seeds.

Canonical records: `data/entities/platforms/`.

## Modeling rule

```text
Platform = vehicle-level architecture or product foundation
Technology = a technical system, method, component, or capability
```

Platform records use stable IDs and link to vehicles through `vehicle_ids`. A platform name or manufacturer claim does not imply that every vehicle in a group uses that platform.

The four records are sufficient for the current MVP references:

```text
BYD e-Platform 3.0 → BYD SEAL
Geely SEA          → ZEEKR 7X
Geely GEA          → GEELY EX5
AVATR CHN          → AVATR 11
```

Some platform-like records remain in `data/entities/technologies` for compatibility, including BYD DMO and e⁴. They use `entity_role: platform-technology` until their migration is justified by actual page and query requirements.

## Relationships

Platform and vehicle relationships are stored in `data/relationships/platform-relationships.yaml`.

```text
Platform → Organization: developed_by / jointly_developed_by
Vehicle → Platform: based_on
```

Relationship records are authoritative for graph traversal; the ID arrays on entity files are navigation indexes.
