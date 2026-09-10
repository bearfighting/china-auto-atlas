import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { displayName, slugFor } from "@/lib/data/resolvers";
import type { Factory, ProductionLine, Vehicle } from "@/lib/data/types";

export function ProductionContext({
  factories,
  productionLines,
  vehicles,
}: {
  factories: Factory[];
  productionLines: ProductionLine[];
  vehicles?: Vehicle[];
}) {
  if (!factories.length && !productionLines.length) return null;
  const vehicleById = new Map((vehicles ?? []).map((vehicle) => [vehicle.id, vehicle]));
  return (
    <section className="space-y-4" aria-labelledby="production-context">
      <div>
        <h2 id="production-context" className="text-2xl font-semibold">
          Production context
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Factory and production-line relationships are shown only when sourced.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {factories.map((factory) => (
          <Card key={factory.id}>
            <CardHeader>
              <CardTitle>{displayName(factory.names)}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {productionLines
                .filter((line) => line.factory_id === factory.id)
                .map((line) => (
                  <div key={line.id} className="space-y-1">
                    <p className="font-medium">{displayName(line.names)}</p>
                    {line.vehicle_ids?.map((vehicleId) => {
                      const vehicle = vehicleById.get(vehicleId);
                      return vehicle ? (
                        <Link
                          key={vehicle.id}
                          className="mr-3 text-sm text-primary hover:underline"
                          href={`/vehicles/${slugFor(vehicle)}`}
                        >
                          {displayName(vehicle.names)}
                        </Link>
                      ) : null;
                    })}
                  </div>
                ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
