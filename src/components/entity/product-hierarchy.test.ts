import { describe, expect, it } from "vitest";
import { filterVehicles } from "./product-hierarchy";
import type { Vehicle } from "@/lib/data/types";

const vehicles = [
  {
    id: "seal",
    type: "vehicle",
    names: { en: "BYD Seal", "zh-CN": "比亚迪海豹" },
    aliases: ["Ocean Seal"],
    powertrain_types: ["bev"],
    body_style: "sedan",
  },
  {
    id: "han",
    type: "vehicle",
    names: { en: "BYD Han", "zh-CN": "比亚迪汉" },
    powertrain_types: ["bev", "phev"],
    body_style: "sedan",
  },
  {
    id: "tang",
    type: "vehicle",
    names: { en: "BYD Tang", "zh-CN": "比亚迪唐" },
    powertrain_types: ["phev"],
    body_style: "suv",
  },
] as Vehicle[];

describe("product hierarchy vehicle filters", () => {
  it("matches ids, localized names, and aliases", () => {
    expect(filterVehicles(vehicles, "海豹", "all", "all").map((vehicle) => vehicle.id)).toEqual([
      "seal",
    ]);
    expect(
      filterVehicles(vehicles, "Ocean Seal", "all", "all").map((vehicle) => vehicle.id),
    ).toEqual(["seal"]);
    expect(filterVehicles(vehicles, "han", "all", "all").map((vehicle) => vehicle.id)).toEqual([
      "han",
    ]);
  });

  it("applies powertrain and body style filters", () => {
    expect(filterVehicles(vehicles, "", "bev", "sedan").map((vehicle) => vehicle.id)).toEqual([
      "seal",
      "han",
    ]);
    expect(filterVehicles(vehicles, "", "phev", "suv").map((vehicle) => vehicle.id)).toEqual([
      "tang",
    ]);
  });

  it("combines search and select filters", () => {
    expect(filterVehicles(vehicles, "byd", "bev", "suv")).toEqual([]);
  });
});
