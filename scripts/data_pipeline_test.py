import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

import yaml

from data_pipeline import (
    TAXONOMY_REGISTRIES,
    load_taxonomy,
    validate_factory_hierarchy,
    validate_product_hierarchy,
    validate_relationship_indexes,
    validate_relationships,
    validate_taxonomy,
    validate_technology_classification,
    validate_vehicle_architecture,
)


def record(record_id, record_type, **fields):
    return {"id": record_id, "type": record_type, "_file": f"data/{record_id}.yaml", **fields}


class RelationshipIndexValidationTests(unittest.TestCase):
    def test_reports_missing_brand_reverse_index(self):
        records = {
            "vehicle": [record("vehicle", "vehicle", brand_id="brand")],
            "brand": [record("brand", "brand", vehicle_ids=[])],
        }
        errors = validate_relationship_indexes(records)
        self.assertTrue(any("brand_id brand" in error and "vehicle_ids" in error for error in errors))

    def test_reports_missing_technology_reverse_index(self):
        records = {
            "vehicle": [record("vehicle", "vehicle", technology_ids=["technology"])],
            "technology": [record("technology", "technology", vehicle_ids=[])],
        }
        errors = validate_relationship_indexes(records)
        self.assertTrue(any("technology_ids technology" in error and "vehicle_ids" in error for error in errors))

    def test_reports_timeline_event_missing_from_vehicle_index(self):
        records = {
            "vehicle": [
                record(
                    "vehicle",
                    "vehicle",
                    timeline={"launch_event_id": "event"},
                    event_ids=[],
                )
            ],
            "event": [record("event", "event")],
        }
        errors = validate_relationship_indexes(records)
        self.assertTrue(any("timeline references event" in error and "event_ids" in error for error in errors))

    def test_reports_market_specification_reverse_mismatch(self):
        records = {
            "vehicle": [record("vehicle", "vehicle", market_spec_ids=[])],
            "spec": [record("spec", "market_specification", vehicle_id="vehicle")],
        }
        errors = validate_relationship_indexes(records)
        self.assertTrue(any("spec" in error and "market_spec_ids" in error for error in errors))


class ProductHierarchyValidationTests(unittest.TestCase):
    def test_accepts_optional_product_line_and_series_hierarchy(self):
        records = {
            "brand": [record("brand", "brand")],
            "product-line": [record("line", "product_line", brand_id="brand")],
            "series": [record("series", "vehicle_series", brand_id="brand", product_line_id="line")],
            "vehicle": [
                record(
                    "vehicle",
                    "vehicle",
                    brand_id="brand",
                    product_line_id="line",
                    series_id="series",
                )
            ],
        }
        self.assertEqual(validate_product_hierarchy(records), [])

    def test_reports_cross_brand_product_hierarchy(self):
        records = {
            "brand": [record("brand-a", "brand"), record("brand-b", "brand")],
            "product-line": [record("line", "product_line", brand_id="brand-a")],
            "series": [record("series", "vehicle_series", brand_id="brand-b", product_line_id="line")],
        }
        errors = validate_product_hierarchy(records)
        self.assertTrue(any("does not match product_line_id" in error for error in errors))

    def test_reports_vehicle_product_line_and_series_mismatch(self):
        records = {
            "brand": [record("brand", "brand")],
            "product-line": [
                record("line-a", "product_line", brand_id="brand"),
                record("line-b", "product_line", brand_id="brand"),
            ],
            "series": [record("series", "vehicle_series", brand_id="brand", product_line_id="line-a")],
            "vehicle": [record("vehicle", "vehicle", brand_id="brand", product_line_id="line-b", series_id="series")],
        }
        errors = validate_product_hierarchy(records)
        self.assertTrue(any("does not match series_id" in error for error in errors))

    def test_accepts_sourced_factory_and_production_line_hierarchy(self):
        records = {
            "factory": [record("factory", "factory")],
            "line": [record("line", "production_line", factory_id="factory", vehicle_ids=["vehicle"], technology_ids=["technology"])],
            "vehicle": [record("vehicle", "vehicle")],
            "technology": [record("technology", "technology")],
        }
        self.assertEqual(validate_factory_hierarchy(records), [])

    def test_reports_invalid_factory_and_production_line_references(self):
        records = {
            "factory": [record("factory", "factory", operator_ids=["missing-org"])],
            "line": [record("line", "production_line", factory_id="missing-factory", vehicle_ids=["missing-vehicle"])],
        }
        errors = validate_factory_hierarchy(records)
        self.assertTrue(any("operator_ids" in error for error in errors))
        self.assertTrue(any("factory_id" in error for error in errors))
        self.assertTrue(any("vehicle_ids" in error for error in errors))

    def test_reports_missing_hierarchy_references(self):
        records = {
            "brand": [record("brand", "brand")],
            "product-line": [record("line", "product_line", brand_id="missing-brand")],
            "series": [record("series", "vehicle_series", brand_id="brand", product_line_id="missing-line")],
            "vehicle": [record("vehicle", "vehicle", brand_id="brand", product_line_id="line", series_id="missing-series")],
        }
        errors = validate_product_hierarchy(records)
        self.assertTrue(any("brand_id must reference a brand" in error for error in errors))
        self.assertTrue(any("product_line_id must reference a product_line" in error for error in errors))
        self.assertTrue(any("series_id must reference a vehicle_series" in error for error in errors))

    def test_reports_non_string_hierarchy_references_without_crashing(self):
        records = {
            "brand": [record("brand", "brand")],
            "product-line": [record("line", "product_line", brand_id=["brand"])],
            "series": [record("series", "vehicle_series", brand_id="brand", product_line_id={"id": "line"})],
            "vehicle": [record("vehicle", "vehicle", brand_id="brand", product_line_id=[], series_id={"id": "series"})],
        }
        errors = validate_product_hierarchy(records)
        self.assertGreaterEqual(len(errors), 3)


class TaxonomyValidationTests(unittest.TestCase):
    def test_loads_the_four_taxonomy_registries(self):
        taxonomy, errors = load_taxonomy()
        self.assertEqual(errors, [])
        self.assertEqual(len(taxonomy["technology_domains"]), 6)
        self.assertEqual(len(taxonomy["technology_categories"]), 9)
        self.assertEqual(len(taxonomy["technology_families"]), 5)
        self.assertEqual(len(taxonomy["powertrain_architectures"]), 8)
        self.assertEqual(validate_taxonomy(taxonomy), [])

    def write_valid_registries(self, root: Path):
        for root_key, (filename, registry_type, record_type) in TAXONOMY_REGISTRIES.items():
            document = {
                "schema_version": 1,
                "type": registry_type,
                root_key: [],
            }
            if root_key == "technology_domains":
                document[root_key] = [{"id": "domain", "type": record_type, "names": {"en": "Domain"}}]
            root.joinpath(filename).write_text(yaml.safe_dump(document), encoding="utf-8")

    def test_loader_rejects_registry_shape_errors(self):
        with TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            self.write_valid_registries(root)

            domains_path = root / "technology-domains.yaml"
            domains = yaml.safe_load(domains_path.read_text(encoding="utf-8"))
            domains["wrong_root"] = domains.pop("technology_domains")
            domains["type"] = "wrong_registry_type"
            domains_path.write_text(yaml.safe_dump(domains), encoding="utf-8")
            (root / "powertrain-architectures.yaml").unlink()

            _, errors = load_taxonomy(root)
            self.assertTrue(any("missing taxonomy registry" in error for error in errors))
            self.assertTrue(any("type must be technology_domain_registry" in error for error in errors))
            self.assertTrue(any("technology_domains must be a list" in error for error in errors))
            self.assertTrue(any("unexpected registry fields: wrong_root" in error for error in errors))

    def test_loader_rejects_record_in_wrong_registry(self):
        with TemporaryDirectory() as temporary_directory:
            root = Path(temporary_directory)
            self.write_valid_registries(root)
            domains_path = root / "technology-domains.yaml"
            domains = yaml.safe_load(domains_path.read_text(encoding="utf-8"))
            domains["technology_domains"][0]["type"] = "technology_category"
            domains_path.write_text(yaml.safe_dump(domains), encoding="utf-8")

            _, errors = load_taxonomy(root)
            self.assertTrue(any("technology_domains[0] type must be technology_domain" in error for error in errors))

    def test_rejects_invalid_taxonomy_types_and_required_fields(self):
        taxonomy = {
            "technology_domains": [record("domain", "wrong_type", names={})],
            "technology_categories": [record("category", "technology_category", names={})],
            "technology_families": [],
            "powertrain_architectures": [],
        }
        errors = validate_taxonomy(taxonomy)
        self.assertTrue(any("unknown taxonomy record type" in error for error in errors))
        self.assertTrue(any("names must be a non-empty object" in error for error in errors))
        self.assertTrue(any("domain_id must reference" in error for error in errors))

    def test_rejects_duplicate_and_entity_conflicting_ids(self):
        taxonomy = {
            "technology_domains": [
                record("duplicate", "technology_domain", names={"en": "One"}),
                record("duplicate", "technology_domain", names={"en": "Two"}),
            ],
            "technology_categories": [],
            "technology_families": [],
            "powertrain_architectures": [],
        }
        errors = validate_taxonomy(taxonomy, {"duplicate"})
        self.assertTrue(any("duplicate taxonomy id" in error for error in errors))
        self.assertTrue(any("conflicts with an entity id" in error for error in errors))

    def test_rejects_invalid_category_domain_parent_and_cycles(self):
        taxonomy = {
            "technology_domains": [record("domain", "technology_domain", names={"en": "Domain"})],
            "technology_categories": [
                record("category-a", "technology_category", domain_id="missing", parent_id="category-b", names={"en": "A"}),
                record("category-b", "technology_category", domain_id="domain", parent_id="category-a", names={"en": "B"}),
                record("category-c", "technology_category", domain_id="domain", parent_id="missing", names={"en": "C"}),
            ],
            "technology_families": [],
            "powertrain_architectures": [],
        }
        errors = validate_taxonomy(taxonomy)
        self.assertTrue(any("missing technology_domain" in error for error in errors))
        self.assertTrue(any("missing technology_category" in error for error in errors))
        self.assertTrue(any("Category parent cycle" in error for error in errors))

    def test_allows_root_categories_with_null_parent(self):
        taxonomy = {
            "technology_domains": [record("domain", "technology_domain", names={"en": "Domain"})],
            "technology_categories": [record("category", "technology_category", domain_id="domain", parent_id=None, names={"en": "Category"})],
            "technology_families": [],
            "powertrain_architectures": [],
        }
        self.assertEqual(validate_taxonomy(taxonomy), [])


class TechnologyClassificationValidationTests(unittest.TestCase):
    def setUp(self):
        self.taxonomy = {
            "technology_domains": [record("domain", "technology_domain", names={"en": "Domain"})],
            "technology_categories": [
                record("category", "technology_category", domain_id="domain", parent_id=None, names={"en": "Category"}),
            ],
            "technology_families": [record("family", "technology_family", names={"en": "Family"})],
            "powertrain_architectures": [],
        }

    def test_accepts_valid_classification_and_legacy_fields(self):
        records = {
            "technology": [
                record(
                    "technology",
                    "technology",
                    kind="branded",
                    domain_ids=["domain"],
                    category_ids=["category"],
                    family_ids=["family"],
                    category="legacy-category",
                )
            ]
        }
        self.assertEqual(validate_technology_classification(records, self.taxonomy), [])

    def test_rejects_invalid_kind_and_taxonomy_references(self):
        records = {
            "technology": [
                record(
                    "technology",
                    "technology",
                    kind="unknown",
                    domain_ids=["missing-domain"],
                    category_ids=["missing-category"],
                    family_ids=["missing-family"],
                )
            ]
        }
        errors = validate_technology_classification(records, self.taxonomy)
        self.assertTrue(any("kind must be one of" in error for error in errors))
        self.assertTrue(any("missing technology_domain" in error for error in errors))
        self.assertTrue(any("missing technology_category" in error for error in errors))
        self.assertTrue(any("missing technology_family" in error for error in errors))

    def test_rejects_non_string_kind_without_crashing(self):
        taxonomy = self.taxonomy
        for invalid_kind in (["branded"], {"value": "branded"}):
            errors = validate_technology_classification(
                {"technology": [record("technology", "technology", kind=invalid_kind)]},
                taxonomy,
            )
            self.assertTrue(any("kind must be one of" in error for error in errors))

    def test_requires_current_classification_fields(self):
        errors = validate_technology_classification(
            {"technology": [record("technology", "technology")]},
            self.taxonomy,
        )
        self.assertTrue(any("kind must be one of" in error for error in errors))
        self.assertTrue(any("domain_ids must be a list" in error for error in errors))
        self.assertTrue(any("category_ids must be a list" in error for error in errors))

    def test_rejects_category_outside_declared_domain(self):
        records = {
            "technology": [
                record("technology", "technology", domain_ids=[], category_ids=["category"]),
            ]
        }
        errors = validate_technology_classification(records, self.taxonomy)
        self.assertTrue(any("is not declared in domain_ids" in error for error in errors))

    def test_rejects_legacy_category_conflict_when_it_is_a_new_category_id(self):
        records = {
            "technology": [
                record(
                    "technology",
                    "technology",
                    domain_ids=["domain"],
                    category_ids=[],
                    category="category",
                )
            ]
        }
        errors = validate_technology_classification(records, self.taxonomy)
        self.assertTrue(any("legacy category category conflicts" in error for error in errors))


class RelationshipValidationTests(unittest.TestCase):
    def setUp(self):
        self.records = {
            "technology": [record("technology", "technology")],
            "family": [record("family", "technology_family")],
            "source": [record("source", "source")],
        }

    def test_accepts_sourced_technology_to_family_relationship(self):
        self.records["relationship"] = [
            record(
                "relationship",
                "relationship",
                from_id="technology",
                to_id="family",
                relationship="based_on",
                source_ids=["source"],
                evidence_status="confirmed",
            )
        ]
        self.assertEqual(validate_relationships(self.records), [])

    def test_rejects_invalid_endpoint_type_relationship_source_and_evidence(self):
        self.records["relationship"] = [
            record(
                "relationship",
                "relationship",
                from_id="missing",
                to_id="family",
                relationship="based_on",
                source_ids=["missing-source"],
                evidence_status=["confirmed"],
            )
        ]
        errors = validate_relationships(self.records)
        self.assertTrue(any("from_id must reference" in error for error in errors))
        self.assertTrue(any("source_ids references missing Source" in error for error in errors))
        self.assertTrue(any("evidence_status must be one of" in error for error in errors))

    def test_rejects_invalid_technology_family_relation_type(self):
        self.records["relationship"] = [
            record(
                "relationship",
                "relationship",
                from_id="technology",
                to_id="family",
                relationship="uses",
                source_ids=["source"],
                evidence_status="confirmed",
            )
        ]
        errors = validate_relationships(self.records)
        self.assertTrue(any("Technology to Family relations" in error for error in errors))


class VehicleArchitectureValidationTests(unittest.TestCase):
    def test_rejects_unknown_powertrain_type(self):
        errors = validate_vehicle_architecture(
            {"vehicle": [record("vehicle", "vehicle", powertrain_types=["hybrid"])]}
        )
        self.assertTrue(any("powertrain_types must use" in error for error in errors))

    def test_rejects_non_list_powertrain_types(self):
        errors = validate_vehicle_architecture(
            {"vehicle": [record("vehicle", "vehicle", powertrain_types="bev")]}
        )
        self.assertTrue(any("powertrain_types must use" in error for error in errors))

    def test_accepts_known_architecture_and_motor_positions(self):
        records = {
            "architecture": [record("architecture", "powertrain_architecture")],
            "vehicle": [
                record(
                    "vehicle",
                    "vehicle",
                    powertrain_architecture_id="architecture",
                    motor_positions=["p1", "e-axle"],
                )
            ],
        }
        self.assertEqual(validate_vehicle_architecture(records), [])

    def test_rejects_unknown_architecture_and_motor_positions(self):
        records = {
            "architecture": [record("architecture", "powertrain_architecture")],
            "vehicle": [
                record(
                    "vehicle",
                    "vehicle",
                    powertrain_architecture_id="missing",
                    motor_positions=["p5"],
                )
            ],
        }
        errors = validate_vehicle_architecture(records)
        self.assertTrue(any("powertrain_architecture_id" in error for error in errors))
        self.assertTrue(any("motor_positions" in error for error in errors))

    def test_allows_unknown_architecture_as_null(self):
        records = {"vehicle": [record("vehicle", "vehicle", powertrain_architecture_id=None)]}
        self.assertEqual(validate_vehicle_architecture(records), [])

    def test_rejects_conflicting_battery_electric_architecture(self):
        records = {
            "architecture": [record("battery-electric", "powertrain_architecture")],
            "vehicle": [
                record(
                    "vehicle",
                    "vehicle",
                    powertrain_architecture_id="battery-electric",
                    powertrain_types=["bev", "phev"],
                )
            ],
        }
        errors = validate_vehicle_architecture(records)
        self.assertTrue(any("incompatible hybrid" in error for error in errors))


if __name__ == "__main__":
    unittest.main()
