# China Auto Atlas — Organization Seed v0.1

Verified: **2026-09-08**

This pack contains organizations required to resolve current Brand, Vehicle, Technology, and Platform references.

Canonical records: `data/entities/organizations/`.
Relationships and sources are global layers under `data/relationships/` and `data/sources/`.

## Entity rule

Use `type` for the broad entity class and `organization_role` for the organization's role in the automotive ecosystem.

```text
manufacturer
supplier
technology_partner
investor
```

Ownership, operation, manufacturing, supply, and investment relationships should remain separate records with their own sources and validity periods.

The current seed also uses `strategic_partner_of` for sourced collaboration that is not an ownership, control, or supplier relationship. It must not be interpreted as equity ownership.

Some organization IDs are referenced by existing seed data. They are included here only when the selected source supports the identity or role; unsupported details remain unknown.
