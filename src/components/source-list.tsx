import { ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Source } from "@/lib/data/types";

export function EvidenceBadge({ value }: { value?: string }) {
  return <Badge variant={value === "confirmed" ? "default" : "muted"}>{value ?? "unknown"}</Badge>;
}

export function SourceList({ sources }: { sources: Source[] }) {
  if (sources.length === 0)
    return (
      <p className="text-sm text-muted-foreground">
        No source has been collected for this section.
      </p>
    );
  return (
    <div className="grid gap-3">
      {sources.map((source) => (
        <Card key={source.id}>
          <CardHeader className="gap-2 pb-3">
            <div className="flex items-start justify-between gap-4">
              <CardTitle className="text-base">{source.title ?? source.id}</CardTitle>
              <EvidenceBadge value={source.evidence_status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {source.publisher ?? "Unknown publisher"}
            </p>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4 pt-0">
            <span className="text-xs text-muted-foreground">
              Accessed {source.accessed_at ?? "unknown"}
            </span>
            {source.url ? (
              <a
                className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                href={source.url}
                target="_blank"
                rel="noreferrer"
              >
                Open source <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
