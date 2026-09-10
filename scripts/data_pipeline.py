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
REFERENCE_KEYS = {
    "author_ids", "topic_ids", "entity_ids", "event_ids", "source_ids", "news_ids",
    "relationship_ids", "document_ids", "subject_ids", "brand_ids",
    "manufacturer_ids", "organization_ids", "platform_ids", "technology_ids",
    "vehicle_ids", "developer_ids", "supplier_ids", "parent_ids",
    "media_ids",
    "from_id", "to_id", "entity_id", "brand_id", "manufacturer_id", "organization_id",
    "platform_id", "market_spec_ids", "technology_id", "vehicle_id",
    "announcement_event_id", "preorder_event_id", "launch_event_id",
    "production_start_event_id", "delivery_start_event_id", "market_entry_event_ids",
}


def yaml_files() -> list[Path]:
    return sorted(DATA_ROOT.rglob("*.yaml")) + sorted(CONTENT_ROOT.rglob("*.yaml"))


def load_yaml(path: Path) -> Any:
    with path.open(encoding="utf-8") as handle:
        return yaml.safe_load(handle) or {}


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


def validate() -> int:
    records, refs, errors = collect()
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
    BUILD_ROOT.mkdir(exist_ok=True)
    flat = [record for values in records.values() for record in values]
    index = {
        "schema_version": 1,
        "entities": sorted((r for r in flat if r.get("type") in {"brand", "manufacturer", "organization", "platform", "technology", "vehicle"}), key=lambda r: r["id"]),
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
    for key in ("entities", "market_specifications", "relationships", "events", "sources", "media"):
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
