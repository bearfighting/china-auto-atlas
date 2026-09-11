import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { EmptyState } from "@/components/content/states";
import { PageContainer } from "@/components/layout/page-container";
import { VehicleCard } from "@/components/entity/vehicle-card";
import { VehicleFilters } from "@/app/vehicles/_components/filters";
import { VehiclePagination } from "@/app/vehicles/_components/pagination";
import { vehicleRepository } from "@/lib/data/repositories";
import type { PowertrainType } from "@/lib/data/types";

export const metadata: Metadata = {
  title: "Vehicles",
  description: "Vehicle profiles and market specifications documented by China Auto Atlas.",
  alternates: { canonical: "/vehicles" },
  openGraph: {
    title: "Vehicles",
    description: "Vehicle profiles and market specifications documented by China Auto Atlas.",
    url: "/vehicles",
  },
};

function queryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parsePowertrain(value: string | undefined): PowertrainType | undefined {
  return value === "bev" || value === "phev" || value === "erev" ? value : undefined;
}

export default async function VehiclesIndexPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string | string[];
    brand?: string | string[];
    powertrain?: string | string[];
    status?: string | string[];
  }>;
}) {
  const params = await searchParams;
  const page = Number(queryValue(params.page) ?? 1);
  const brandId = queryValue(params.brand)?.trim() || undefined;
  const powertrainValue = queryValue(params.powertrain)?.trim() || undefined;
  const powertrainType = parsePowertrain(powertrainValue);
  const invalidPowertrain = powertrainValue !== undefined && powertrainType === undefined;
  const status = queryValue(params.status)?.trim() || undefined;
  const vehiclePage = vehicleRepository.listPage({
    page,
    brandId,
    powertrainType: invalidPowertrain ? (powertrainValue as PowertrainType) : powertrainType,
    status,
  });
  const filterOptions = vehicleRepository.getFilterOptions();
  const hasFilters = Boolean(brandId || powertrainValue || status);
  const firstResult = vehiclePage.items.length
    ? (vehiclePage.page - 1) * vehiclePage.pageSize + 1
    : 0;
  const lastResult = vehiclePage.items.length ? firstResult + vehiclePage.items.length - 1 : 0;
  return (
    <PageContainer>
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Vehicles" }]} />
      <div className="space-y-8">
        <header className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Structured vehicle records</p>
          <h1 className="text-4xl font-bold tracking-tight">Vehicles</h1>
          <p className="max-w-2xl text-muted-foreground">
            Explore vehicles with market-specific specifications, lifecycle history, and source
            context.
          </p>
        </header>
        <VehicleFilters
          options={filterOptions}
          brandId={brandId}
          powertrainType={powertrainType}
          status={status}
          hasFilters={hasFilters}
        />
        {vehiclePage.total > 0 && vehiclePage.items.length > 0 ? (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {firstResult}–{lastResult} of {vehiclePage.total} vehicles
          </p>
        ) : null}
        {vehiclePage.items.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehiclePage.items.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <EmptyState
              title={hasFilters ? "No vehicles match these filters" : "No vehicles on this page"}
              description={
                hasFilters
                  ? "Try another brand, powertrain, or status, or clear the filters."
                  : "Try another page or return to the first page."
              }
            />
            <div className="flex justify-center">
              <Link
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                href="/vehicles"
              >
                {hasFilters ? "Clear filters" : "Return to all Vehicles"}
              </Link>
            </div>
          </div>
        )}
        <VehiclePagination
          page={vehiclePage.page}
          totalPages={vehiclePage.totalPages}
          brandId={brandId}
          powertrainType={powertrainType}
          status={status}
        />
      </div>
    </PageContainer>
  );
}
