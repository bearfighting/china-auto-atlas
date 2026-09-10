import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EntityFacts, EntityFact } from "@/components/entity-facts";
import { EntityHeader } from "@/components/entity-header";
import { RelatedNewsList } from "@/components/related-news-list";
import { SourceList } from "@/components/source-list";
import { Timeline } from "@/components/timeline";
import { UnknownState } from "@/components/states";
import { VehicleCard } from "@/components/vehicle-card";
import { PageContainer } from "@/components/page-container";
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
        <EntityFacts>
          <EntityFact label="Category" value={technology.category} />
          <EntityFact label="Description" value={technology.description} />
          <EntityFact label="Technical features" value={technology.technical_features} />
          <EntityFact label="Advantages" value={technology.advantages} />
          <EntityFact label="Limitations" value={technology.limitations} />
        </EntityFacts>
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
