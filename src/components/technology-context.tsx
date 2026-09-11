import { displayName } from "@/lib/data/resolvers";
import type { LocalizedName, TechnologyCategory, TechnologyDomain } from "@/lib/data/types";

type TaxonomyItem = { id: string; names?: LocalizedName };

export function TechnologyContext({
  kind,
  domains,
  categories,
}: {
  kind?: string;
  domains: TechnologyDomain[];
  categories: TechnologyCategory[];
}) {
  const items: TaxonomyItem[] = [...domains, ...categories];
  return (
    <div className="space-y-1 text-xs text-muted-foreground">
      {kind ? <p>Kind: {kind}</p> : null}
      {items.length ? (
        <p className="flex flex-wrap gap-x-1 gap-y-0.5" aria-label="Technology taxonomy">
          {items.map((item, index) => (
            <span key={item.id}>
              {index ? " · " : null}
              {displayName(item.names)}
            </span>
          ))}
        </p>
      ) : null}
    </div>
  );
}
