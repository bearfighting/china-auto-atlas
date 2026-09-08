import { Badge } from "@/components/ui/badge";
import { EvidenceBadge } from "@/components/source-list";

export function ArticleHeader({
  title,
  titleZh,
  publishedAt,
  evidenceStatus,
}: {
  title: string;
  titleZh?: string;
  publishedAt: string;
  evidenceStatus?: string;
}) {
  return (
    <header className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">News</Badge>
        <EvidenceBadge value={evidenceStatus} />
        <time className="text-sm text-muted-foreground" dateTime={publishedAt}>
          {publishedAt}
        </time>
      </div>
      <h1 className="max-w-4xl text-3xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      {titleZh ? <p className="text-lg text-muted-foreground">{titleZh}</p> : null}
    </header>
  );
}
