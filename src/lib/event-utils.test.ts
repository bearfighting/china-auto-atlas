import { describe, expect, it } from "vitest";
import { formatEntityType, formatEventType } from "./event-utils";

describe("event display helpers", () => {
  it("formats controlled event types for display", () => {
    expect(formatEventType("vehicle_reveal")).toBe("Vehicle reveal");
    expect(formatEventType("production_start")).toBe("Production start");
    expect(formatEventType()).toBe("Unknown");
  });

  it("formats entity types for display", () => {
    expect(formatEntityType("manufacturer")).toBe("Manufacturer");
    expect(formatEntityType("vehicle_series")).toBe("Vehicle Series");
  });
});
