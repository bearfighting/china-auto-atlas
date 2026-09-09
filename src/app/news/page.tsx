import Link from "next/link";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { PageContainer } from "@/components/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { newsRepository } from "@/lib/data/repositories";

export const metadata = { title: "News" };

export default function NewsIndexPage() {
  const news = newsRepository.list();
  return (
    <PageContainer>
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "News" }]} />
        <header className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Editorial reporting</p>
          <h1 className="text-4xl font-bold tracking-tight">News</h1>
          <p className="max-w-2xl text-muted-foreground">
            Reporting connected to the entities, events and sources in the atlas.
          </p>
        </header>
        <div className="grid gap-4">
          {news.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{item.evidence_status ?? "unknown"}</Badge>
                  <time className="text-xs text-muted-foreground" dateTime={item.published_at}>
                    {item.published_at}
                  </time>
                </div>
                <CardTitle>
                  <Link className="hover:underline" href={`/news/${item.slug}`}>
                    {item.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="max-w-3xl text-sm leading-6 text-muted-foreground">{item.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
