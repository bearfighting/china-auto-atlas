import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/states";
import { PageContainer } from "@/components/page-container";
import { VehicleCard } from "@/components/vehicle-card";
import { vehicleRepository } from "@/lib/data/repositories";

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

export default function VehiclesIndexPage() {
  const vehicles = vehicleRepository.list();
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
        {vehicles.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <VehicleCard key={vehicle.id} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No vehicles collected"
            description="Vehicle records will appear here when they are added to the atlas."
          />
        )}
      </div>
    </PageContainer>
  );
}
