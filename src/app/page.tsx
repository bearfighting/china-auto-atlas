import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { atlasNavigationItems } from "@/components/atlas-navigation";
import { PageContainer } from "@/components/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { newsRepository } from "@/lib/data/repositories";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: {
    title: "China Auto Atlas",
    description:
      "An evidence-led automotive knowledge platform focused on China's automotive industry.",
    url: "/",
  },
};

export default function HomePage() {
  const news = newsRepository.list();
  return (
    <PageContainer>
      <div className="space-y-12">
        <section className="max-w-3xl space-y-5">
          <Badge variant="outline">China automotive knowledge platform</Badge>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            News is input. Knowledge is output.
          </h1>
          <p className="text-lg leading-8 text-muted-foreground">
            China Auto Atlas records the vehicles, companies, technologies, events, markets and
            sources behind China&apos;s changing automotive industry.
          </p>
          <Link
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline-offset-4 hover:underline"
            href="/news"
          >
            Explore the latest news <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
        <section aria-labelledby="atlas-explore" className="space-y-5" data-testid="homepage-atlas">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Explore the database</p>
            <h2 id="atlas-explore" className="text-2xl font-semibold tracking-tight">
              Explore the atlas
            </h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link
              href="/vehicles"
              className="rounded-lg border p-4 transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <p className="font-semibold">Vehicles</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Profiles, specifications, and history.
              </p>
            </Link>
            {atlasNavigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg border p-4 transition-colors hover:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <p className="font-semibold">{item.label}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Connected records, relationships, and sources.
                </p>
              </Link>
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Sources provide the traceable evidence behind the atlas records.
          </p>
        </section>
        <section aria-labelledby="latest-news">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Editorial feed</p>
              <h2 id="latest-news" className="text-2xl font-semibold tracking-tight">
                Latest news
              </h2>
            </div>
            <Link
              className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              href="/news"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {news.slice(0, 4).map((item, index) => (
              <Card
                key={item.id}
                className={index === 0 ? "md:col-span-2" : undefined}
                data-testid={index === 0 ? "homepage-featured-news" : "homepage-news-card"}
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant="muted">{item.evidence_status ?? "unknown"}</Badge>
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
                  <p className="line-clamp-3 text-sm text-muted-foreground">{item.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
