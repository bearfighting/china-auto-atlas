import unittest

from data_pipeline import validate_relationship_indexes


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


if __name__ == "__main__":
    unittest.main()
