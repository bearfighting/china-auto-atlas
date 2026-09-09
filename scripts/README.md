# Data pipeline

Requires Python 3.10+ and PyYAML. Install the development dependency with:

```bash
python3 -m pip install -r requirements-dev.txt
```

```bash
python3 scripts/data_pipeline.py validate
python3 scripts/data_pipeline.py build
python3 scripts/extract_media_assets.py
```

`validate` checks YAML/frontmatter syntax, duplicate IDs, required news metadata and cross-file references.
`build` runs validation first and generates `build/data-index.json`, `build/content-index.json`, and `build/search-index.json` for the MVP adapter.

The reproducible local release check is available as `pnpm quality:check`. It runs data validation, the data build, static
checks, unit tests, the production build, and Playwright E2E checks in order.
`extract_media_assets.py` reads registered official pages, downloads candidate image resources, converts raster images to
WebP, preserves SVG when available, and writes a review report to `build/media-extraction-results.yaml`.

Downloaded media is still subject to rights review. The media validator requires every downloaded asset to exist locally
and rejects local files that are not registered in `data/media/media-items.yaml`.
