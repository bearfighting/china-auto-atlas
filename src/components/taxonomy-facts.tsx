import { Badge } from "@/components/ui/badge";
import { UnknownState } from "@/components/states";
import { displayName } from "@/lib/data/resolvers";
import type { LocalizedName } from "@/lib/data/types";

type TaxonomyItem = { id: string; names?: LocalizedName };

export function TaxonomyFact({ label, items }: { label: string; items: TaxonomyItem[] }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-2">
        {items.length ? (
          <div className="flex flex-wrap gap-2">
            {items.map((item) => (
              <Badge key={item.id} variant="outline">
                {displayName(item.names)}
              </Badge>
            ))}
          </div>
        ) : (
          <UnknownState />
        )}
      </dd>
    </div>
  );
}
