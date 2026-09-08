import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/page-container";
import { ArticleHeader } from "@/components/article-header";
import { SourceList } from "@/components/source-list";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UnknownState } from "@/components/states";
import { loadContentIndex, loadDataIndex } from "@/lib/data/load-index";
import { eventRepository, newsRepository, relatedEntities } from "@/lib/data/repositories";
import { authorsByIds, displayName, sourcesByIds, topicsByIds } from "@/lib/data/resolvers";

export function generateStaticParams() {
  return newsRepository.list().map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = newsRepository.getBySlug(slug);
  if (!article) return {};
  const content = loadContentIndex();
  const authors = authorsByIds(content, article.author_ids);
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
  const index = loadDataIndex();
  const content = loadContentIndex();
  const entities = relatedEntities(article.entity_ids);
  const sources = sourcesByIds(index, article.source_ids);
  const authors = authorsByIds(content, article.author_ids);
  const topics = topicsByIds(content, article.topic_ids);
  const events = (article.event_ids ?? []).map((id) => eventRepository.getById(id)).filter(Boolean);
  return (
    <PageContainer>
      <article className="space-y-10">
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
                      <Badge variant="outline">{displayName(entity.names)}</Badge>
                    </Link>
                  ) : (
                    <Badge key={entity.id} variant="outline">
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
                    <Card key={event!.id}>
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
                <div className="flex flex-wrap gap-2">
                  {authors.map((author) => (
                    <Badge key={author.id} variant="secondary">
                      {author.short_name ?? displayName(author.names)}
                    </Badge>
                  ))}
                  {topics.map((topic) => (
                    <Badge key={topic.id} variant="outline">
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
