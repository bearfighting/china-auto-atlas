#!/usr/bin/env python3
"""Validate the file-based seed and build JSON runtime indexes."""

from __future__ import annotations

import argparse
import json
import shutil
from collections import defaultdict
from pathlib import Path
from typing import Any

import yaml

ROOT = Path(__file__).resolve().parents[1]
DATA_ROOT = ROOT / "data"
CONTENT_ROOT = ROOT / "content"
BUILD_ROOT = ROOT / "build"
PUBLIC_MEDIA_ROOT = ROOT / "public" / "assets"
TAXONOMY_REGISTRIES = {
    "technology_domains": ("technology-domains.yaml", "technology_domain_registry", "technology_domain"),
    "technology_categories": ("technology-categories.yaml", "technology_category_registry", "technology_category"),
    "technology_families": ("technology-families.yaml", "technology_family_registry", "technology_family"),
    "powertrain_architectures": (
        "powertrain-architectures.yaml",
        "powertrain_architecture_registry",
        "powertrain_architecture",
    ),
}
TAXONOMY_RECORD_TYPES = {spec[2] for spec in TAXONOMY_REGISTRIES.values()}
REFERENCE_KEYS = {
    "author_ids", "topic_ids", "entity_ids", "event_ids", "source_ids", "news_ids",
    "relationship_ids", "document_ids", "subject_ids", "brand_ids",
    "manufacturer_ids", "organization_ids", "operator_ids", "owner_ids", "platform_ids", "technology_ids",
    "vehicle_ids", "developer_ids", "supplier_ids", "parent_ids",
    "media_ids",
    "from_id", "to_id", "entity_id", "brand_id", "manufacturer_id", "organization_id", "factory_id",
    "platform_id", "market_spec_ids", "technology_id", "vehicle_id",
    "domain_id", "parent_id",
    "announcement_event_id", "preorder_event_id", "launch_event_id",
    "production_start_event_id", "delivery_start_event_id", "market_entry_event_ids",
}


def yaml_files() -> list[Path]:
    return sorted(DATA_ROOT.rglob("*.yaml")) + sorted(CONTENT_ROOT.rglob("*.yaml"))


def load_yaml(path: Path) -> Any:
    with path.open(encoding="utf-8") as handle:
        return yaml.safe_load(handle) or {}


def load_taxonomy(taxonomy_root: Path | None = None) -> tuple[dict[str, list[dict[str, Any]]], list[str]]:
    """Load the four non-entity taxonomy registries with their source paths."""
    taxonomy: dict[str, list[dict[str, Any]]] = {}
    errors: list[str] = []
    taxonomy_root = taxonomy_root or DATA_ROOT / "taxonomy"
    for root_key, (filename, registry_type, record_type) in TAXONOMY_REGISTRIES.items():
        path = taxonomy_root / filename
        if not path.is_file():
            errors.append(f"{path}: missing taxonomy registry")
            taxonomy[root_key] = []
            continue
        try:
            document = load_yaml(path)
        except yaml.YAMLError as exc:
            errors.append(f"{path}: YAML parse error: {exc}")
            taxonomy[root_key] = []
            continue

        if not isinstance(document, dict):
            errors.append(f"{path}: taxonomy registry must be an object")
            taxonomy[root_key] = []
            continue
        if document.get("schema_version") != 1:
            errors.append(f"{path}: schema_version must be 1")
        if document.get("type") != registry_type:
            errors.append(f"{path}: type must be {registry_type}")
        allowed_document_keys = {"schema_version", "type", root_key}
        unexpected_keys = sorted(set(document) - allowed_document_keys)
        if unexpected_keys:
            errors.append(f"{path}: unexpected registry fields: {', '.join(unexpected_keys)}")

        records = document.get(root_key)
        if not isinstance(records, list):
            errors.append(f"{path}: {root_key} must be a list")
            taxonomy[root_key] = []
            continue

        normalized: list[dict[str, Any]] = []
        try:
            source_file = str(path.relative_to(ROOT))
        except ValueError:
            source_file = str(path)
        for index, record in enumerate(records):
            if not isinstance(record, dict):
                errors.append(f"{path}: {root_key}[{index}] must be an object")
                continue
            normalized_record = dict(record)
            normalized_record["_file"] = source_file
            if normalized_record.get("type") != record_type:
                errors.append(f"{path}: {root_key}[{index}] type must be {record_type}")
            normalized.append(normalized_record)
        taxonomy[root_key] = normalized

    return taxonomy, errors


def validate_taxonomy(
    taxonomy: dict[str, list[dict[str, Any]]],
    entity_ids: set[str] | None = None,
) -> list[str]:
    """Validate taxonomy records, references, and Category parent acyclicity."""
    errors: list[str] = []
    entity_ids = entity_ids or set()
    all_records = [record for records in taxonomy.values() for record in records]
    by_id: dict[str, dict[str, Any]] = {}

    for record in all_records:
        path = record.get("_file", "taxonomy")
        record_id = record.get("id")
        if not isinstance(record_id, str) or not record_id:
            errors.append(f"{path}: taxonomy record id must be a non-empty string")
            continue
        if record_id in by_id:
            errors.append(f"duplicate taxonomy id {record_id}: {path} and {by_id[record_id]['_file']}")
        else:
            by_id[record_id] = record
        if not isinstance(record.get("type"), str):
            errors.append(f"{path}: {record_id} taxonomy record type is required")
        if record.get("type") not in TAXONOMY_RECORD_TYPES:
            errors.append(f"{path}: {record_id} has unknown taxonomy record type {record.get('type')!r}")
        if not isinstance(record.get("names"), dict) or not record.get("names"):
            errors.append(f"{path}: {record_id} names must be a non-empty object")

    for record_id in sorted(set(by_id) & entity_ids):
        errors.append(f"taxonomy id {record_id} conflicts with an entity id")

    domains = {
        record["id"]: record
        for record in taxonomy.get("technology_domains", [])
        if isinstance(record.get("id"), str) and record.get("type") == "technology_domain"
    }
    categories = {
        record["id"]: record
        for record in taxonomy.get("technology_categories", [])
        if isinstance(record.get("id"), str) and record.get("type") == "technology_category"
    }

    for category_id, category in categories.items():
        path = category.get("_file", "taxonomy")
        domain_id = category.get("domain_id")
        if not isinstance(domain_id, str):
            errors.append(f"{path}: {category_id} domain_id must reference a technology_domain")
        elif domain_id not in domains:
            errors.append(f"{path}: {category_id} domain_id references missing technology_domain {domain_id}")
        parent_id = category.get("parent_id")
        if parent_id is not None:
            if not isinstance(parent_id, str):
                errors.append(f"{path}: {category_id} parent_id must reference a technology_category or null")
            elif parent_id not in categories:
                errors.append(f"{path}: {category_id} parent_id references missing technology_category {parent_id}")

    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(category_id: str) -> None:
        if category_id in visited:
            return
        if category_id in visiting:
            category = categories[category_id]
            errors.append(f"{category.get('_file', 'taxonomy')}: Category parent cycle includes {category_id}")
            return
        visiting.add(category_id)
        parent_id = categories[category_id].get("parent_id")
        if isinstance(parent_id, str) and parent_id in categories:
            visit(parent_id)
        visiting.remove(category_id)
        visited.add(category_id)

    for category_id in categories:
        visit(category_id)

    return errors


def iter_id_objects(value: Any, path: Path):
    if isinstance(value, dict):
        if isinstance(value.get("id"), str):
            yield value, path
        for child in value.values():
            yield from iter_id_objects(child, path)
    elif isinstance(value, list):
        for child in value:
            yield from iter_id_objects(child, path)


def collect() -> tuple[dict[str, list[dict[str, Any]]], list[tuple[str, str, str]], list[str]]:
    records: dict[str, list[dict[str, Any]]] = defaultdict(list)
    refs: list[tuple[str, str, str]] = []
    errors: list[str] = []
    for path in yaml_files():
        try:
            document = load_yaml(path)
        except yaml.YAMLError as exc:
            errors.append(f"{path}: YAML parse error: {exc}")
            continue
        for record, _ in iter_id_objects(document, path):
            record_copy = dict(record)
            record_copy["_file"] = str(path.relative_to(ROOT))
            records[record["id"]].append(record_copy)

        def walk(value: Any):
            if isinstance(value, dict):
                for key, child in value.items():
                    if key in REFERENCE_KEYS:
                        values = child if isinstance(child, list) else [child]
                        for target in values:
                            if isinstance(target, str):
                                refs.append((str(path.relative_to(ROOT)), key, target))
                    walk(child)
            elif isinstance(value, list):
                for child in value:
                    walk(child)

        walk(document)
    for path in sorted((CONTENT_ROOT / "news").glob("*.md")):
        parts = path.read_text(encoding="utf-8").split("---", 2)
        if len(parts) < 3:
            continue
        try:
            frontmatter = yaml.safe_load(parts[1]) or {}
        except yaml.YAMLError:
            continue
        if isinstance(frontmatter.get("id"), str):
            record = dict(frontmatter)
            record["_file"] = str(path.relative_to(ROOT))
            records[frontmatter["id"]].append(record)
    return records, refs, errors


def first_record(records: dict[str, list[dict[str, Any]]], record_id: str) -> dict[str, Any] | None:
    values = records.get(record_id, [])
    return values[0] if values else None


def validate_relationship_indexes(records: dict[str, list[dict[str, Any]]]) -> list[str]:
    """Validate only relationship indexes whose two-way meaning is explicit in the model."""
    errors: list[str] = []
    vehicles = [
        record
        for values in records.values()
        for record in values
        if record.get("type") == "vehicle"
    ]

    def require_reverse(vehicle: dict[str, Any], target_id: str, field: str, target_field: str) -> None:
        target = first_record(records, target_id)
        if not target or target_field not in target:
            return
        if vehicle["id"] not in (target.get(target_field) or []):
            errors.append(
                f"{vehicle['_file']}: {vehicle['id']} {field} {target_id} is missing reverse "
                f"{target_field} entry {vehicle['id']}"
            )

    for vehicle in vehicles:
        vehicle_id = vehicle["id"]
        brand_id = vehicle.get("brand_id")
        if isinstance(brand_id, str):
            require_reverse(vehicle, brand_id, "brand_id", "vehicle_ids")

        platform_id = vehicle.get("platform_id")
        if isinstance(platform_id, str):
            require_reverse(vehicle, platform_id, "platform_id", "vehicle_ids")

        for technology_id in vehicle.get("technology_ids") or []:
            if isinstance(technology_id, str):
                require_reverse(vehicle, technology_id, "technology_ids", "vehicle_ids")

        timeline = vehicle.get("timeline") or {}
        timeline_event_ids = [
            timeline.get("announcement_event_id"),
            timeline.get("preorder_event_id"),
            timeline.get("launch_event_id"),
            timeline.get("production_start_event_id"),
            timeline.get("delivery_start_event_id"),
            *(timeline.get("market_entry_event_ids") or []),
        ]
        indexed_event_ids = set(vehicle.get("event_ids") or [])
        for event_id in timeline_event_ids:
            if isinstance(event_id, str) and event_id not in indexed_event_ids:
                errors.append(
                    f"{vehicle['_file']}: {vehicle_id} timeline references {event_id} but "
                    f"event_ids does not include {event_id}"
                )

        for market_spec_id in vehicle.get("market_spec_ids") or []:
            if not isinstance(market_spec_id, str):
                continue
            market_spec = first_record(records, market_spec_id)
            if market_spec and market_spec.get("vehicle_id") != vehicle_id:
                errors.append(
                    f"{vehicle['_file']}: {vehicle_id} market_spec_ids references {market_spec_id}, "
                    f"whose vehicle_id is {market_spec.get('vehicle_id')}"
                )

    for values in records.values():
        for record in values:
            if record.get("type") != "market_specification":
                continue
            vehicle_id = record.get("vehicle_id")
            vehicle = first_record(records, vehicle_id) if isinstance(vehicle_id, str) else None
            if vehicle and "market_spec_ids" in vehicle and record["id"] not in (vehicle.get("market_spec_ids") or []):
                errors.append(
                    f"{record['_file']}: {record['id']} is assigned to {vehicle_id} but is missing from "
                    f"that vehicle's market_spec_ids"
                )

    return errors


def validate_product_hierarchy(records: dict[str, list[dict[str, Any]]]) -> list[str]:
    """Validate optional Product Line / Vehicle Series parent consistency."""
    errors: list[str] = []
    brands = {
        record["id"]
        for values in records.values()
        for record in values
        if record.get("type") == "brand"
    }
    product_lines = {
        record["id"]: record
        for values in records.values()
        for record in values
        if record.get("type") == "product_line"
    }
    series = {
        record["id"]: record
        for values in records.values()
        for record in values
        if record.get("type") == "vehicle_series"
    }

    for product_line_id, product_line in product_lines.items():
        brand_id = product_line.get("brand_id")
        if not isinstance(brand_id, str) or brand_id not in brands:
            errors.append(
                f"{product_line['_file']}: {product_line_id} brand_id must reference a brand"
            )

    for series_id, vehicle_series in series.items():
        brand_id = vehicle_series.get("brand_id")
        if not isinstance(brand_id, str) or brand_id not in brands:
            errors.append(f"{vehicle_series['_file']}: {series_id} brand_id must reference a brand")
        product_line_id = vehicle_series.get("product_line_id")
        if product_line_id is None:
            continue
        if not isinstance(product_line_id, str):
            errors.append(f"{vehicle_series['_file']}: {series_id} product_line_id must reference a product_line")
            continue
        product_line = product_lines.get(product_line_id)
        if not product_line:
            errors.append(
                f"{vehicle_series['_file']}: {series_id} product_line_id must reference a product_line"
            )
        elif product_line.get("brand_id") != brand_id:
            errors.append(
                f"{vehicle_series['_file']}: {series_id} brand_id does not match product_line_id {product_line_id}"
            )

    vehicles = [
        record
        for values in records.values()
        for record in values
        if record.get("type") == "vehicle"
    ]
    for vehicle in vehicles:
        vehicle_id = vehicle["id"]
        brand_id = vehicle.get("brand_id")
        product_line_id = vehicle.get("product_line_id")
        series_id = vehicle.get("series_id")
        product_line = product_lines.get(product_line_id) if isinstance(product_line_id, str) else None
        vehicle_series = series.get(series_id) if isinstance(series_id, str) else None
        if product_line_id is not None and not isinstance(product_line_id, str):
            errors.append(f"{vehicle['_file']}: {vehicle_id} product_line_id must reference a product_line")
        elif product_line_id is not None and not product_line:
            errors.append(f"{vehicle['_file']}: {vehicle_id} product_line_id must reference a product_line")
        if series_id is not None and not isinstance(series_id, str):
            errors.append(f"{vehicle['_file']}: {vehicle_id} series_id must reference a vehicle_series")
        elif series_id is not None and not vehicle_series:
            errors.append(f"{vehicle['_file']}: {vehicle_id} series_id must reference a vehicle_series")
        if product_line and product_line.get("brand_id") != brand_id:
            errors.append(f"{vehicle['_file']}: {vehicle_id} brand_id does not match product_line_id {product_line_id}")
        if vehicle_series and vehicle_series.get("brand_id") != brand_id:
            errors.append(f"{vehicle['_file']}: {vehicle_id} brand_id does not match series_id {series_id}")
        if vehicle_series and product_line_id and vehicle_series.get("product_line_id") != product_line_id:
            errors.append(f"{vehicle['_file']}: {vehicle_id} product_line_id does not match series_id {series_id}")

    return errors


def validate_factory_hierarchy(records: dict[str, list[dict[str, Any]]]) -> list[str]:
    """Validate optional Factory / Production Line references and applications."""
    errors: list[str] = []
    entities = {record["id"]: record for values in records.values() for record in values}
    factories = {record["id"]: record for record in entities.values() if record.get("type") == "factory"}
    lines = {record["id"]: record for record in entities.values() if record.get("type") == "production_line"}
    vehicles = {record["id"]: record for record in entities.values() if record.get("type") == "vehicle"}
    technologies = {record["id"]: record for record in entities.values() if record.get("type") == "technology"}
    organizations = {record["id"]: record for record in entities.values() if record.get("type") in {"organization", "manufacturer", "supplier"}}

    for factory_id, factory in factories.items():
        for field in ("operator_ids", "owner_ids"):
            for organization_id in factory.get(field) or []:
                if organization_id not in organizations:
                    errors.append(f"{factory['_file']}: {factory_id} {field} must reference an organization")

    for line_id, line in lines.items():
        factory_id = line.get("factory_id")
        if not isinstance(factory_id, str) or factory_id not in factories:
            errors.append(f"{line['_file']}: {line_id} factory_id must reference a factory")
        for vehicle_id in line.get("vehicle_ids") or []:
            if vehicle_id not in vehicles:
                errors.append(f"{line['_file']}: {line_id} vehicle_ids must reference a vehicle")
        for technology_id in line.get("technology_ids") or []:
            if technology_id not in technologies:
                errors.append(f"{line['_file']}: {line_id} technology_ids must reference a technology")
        capacity = line.get("reported_capacity")
        if capacity is not None and not isinstance(capacity, dict):
            errors.append(f"{line['_file']}: {line_id} reported_capacity must be an object")
        elif isinstance(capacity, dict):
            if "value" not in capacity or "unit" not in capacity:
                errors.append(f"{line['_file']}: {line_id} reported_capacity requires value and unit")
            for source_id in capacity.get("source_ids") or []:
                if source_id not in entities or entities[source_id].get("type") != "source":
                    errors.append(f"{line['_file']}: {line_id} reported_capacity source_ids must reference a source")

    return errors


def validate() -> int:
    records, refs, errors = collect()
    taxonomy, taxonomy_errors = load_taxonomy()
    errors.extend(taxonomy_errors)
    entity_ids = {
        record["id"]
        for values in records.values()
        for record in values
        if record.get("type") not in TAXONOMY_RECORD_TYPES
    }
    errors.extend(validate_taxonomy(taxonomy, entity_ids))
    duplicate_ids = {key: values for key, values in records.items() if len(values) > 1}
    known_ids = set(records)
    missing = [item for item in refs if item[2] not in known_ids]

    for path in sorted(CONTENT_ROOT.glob("news/*.md")):
        parts = path.read_text(encoding="utf-8").split("---", 2)
        if len(parts) < 3:
            errors.append(f"{path}: missing YAML frontmatter")
            continue
        try:
            frontmatter = yaml.safe_load(parts[1]) or {}
        except yaml.YAMLError as exc:
            errors.append(f"{path}: frontmatter parse error: {exc}")
            continue
        required = {"id", "type", "title", "slug", "status", "published_at", "entity_ids", "event_ids", "source_ids"}
        absent = sorted(required - set(frontmatter))
        if absent:
            errors.append(f"{path}: missing fields: {', '.join(absent)}")

    if duplicate_ids:
        for key, values in sorted(duplicate_ids.items()):
            locations = ", ".join(item["_file"] for item in values)
            errors.append(f"duplicate id {key}: {locations}")
    errors.extend(f"{path}: missing {key} reference {target}" for path, key, target in missing)
    errors.extend(validate_relationship_indexes(records))
    errors.extend(validate_product_hierarchy(records))
    errors.extend(validate_factory_hierarchy(records))

    media_path = DATA_ROOT / "media" / "media-items.yaml"
    if media_path.exists():
        media_document = load_yaml(media_path)
        registered_assets = set()
        for media in media_document.get("media", []):
            asset_path = media.get("asset_path")
            if not asset_path:
                continue
            registered_assets.add(asset_path)
            requires_local_asset = media.get("collection_status") == "downloaded" or (
                media.get("collection_status") == "approved" and media.get("rights_status") == "approved"
            )
            if requires_local_asset and not (ROOT / asset_path).is_file():
                errors.append(f"{media_path}: required local asset is missing {asset_path}")
        for asset in sorted((ROOT / "assets").rglob("*")) if (ROOT / "assets").exists() else []:
            if asset.is_file() and str(asset.relative_to(ROOT)) not in registered_assets:
                errors.append(f"unregistered media asset {asset.relative_to(ROOT)}")

    if errors:
        print("VALIDATION FAILED")
        print("\n".join(errors))
        return 1
    print(f"VALIDATION OK: {len(records)} IDs, {len(refs)} references")
    return 0


def build() -> int:
    if validate() != 0:
        return 1
    records, _, _ = collect()
    taxonomy, _ = load_taxonomy()
    BUILD_ROOT.mkdir(exist_ok=True)
    flat = [record for values in records.values() for record in values]
    index = {
        "schema_version": 1,
        "entities": sorted((r for r in flat if r.get("type") in {"brand", "manufacturer", "organization", "platform", "technology", "vehicle", "product_line", "vehicle_series", "factory", "production_line"}), key=lambda r: r["id"]),
        "technology_domains": sorted(taxonomy["technology_domains"], key=lambda r: r["id"]),
        "technology_categories": sorted(taxonomy["technology_categories"], key=lambda r: r["id"]),
        "technology_families": sorted(taxonomy["technology_families"], key=lambda r: r["id"]),
        "powertrain_architectures": sorted(taxonomy["powertrain_architectures"], key=lambda r: r["id"]),
        "market_specifications": sorted((r for r in flat if r.get("type") == "market_specification"), key=lambda r: r["id"]),
        "relationships": sorted((r for r in flat if r.get("type") == "relationship"), key=lambda r: r["id"]),
        "events": sorted((r for r in flat if r.get("type") == "event"), key=lambda r: r["id"]),
        "sources": sorted((r for r in flat if r.get("type") == "source"), key=lambda r: r["id"]),
        "media": sorted((r for r in flat if r.get("type") == "media"), key=lambda r: r["id"]),
    }
    if PUBLIC_MEDIA_ROOT.exists():
        shutil.rmtree(PUBLIC_MEDIA_ROOT)
    for media in index["media"]:
        if media.get("collection_status") != "approved" or media.get("rights_status") != "approved":
            continue
        asset_path = Path(str(media.get("asset_path", "")))
        if len(asset_path.parts) < 2 or asset_path.parts[0] != "assets":
            continue
        source = ROOT / asset_path
        if not source.is_file():
            continue
        target = PUBLIC_MEDIA_ROOT.joinpath(*asset_path.parts[1:])
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
    for key in (
        "entities", "technology_domains", "technology_categories", "technology_families",
        "powertrain_architectures", "market_specifications", "relationships", "events", "sources", "media",
    ):
        for record in index[key]:
            record.pop("_file", None)
    (BUILD_ROOT / "data-index.json").write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    searchable_types = {"vehicle", "brand", "manufacturer", "technology"}
    search_entries = []
    for entity in index["entities"]:
        if entity.get("type") not in searchable_types:
            continue
        names = entity.get("names") or {}
        search_entries.append({
            "kind": "entity",
            "id": entity["id"],
            "type": entity["type"],
            "slug": entity.get("slug") or entity["id"],
            "display_name": names.get("en") or names.get("zh-CN") or entity["id"],
            "display_name_zh": names.get("zh-CN"),
            "aliases": entity.get("aliases", []),
        })

    documents = []
    for path in sorted((CONTENT_ROOT / "news").glob("*.md")):
        parts = path.read_text(encoding="utf-8").split("---", 2)
        frontmatter = yaml.safe_load(parts[1]) or {}
        frontmatter["body"] = parts[2].strip()
        documents.append(frontmatter)
        search_entries.append({
            "kind": "news",
            "id": frontmatter["id"],
            "type": "news",
            "slug": frontmatter["slug"],
            "display_name": frontmatter["title"],
            "display_name_zh": frontmatter.get("title_zh"),
            "aliases": [],
        })
    search_entries.sort(key=lambda entry: (entry["type"], entry["id"]))
    (BUILD_ROOT / "search-index.json").write_text(
        json.dumps(search_entries, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    authors = load_yaml(CONTENT_ROOT / "taxonomy" / "authors.yaml").get("authors", [])
    topics = load_yaml(CONTENT_ROOT / "taxonomy" / "topics.yaml").get("topics", [])
    content_index = {
        "schema_version": 1,
        "authors": authors,
        "topics": topics,
        "documents": documents,
    }
    (BUILD_ROOT / "content-index.json").write_text(json.dumps(content_index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"BUILD OK: {len(index['entities'])} entities, {len(index['events'])} events, {len(documents)} documents, {len(index['media'])} media records")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("command", choices=("validate", "build"))
    args = parser.parse_args()
    return validate() if args.command == "validate" else build()


if __name__ == "__main__":
    raise SystemExit(main())
