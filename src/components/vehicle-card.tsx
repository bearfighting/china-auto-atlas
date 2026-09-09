import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { displayName, slugFor } from "@/lib/data/resolvers";
import type { Vehicle } from "@/lib/data/types";

export function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  return (
    <Card className="h-full transition-colors hover:border-foreground/30">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          {vehicle.status ? <Badge variant="muted">{vehicle.status}</Badge> : null}
          {vehicle.powertrain_types?.map((type) => (
            <Badge key={type} variant="outline">
              {type}
            </Badge>
          ))}
        </div>
        <CardTitle>
          <Link
            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href={`/vehicles/${slugFor(vehicle)}`}
          >
            {displayName(vehicle.names)}
          </Link>
        </CardTitle>
        {vehicle.names?.["zh-CN"] ? (
          <p className="text-sm text-muted-foreground">{vehicle.names["zh-CN"]}</p>
        ) : null}
      </CardHeader>
      <CardContent>
        <Link
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
          href={`/vehicles/${slugFor(vehicle)}`}
        >
          View vehicle profile
        </Link>
      </CardContent>
    </Card>
  );
}
