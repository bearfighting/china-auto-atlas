"use client";

import Link from "next/link";
import { ChevronRight, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { displayName, slugFor } from "@/lib/data/resolvers";
import type { PowertrainType, ProductLine, Vehicle, VehicleSeries } from "@/lib/data/types";

const powertrainOptions: readonly PowertrainType[] = ["bev", "phev", "erev"];

function isPowertrainType(value: string): value is PowertrainType {
  return (powertrainOptions as readonly string[]).includes(value);
}

function normalized(value: string) {
  return value.normalize("NFKC").trim().toLowerCase();
}

export function filterVehicles(
  vehicles: Vehicle[],
  query: string,
  powertrain: string,
  bodyStyle: string,
) {
  const search = normalized(query);
  return vehicles.filter((vehicle) => {
    const values = [
      vehicle.id,
      displayName(vehicle.names),
      vehicle.names?.["zh-CN"],
      ...(vehicle.aliases ?? []),
    ]
      .filter((value): value is string => Boolean(value))
      .map(normalized);
    const textMatches = !search || values.some((value) => value.includes(search));
    const powertrainMatches =
      powertrain === "all" ||
      (isPowertrainType(powertrain) && vehicle.powertrain_types?.includes(powertrain));
    const bodyStyleMatches = bodyStyle === "all" || vehicle.body_style === bodyStyle;
    return textMatches && powertrainMatches && bodyStyleMatches;
  });
}

function VehicleRow({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Link
      className="group flex items-center justify-between gap-4 rounded-md border bg-background px-4 py-3 transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      href={`/vehicles/${slugFor(vehicle)}`}
    >
      <div className="min-w-0">
        <p className="truncate font-medium group-hover:text-primary">
          {displayName(vehicle.names)}
        </p>
        {vehicle.names?.["zh-CN"] ? (
          <p className="truncate text-sm text-muted-foreground">{vehicle.names["zh-CN"]}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 flex-wrap justify-end gap-1">
        {vehicle.powertrain_types?.map((type) => (
          <Badge key={type} variant="outline" className="text-xs">
            {type}
          </Badge>
        ))}
      </div>
    </Link>
  );
}

function SeriesGroup({
  series,
  vehicles,
  open,
  onToggle,
}: {
  series: VehicleSeries;
  vehicles: Vehicle[];
  open: boolean;
  onToggle: () => void;
}) {
  const contentId = `series-${series.id}-vehicles`;
  return (
    <div className="border-b last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={onToggle}
      >
        <span className="flex items-center gap-3">
          <ChevronRight
            className={`h-4 w-4 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
            aria-hidden="true"
          />
          <span className="font-medium">{displayName(series.names)}</span>
        </span>
        <span className="text-xs text-muted-foreground">
          {vehicles.length} {vehicles.length === 1 ? "vehicle" : "vehicles"}
        </span>
      </button>
      {open ? (
        <div id={contentId} className="space-y-2 px-5 pb-5 pl-12">
          {vehicles.length ? (
            <div className="grid gap-2 md:grid-cols-2">
              {vehicles.map((vehicle) => (
                <VehicleRow key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No vehicles connected to this series.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export function ProductHierarchy({
  productLines,
  series,
  vehicles,
}: {
  productLines: ProductLine[];
  series: VehicleSeries[];
  vehicles: Vehicle[];
}) {
  const [query, setQuery] = useState("");
  const [powertrain, setPowertrain] = useState("all");
  const [bodyStyle, setBodyStyle] = useState("all");
  const [openLineId, setOpenLineId] = useState<string | null>(productLines[0]?.id ?? null);
  const [openSeriesByLine, setOpenSeriesByLine] = useState<Record<string, string | "all">>({});
  const bodyStyleOptions = useMemo(
    () =>
      [
        ...new Set(
          vehicles
            .map((vehicle) => vehicle.body_style)
            .filter((style): style is string => Boolean(style)),
        ),
      ].sort(),
    [vehicles],
  );
  const filteredVehicles = useMemo(
    () => filterVehicles(vehicles, query, powertrain, bodyStyle),
    [vehicles, query, powertrain, bodyStyle],
  );
  const vehiclesBySeries = useMemo(
    () =>
      new Map(
        series.map((item) => [
          item.id,
          filteredVehicles.filter((vehicle) => vehicle.series_id === item.id),
        ]),
      ),
    [series, filteredVehicles],
  );
  const seriesByLine = useMemo(
    () =>
      new Map(
        productLines.map((line) => [
          line.id,
          series.filter((item) => item.product_line_id === line.id),
        ]),
      ),
    [productLines, series],
  );
  const ungroupedSeries = series.filter(
    (item) => !item.product_line_id && (vehiclesBySeries.get(item.id) ?? []).length > 0,
  );
  const matchingLineIds = useMemo(
    () =>
      productLines
        .filter((line) =>
          (seriesByLine.get(line.id) ?? []).some(
            (item) => (vehiclesBySeries.get(item.id) ?? []).length > 0,
          ),
        )
        .map((line) => line.id),
    [productLines, seriesByLine, vehiclesBySeries],
  );
  const matchingSeriesByLine = useMemo(
    () =>
      new Map(
        productLines.map((line) => [
          line.id,
          (seriesByLine.get(line.id) ?? [])
            .filter((item) => (vehiclesBySeries.get(item.id) ?? []).length > 0)
            .map((item) => item.id),
        ]),
      ),
    [productLines, seriesByLine, vehiclesBySeries],
  );
  const isFiltered = Boolean(query.trim() || powertrain !== "all" || bodyStyle !== "all");
  const unclassifiedVehicles = filteredVehicles.filter((vehicle) => !vehicle.series_id);

  useEffect(() => {
    if (isFiltered) {
      setOpenLineId(matchingLineIds[0] ?? null);
      setOpenSeriesByLine(Object.fromEntries(matchingLineIds.map((lineId) => [lineId, "all"])));
    } else {
      setOpenLineId(productLines[0]?.id ?? null);
      setOpenSeriesByLine({});
    }
  }, [isFiltered, matchingLineIds, matchingSeriesByLine, productLines]);

  function clearFilters() {
    setQuery("");
    setPowertrain("all");
    setBodyStyle("all");
  }

  function toggleSeries(lineId: string, seriesId: string) {
    setOpenSeriesByLine((current) => ({
      ...current,
      [lineId]: current[lineId] === seriesId ? "" : seriesId,
    }));
  }

  function lineVehicleCount(lineId: string) {
    return (seriesByLine.get(lineId) ?? []).reduce(
      (total, item) => total + (vehiclesBySeries.get(item.id)?.length ?? 0),
      0,
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/20 p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto_auto]">
          <label className="relative block">
            <span className="sr-only">Search vehicles</span>
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search vehicles..."
              className="h-10 w-full rounded-md border bg-background pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="sr-only" htmlFor="product-hierarchy-powertrain">
            Powertrain
          </label>
          <select
            id="product-hierarchy-powertrain"
            value={powertrain}
            onChange={(event) => setPowertrain(event.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All powertrains</option>
            {powertrainOptions.map((option) => (
              <option key={option} value={option}>
                {option.toUpperCase()}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="product-hierarchy-body-style">
            Body style
          </label>
          <select
            id="product-hierarchy-body-style"
            value={bodyStyle}
            onChange={(event) => setBodyStyle(event.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All body styles</option>
            {bodyStyleOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
          <span>
            Showing {filteredVehicles.length} of {vehicles.length} vehicles
          </span>
          {isFiltered ? (
            <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
              <X className="mr-1 h-4 w-4" aria-hidden="true" />
              Clear filters
            </Button>
          ) : null}
        </div>
      </div>
      {!filteredVehicles.length ? (
        <div role="status" className="rounded-lg border border-dashed p-8 text-center">
          <p className="font-medium">No vehicles match these filters.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try clearing a filter or using a different search term.
          </p>
        </div>
      ) : null}
      {productLines.map((line) => {
        const lineSeries = (seriesByLine.get(line.id) ?? []).filter(
          (item) => (vehiclesBySeries.get(item.id) ?? []).length > 0 || !isFiltered,
        );
        if (
          isFiltered &&
          !lineSeries.some((item) => (vehiclesBySeries.get(item.id) ?? []).length > 0)
        )
          return null;
        const open = openLineId === line.id;
        const contentId = `product-line-${line.id}-series`;
        return (
          <section key={line.id} className="overflow-hidden rounded-lg border bg-card">
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 bg-muted/30 px-5 py-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-expanded={open}
              aria-controls={contentId}
              onClick={() => setOpenLineId(open ? null : line.id)}
            >
              <span className="flex items-center gap-3">
                <ChevronRight
                  className={`h-5 w-5 text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`}
                  aria-hidden="true"
                />
                <span>
                  <span className="block text-lg font-semibold">{displayName(line.names)}</span>
                  {line.names?.["zh-CN"] ? (
                    <span className="block text-sm text-muted-foreground">
                      {line.names["zh-CN"]}
                    </span>
                  ) : null}
                </span>
              </span>
              <span className="text-right text-xs text-muted-foreground">
                {lineSeries.length} series · {lineVehicleCount(line.id)} vehicles
              </span>
            </button>
            {open ? (
              <div id={contentId} className="divide-y">
                {lineSeries.map((item) => (
                  <SeriesGroup
                    key={item.id}
                    series={item}
                    vehicles={vehiclesBySeries.get(item.id) ?? []}
                    open={
                      openSeriesByLine[line.id] === "all" || openSeriesByLine[line.id] === item.id
                    }
                    onToggle={() => toggleSeries(line.id, item.id)}
                  />
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
      {ungroupedSeries.length ? (
        <section className="overflow-hidden rounded-lg border bg-card">
          <div className="bg-muted/30 px-5 py-4 font-semibold">Unclassified vehicle series</div>
          <div className="divide-y">
            {ungroupedSeries.map((item) => (
              <SeriesGroup
                key={item.id}
                series={item}
                vehicles={vehiclesBySeries.get(item.id) ?? []}
                open={openSeriesByLine.ungrouped === item.id}
                onToggle={() => toggleSeries("ungrouped", item.id)}
              />
            ))}
          </div>
        </section>
      ) : null}
      {unclassifiedVehicles.length ? (
        <section className="rounded-lg border border-dashed p-5">
          <h3 className="font-semibold">Unclassified vehicles</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            These vehicles do not yet have a sourced series assignment.
          </p>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {unclassifiedVehicles.map((vehicle) => (
              <VehicleRow key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
