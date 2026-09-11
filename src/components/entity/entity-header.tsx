import { Badge } from "@/components/ui/badge";
import type { Entity } from "@/lib/data/types";
import { displayName } from "@/lib/data/resolvers";

export function EntityHeader({
  entity,
  eyebrow = "Vehicle",
}: {
  entity: Entity;
  eyebrow?: string;
}) {
  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">{eyebrow}</Badge>
        {entity.status ? <Badge variant="muted">{entity.status}</Badge> : null}
      </div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{displayName(entity.names)}</h1>
      {entity.names?.["zh-CN"] ? (
        <p className="text-lg text-muted-foreground">{entity.names["zh-CN"]}</p>
      ) : null}
    </header>
  );
}
