import unittest

from data_pipeline import validate_product_hierarchy, validate_relationship_indexes


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


if __name__ == "__main__":
    unittest.main()
