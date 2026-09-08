# China Auto Atlas — Media Registry

The MVP registers official image entry points before copying any binary assets into the repository.

```text
data/media/media-items.yaml  # metadata and source pages
assets/images/               # local derivatives, added after rights review
```

`collection_status: source_identified` means an official page or press source has been identified, but the image has not
yet been downloaded and approved for public redistribution. `rights_status: needs_review` is intentional for press
materials whose public reuse terms are not explicit.
