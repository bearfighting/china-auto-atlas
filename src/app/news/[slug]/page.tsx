import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/page-container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ArticleHeader } from "@/components/article-header";
import { SourceList } from "@/components/source-list";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UnknownState } from "@/components/states";
import { newsRepository } from "@/lib/data/repositories";
import { displayName } from "@/lib/data/resolvers";
import { StructuredData } from "@/components/structured-data";
import { absoluteUrl } from "@/lib/site";

export function generateStaticParams() {
  return newsRepository.list().map((item) => ({ slug: item.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = newsRepository.getBySlug(slug);
  if (!article) return {};
  const authors = newsRepository.getAuthors(article.id);
  return {
    title: article.title,
    description: article.body.slice(0, 160),
    alternates: { canonical: `/news/${article.slug}` },
    authors: authors.map((author) => ({ name: author.short_name ?? displayName(author.names) })),
    openGraph: {
      title: article.title,
      description: article.body.slice(0, 160),
      type: "article",
      publishedTime: article.published_at,
      modifiedTime: article.updated_at,
      url: `/news/${article.slug}`,
    },
  };
}

export default async function NewsArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = newsRepository.getBySlug(slug);
  if (!article) notFound();
  const entities = newsRepository.getRelatedEntities(article.id);
  const sources = newsRepository.getRelatedSources(article.id);
  const authors = newsRepository.getAuthors(article.id);
  const topics = newsRepository.getTopics(article.id);
  const events = newsRepository.getRelatedEvents(article.id);
  return (
    <PageContainer>
      <article className="space-y-10">
        <StructuredData
          data={{
            "@context": "https://schema.org",
            "@type": "Article",
            headline: article.title,
            description: article.body.slice(0, 160),
            datePublished: article.published_at,
            dateModified: article.updated_at ?? article.published_at,
            author: authors.map((author) => ({
              "@type": "Person",
              name: author.short_name ?? displayName(author.names),
            })),
            mainEntityOfPage: absoluteUrl(`/news/${article.slug}`),
          }}
        />
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "News", href: "/news" },
            { label: article.title },
          ]}
        />
        <ArticleHeader
          title={article.title}
          titleZh={article.title_zh}
          publishedAt={article.published_at}
          evidenceStatus={article.evidence_status}
        />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div className="space-y-8">
            <div className="space-y-5 text-base leading-8 text-foreground">
              {article.body.split(/\n\s*\n/).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <section className="space-y-4" aria-labelledby="related-entities">
              <h2 id="related-entities" className="text-xl font-semibold">
                Related entities
              </h2>
              <div className="flex flex-wrap gap-2">
                {entities.map((entity) =>
                  entity.type === "vehicle" ? (
                    <Link key={entity.id} href={`/vehicles/${entity.slug ?? entity.id}`}>
                      <Badge data-testid="related-entity" variant="outline">
                        {displayName(entity.names)}
                      </Badge>
                    </Link>
                  ) : (
                    <Badge key={entity.id} data-testid="related-entity" variant="outline">
                      {displayName(entity.names)}
                    </Badge>
                  ),
                )}
              </div>
            </section>
            <section className="space-y-4" aria-labelledby="article-events">
              <h2 id="article-events" className="text-xl font-semibold">
                Related events
              </h2>
              {events.length ? (
                <div className="space-y-3">
                  {events.map((event) => (
                    <Card key={event!.id} data-testid="related-event">
                      <CardContent className="space-y-1 p-4">
                        <p className="font-medium">{event!.date ?? "Unknown date"}</p>
                        <p className="text-sm text-muted-foreground">
                          {event!.summary ?? "Unknown event summary"}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <UnknownState label="No related events collected" />
              )}
            </section>
          </div>
          <aside className="space-y-4">
            <Card>
              <CardContent className="space-y-3 p-5">
                <p className="text-sm font-semibold">Article context</p>
                <div className="flex flex-wrap gap-2" data-testid="article-context-tags">
                  {authors.map((author) => (
                    <Badge key={author.id} data-testid="article-author" variant="secondary">
                      {author.short_name ?? displayName(author.names)}
                    </Badge>
                  ))}
                  {topics.map((topic) => (
                    <Badge key={topic.id} data-testid="article-topic" variant="outline">
                      {displayName(topic.names)}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated {article.updated_at ?? article.published_at}
                </p>
              </CardContent>
            </Card>
          </aside>
        </div>
        <section className="space-y-4" aria-labelledby="article-sources">
          <h2 id="article-sources" className="text-xl font-semibold">
            Sources
          </h2>
          <SourceList sources={sources} />
        </section>
      </article>
    </PageContainer>
  );
}
