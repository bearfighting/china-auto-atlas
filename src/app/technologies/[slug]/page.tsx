import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { EntityFacts, EntityFact } from "@/components/entity/entity-facts";
import { EntityHeader } from "@/components/entity/entity-header";
import { RelatedNewsList } from "@/components/content/related-news-list";
import { SourceList } from "@/components/content/source-list";
import { TaxonomyFact } from "@/components/entity/taxonomy-facts";
import { Timeline } from "@/components/content/timeline";
import { UnknownState } from "@/components/content/states";
import { VehicleCard } from "@/components/entity/vehicle-card";
import { PageContainer } from "@/components/layout/page-container";
import { displayName, slugFor } from "@/lib/data/resolvers";
import { technologyRepository } from "@/lib/data/repositories";

export const dynamicParams = false;

export function generateStaticParams() {
  return technologyRepository.list().map((technology) => ({ slug: slugFor(technology) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const technology = technologyRepository.getBySlug(slug);
  return technology
    ? {
        title: displayName(technology.names),
        description: `${displayName(technology.names)} technology profile and related vehicles.`,
        alternates: { canonical: `/technologies/${slugFor(technology)}` },
        openGraph: {
          title: displayName(technology.names),
          description: `${displayName(technology.names)} technology profile.`,
        },
      }
    : {};
}

export default async function TechnologyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const technology = technologyRepository.getBySlug(slug);
  if (!technology) notFound();
  const vehicles = technologyRepository.getVehicles(technology.id);
  const summary = technologyRepository.getSummary(technology.id);
  const domains = technologyRepository.getDomains(technology.id);
  const categories = technologyRepository.getCategories(technology.id);
  const families = technologyRepository.getFamilies(technology.id);
  const relationships = technologyRepository.getRelatedRelationships(technology.id);
  const relatedTechnologies = technologyRepository.getRelatedTechnologies(technology.id);
  const relationTypesFor = (relatedId: string) =>
    relationships
      .filter(
        (relationship) =>
          (relationship.from_id === technology.id && relationship.to_id === relatedId) ||
          (relationship.from_id === relatedId && relationship.to_id === technology.id),
      )
      .map((relationship) => relationship.relationship.replaceAll("_", " "))
      .join(" · ");
  const kindLabel = technology.kind
    ? technology.kind.charAt(0).toUpperCase() + technology.kind.slice(1)
    : undefined;
  return (
    <PageContainer>
      <div className="space-y-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Technology", href: "/technologies" },
            { label: displayName(technology.names) },
          ]}
        />
        <EntityHeader entity={technology} eyebrow="Technology" />
        <p className="text-sm text-muted-foreground" aria-label="Technology relationship summary">
          {summary.vehicleCount} vehicles · {summary.eventCount} events · {summary.newsCount} news ·{" "}
          {summary.sourceCount} sources
        </p>
        <EntityFacts>
          <EntityFact label="Kind" value={kindLabel} />
          <TaxonomyFact label="Domain" items={domains} />
          <TaxonomyFact label="Category" items={categories} />
          <TaxonomyFact label="Family" items={families} />
          <EntityFact label="Legacy category" value={technology.category} />
          <EntityFact label="Description" value={technology.description} />
          <EntityFact label="Technical features" value={technology.technical_features} />
          <EntityFact label="Advantages" value={technology.advantages} />
          <EntityFact label="Limitations" value={technology.limitations} />
        </EntityFacts>
        <section className="space-y-4" aria-labelledby="technology-related-technologies">
          <h2 id="technology-related-technologies" className="text-2xl font-semibold">
            Related technologies
          </h2>
          {relatedTechnologies.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedTechnologies.map((relatedTechnology) => (
                <div key={relatedTechnology.id} className="rounded-lg border bg-card p-4">
                  <Link
                    className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    href={`/technologies/${slugFor(relatedTechnology)}`}
                  >
                    {displayName(relatedTechnology.names)}
                  </Link>
                  {relationTypesFor(relatedTechnology.id) ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                      {relationTypesFor(relatedTechnology.id)}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <UnknownState label="No related technologies collected" />
          )}
        </section>
        <section className="space-y-4" aria-labelledby="technology-vehicles">
          <h2 id="technology-vehicles" className="text-2xl font-semibold">
            Related vehicles
          </h2>
          {vehicles.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <UnknownState label="No vehicles connected to this technology" />
          )}
        </section>
        <section className="space-y-4" aria-labelledby="technology-events">
          <h2 id="technology-events" className="text-2xl font-semibold">
            Related events
          </h2>
          <Timeline events={technologyRepository.getRelatedEvents(technology.id)} />
        </section>
        <section className="space-y-4" aria-labelledby="technology-news">
          <h2 id="technology-news" className="text-2xl font-semibold">
            Related news
          </h2>
          <RelatedNewsList documents={technologyRepository.getRelatedNews(technology.id)} />
        </section>
        <section className="space-y-4" aria-labelledby="technology-sources">
          <h2 id="technology-sources" className="text-2xl font-semibold">
            Sources
          </h2>
          <SourceList sources={technologyRepository.getRelatedSources(technology.id)} />
        </section>
      </div>
    </PageContainer>
  );
}
