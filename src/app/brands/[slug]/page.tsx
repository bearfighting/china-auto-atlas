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
import { brandRepository } from "@/lib/data/repositories";

export const dynamicParams = false;

export function generateStaticParams() {
  return brandRepository.list().map((brand) => ({ slug: slugFor(brand) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = brandRepository.getBySlug(slug);
  return brand
    ? {
        title: displayName(brand.names),
        description: `${displayName(brand.names)} brand profile and related vehicles.`,
        alternates: { canonical: `/brands/${slugFor(brand)}` },
        openGraph: {
          title: displayName(brand.names),
          description: `${displayName(brand.names)} brand profile.`,
        },
      }
    : {};
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = brandRepository.getBySlug(slug);
  if (!brand) notFound();
  const vehicles = brandRepository.getVehicles(brand.id);
  return (
    <PageContainer>
      <div className="space-y-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Brand" },
            { label: displayName(brand.names) },
          ]}
        />
        <EntityHeader entity={brand} eyebrow="Brand" />
        <EntityFacts>
          <EntityFact label="Positioning" value={brand.positioning} />
          <EntityFact label="Powertrain focus" value={brand.powertrain_focus} />
          <EntityFact
            label="Founded"
            value={(brand.founded as { value?: string } | undefined)?.value}
          />
          <EntityFact label="Market codes" value={brand.market_codes} />
        </EntityFacts>
        <section className="space-y-4" aria-labelledby="brand-vehicles">
          <h2 id="brand-vehicles" className="text-2xl font-semibold">
            Vehicles
          </h2>
          {vehicles.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <UnknownState label="No vehicles connected to this brand" />
          )}
        </section>
        <section className="space-y-4" aria-labelledby="brand-events">
          <h2 id="brand-events" className="text-2xl font-semibold">
            Related events
          </h2>
          <Timeline events={brandRepository.getRelatedEvents(brand.id)} />
        </section>
        <section className="space-y-4" aria-labelledby="brand-news">
          <h2 id="brand-news" className="text-2xl font-semibold">
            Related news
          </h2>
          <RelatedNewsList documents={brandRepository.getRelatedNews(brand.id)} />
        </section>
        <section className="space-y-4" aria-labelledby="brand-sources">
          <h2 id="brand-sources" className="text-2xl font-semibold">
            Sources
          </h2>
          <SourceList sources={brandRepository.getRelatedSources(brand.id)} />
        </section>
      </div>
    </PageContainer>
  );
}
