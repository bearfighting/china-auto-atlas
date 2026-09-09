import type { Metadata } from "next";
import Link from "next/link";
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
import { manufacturerRepository } from "@/lib/data/repositories";

export const dynamicParams = false;

export function generateStaticParams() {
  return manufacturerRepository.list().map((manufacturer) => ({ slug: slugFor(manufacturer) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const manufacturer = manufacturerRepository.getBySlug(slug);
  return manufacturer
    ? {
        title: displayName(manufacturer.names),
        description: `${displayName(manufacturer.names)} manufacturer profile and related vehicles.`,
        alternates: { canonical: `/manufacturers/${slugFor(manufacturer)}` },
        openGraph: {
          title: displayName(manufacturer.names),
          description: `${displayName(manufacturer.names)} manufacturer profile.`,
        },
      }
    : {};
}

export default async function ManufacturerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const manufacturer = manufacturerRepository.getBySlug(slug);
  if (!manufacturer) notFound();
  const vehicles = manufacturerRepository.getVehicles(manufacturer.id);
  const brands = manufacturerRepository.getBrands(manufacturer.id);
  return (
    <PageContainer>
      <div className="space-y-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Manufacturer" },
            { label: displayName(manufacturer.names) },
          ]}
        />
        <EntityHeader entity={manufacturer} eyebrow="Manufacturer" />
        <EntityFacts>
          <EntityFact label="Description" value={manufacturer.description} />
          <EntityFact
            label="Founded"
            value={(manufacturer.founded as { value?: string } | undefined)?.value}
          />
          <EntityFact label="Origin" value={manufacturer.origin} />
          <EntityFact label="Headquarters" value={manufacturer.headquarters} />
          <EntityFact label="Company type" value={manufacturer.company_type} />
        </EntityFacts>
        <section className="space-y-4" aria-labelledby="manufacturer-brands">
          <h2 id="manufacturer-brands" className="text-2xl font-semibold">
            Associated brands
          </h2>
          {brands.length ? (
            <div className="flex flex-wrap gap-2">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  className="rounded-full border px-3 py-1 text-sm hover:bg-accent"
                  href={`/brands/${slugFor(brand)}`}
                >
                  {displayName(brand.names)}
                </Link>
              ))}
            </div>
          ) : (
            <UnknownState label="No brands connected to this manufacturer" />
          )}
        </section>
        <section className="space-y-4" aria-labelledby="manufacturer-vehicles">
          <h2 id="manufacturer-vehicles" className="text-2xl font-semibold">
            Vehicles
          </h2>
          {vehicles.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          ) : (
            <UnknownState label="No vehicles connected to this manufacturer" />
          )}
        </section>
        <section className="space-y-4" aria-labelledby="manufacturer-events">
          <h2 id="manufacturer-events" className="text-2xl font-semibold">
            Related events
          </h2>
          <Timeline events={manufacturerRepository.getRelatedEvents(manufacturer.id)} />
        </section>
        <section className="space-y-4" aria-labelledby="manufacturer-news">
          <h2 id="manufacturer-news" className="text-2xl font-semibold">
            Related news
          </h2>
          <RelatedNewsList documents={manufacturerRepository.getRelatedNews(manufacturer.id)} />
        </section>
        <section className="space-y-4" aria-labelledby="manufacturer-sources">
          <h2 id="manufacturer-sources" className="text-2xl font-semibold">
            Sources
          </h2>
          <SourceList sources={manufacturerRepository.getRelatedSources(manufacturer.id)} />
        </section>
      </div>
    </PageContainer>
  );
}
