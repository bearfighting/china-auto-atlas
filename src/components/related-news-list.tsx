import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { UnknownState } from "@/components/states";
import type { NewsDocument } from "@/lib/data/types";

export function RelatedNewsList({ documents }: { documents: NewsDocument[] }) {
  if (!documents.length) return <UnknownState label="No related news collected" />;

  return (
    <div className="grid gap-3">
      {documents.map((document) => (
        <Card key={document.id} data-testid="related-news">
          <CardContent className="p-5">
            <Link
              className="font-medium text-primary hover:underline"
              href={`/news/${document.slug}`}
            >
              {document.title}
            </Link>
            <p className="mt-1 text-xs text-muted-foreground">{document.published_at}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
