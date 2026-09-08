#!/usr/bin/env python3
"""Extract official image URLs from registered media pages and create local WebP assets."""

from __future__ import annotations

import html
import re
import argparse
import urllib.request
from pathlib import Path

import yaml
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "data/media/media-items.yaml"
ASSET_ROOT = ROOT / "assets/images"
REPORT = ROOT / "build/media-extraction-results.yaml"

IMAGE_RE = re.compile(r"https?://[^\"'<>\\ ]+?\.(?:jpg|jpeg|png|webp|avif|svg)(?:\?[^\"'<>\\ ]*)?", re.I)


def fetch(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": "ChinaAutoAtlas/0.1 media collector"})
    with urllib.request.urlopen(request, timeout=8) as response:
        return response.read()


def image_candidates(page: str, media: dict) -> list[str]:
    page = html.unescape(page).replace("\\/", "/")
    candidates = list(dict.fromkeys(IMAGE_RE.findall(page)))
    entity = media["entity_id"].replace("-", "").lower()
    usage = media["usage"]
    scored = []
    for url in candidates:
        lower = url.lower()
        score = 0
        if usage == "vehicle_hero":
            if any(token in lower for token in ("hero", "banner", "kv", "vehicle", "model", entity)):
                score += 5
            if any(token in lower for token in ("logo", "favicon", "icon", "qr", "avatar")):
                score -= 10
        else:
            if any(token in lower for token in ("logo", "brand", "header")):
                score += 10
            if any(token in lower for token in ("favicon", "icon", "qr")):
                score -= 10
        if url.lower().endswith(".svg"):
            score += 2
        scored.append((score, len(url), url))
    return [url for _, _, url in sorted(scored, reverse=True)]


def save_asset(data: bytes, output: Path, source_url: str) -> tuple[str, str]:
    output.parent.mkdir(parents=True, exist_ok=True)
    target_suffix = output.suffix.lower()
    source_is_svg = source_url.lower().split("?", 1)[0].endswith(".svg")
    if target_suffix == ".svg":
        if not source_is_svg:
            raise ValueError("registered SVG target requires an SVG source")
        output.write_bytes(data)
        return str(output.relative_to(ROOT)), "svg"
    if target_suffix != ".webp":
        raise ValueError(f"unsupported registered media target: {output.suffix}")
    if source_is_svg:
        raise ValueError("registered WebP target requires a raster source")
    image_path = output.with_suffix(".webp")
    with Image.open(__import__("io").BytesIO(data)) as image:
        image.convert("RGB").save(image_path, "WEBP", quality=90, method=6)
    return str(image_path.relative_to(ROOT)), "webp"


def main() -> int:
    registry = yaml.safe_load(REGISTRY.read_text(encoding="utf-8")) or {}
    parser = argparse.ArgumentParser()
    parser.add_argument("--start", type=int, default=0)
    parser.add_argument("--end", type=int, default=None)
    args = parser.parse_args()
    all_media = registry.get("media", [])
    selected_media = all_media[args.start:args.end]
    previous = {}
    if REPORT.exists():
        previous_doc = yaml.safe_load(REPORT.read_text(encoding="utf-8")) or {}
        previous = {item["id"]: item for item in previous_doc.get("results", [])}
    results = []
    for media in selected_media:
        result = {"id": media["id"], "status": "not_found", "source_page_url": media["source_page_url"]}
        existing_candidates = [ROOT / media["asset_path"]]
        existing = next((path for path in existing_candidates if path.exists()), None)
        if existing:
            result.update(status="existing", asset_path=str(existing.relative_to(ROOT)))
            results.append(result)
            previous[result["id"]] = result
            print(result["id"], result["status"], result["asset_path"])
            continue
        try:
            page = fetch(media["source_page_url"]).decode("utf-8", errors="ignore")
            candidates = image_candidates(page, media)
            for candidate in candidates[:8]:
                try:
                    asset_path, fmt = save_asset(fetch(candidate), ROOT / media["asset_path"], candidate)
                    result.update(status="downloaded", source_asset_url=candidate, asset_path=asset_path, format=fmt)
                    break
                except Exception as exc:
                    result["last_error"] = str(exc)
        except Exception as exc:
            result["status"] = "page_error"
            result["error"] = str(exc)
        results.append(result)
        print(result["id"], result["status"], result.get("asset_path", ""))
        previous[result["id"]] = result
    REPORT.parent.mkdir(exist_ok=True)
    merged = [previous[key] for key in [item["id"] for item in all_media] if key in previous]
    REPORT.write_text(yaml.safe_dump({"schema_version": 1, "results": merged}, allow_unicode=True, sort_keys=False), encoding="utf-8")
    print(f"MEDIA EXTRACTION REPORT: {sum(r['status'] == 'downloaded' for r in merged)}/{len(all_media)} downloaded")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
