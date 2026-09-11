import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UnknownState } from "@/components/content/states";
import type { MarketSpecification, Price, RangeValue, Variant } from "@/lib/data/types";

function value(value: unknown) {
  return value === undefined || value === null || value === "" ? <UnknownState /> : String(value);
}

export function SpecificationTable({ specifications }: { specifications: MarketSpecification[] }) {
  if (!specifications.length) return <UnknownState label="No market specifications collected" />;
  return (
    <div className="space-y-6">
      {specifications.map((specification) => (
        <section key={specification.id} aria-labelledby={`${specification.id}-heading`}>
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h3 id={`${specification.id}-heading`} className="font-semibold">
                Market: {specification.market ?? "Unknown"}
              </h3>
              <p className="text-xs text-muted-foreground">
                Valid {specification.valid_from ?? "unknown"} –{" "}
                {specification.valid_to ?? "present"} · Verified{" "}
                {specification.last_verified_at ?? "unknown"}
              </p>
            </div>
            <span className="text-xs text-muted-foreground">
              {specification.status ?? "unknown"}
            </span>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Variant</TableHead>
                <TableHead>Powertrain</TableHead>
                <TableHead>Range</TableHead>
                <TableHead>Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(
                specification.variants ?? [
                  {
                    name: "Lineup",
                    prices: specification.prices,
                    range: (specification.spec as { range?: RangeValue } | undefined)?.range,
                  } as Variant,
                ]
              ).map((variant, index) => (
                <TableRow key={`${specification.id}-${variant.name ?? index}`}>
                  <TableCell className="font-medium">{value(variant.name)}</TableCell>
                  <TableCell>{value(variant.powertrain_type)}</TableCell>
                  <TableCell>
                    {formatRange(variant.range_ev ?? variant.range ?? variant.range_combined)}
                  </TableCell>
                  <TableCell>{formatPrice(variant.prices?.[0], specification.currency)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      ))}
    </div>
  );
}

function formatRange(range?: RangeValue) {
  return range?.value_km ? (
    `${range.value_km} ${range.unit ?? "km"} ${range.standard ?? ""}`
  ) : (
    <UnknownState />
  );
}

function formatPrice(price?: Price, currency?: string) {
  return price?.amount ? (
    `${price.currency ?? currency ?? ""} ${price.amount.toLocaleString()}`
  ) : (
    <UnknownState />
  );
}
