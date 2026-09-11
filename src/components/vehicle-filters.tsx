import Link from "next/link";
import { Button } from "@/components/ui/button";
import { displayName } from "@/lib/data/resolvers";
import type { PowertrainType, VehicleFilterOptions } from "@/lib/data/types";

const powertrainLabels: Record<PowertrainType, string> = {
  bev: "BEV",
  phev: "PHEV",
  erev: "EREV",
};

export function VehicleFilters({
  options,
  brandId,
  powertrainType,
  status,
  hasFilters,
}: {
  options: VehicleFilterOptions;
  brandId?: string;
  powertrainType?: PowertrainType;
  status?: string;
  hasFilters: boolean;
}) {
  return (
    <form
      key={`${brandId ?? ""}-${powertrainType ?? ""}-${status ?? ""}`}
      action="/vehicles"
      method="get"
      className="flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-end"
    >
      <label
        className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium"
        htmlFor="vehicle-brand"
      >
        Brand
        <select
          id="vehicle-brand"
          name="brand"
          defaultValue={brandId ?? ""}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All brands</option>
          {options.brands.map((brand) => (
            <option key={brand.id} value={brand.id}>
              {displayName(brand.names)}
            </option>
          ))}
        </select>
      </label>
      <label
        className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium"
        htmlFor="vehicle-powertrain"
      >
        Powertrain
        <select
          id="vehicle-powertrain"
          name="powertrain"
          defaultValue={powertrainType ?? ""}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All powertrains</option>
          {options.powertrainTypes.map((type) => (
            <option key={type} value={type}>
              {powertrainLabels[type]}
            </option>
          ))}
        </select>
      </label>
      <label
        className="flex min-w-0 flex-1 flex-col gap-2 text-sm font-medium"
        htmlFor="vehicle-status"
      >
        Status
        <select
          id="vehicle-status"
          name="status"
          defaultValue={status ?? ""}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">All statuses</option>
          {options.statuses.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <Button type="submit">Apply filters</Button>
      {hasFilters ? (
        <Link
          className="flex h-10 items-center whitespace-nowrap text-sm font-medium text-primary hover:underline"
          href="/vehicles"
        >
          Clear filters
        </Link>
      ) : null}
    </form>
  );
}
